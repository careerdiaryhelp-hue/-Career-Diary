// Safe Firebase Configuration & Firestore REST/Client Service
// Avoids top-level Firebase JS SDK imports on the server to prevent Cloudflare Worker EvalError (protobufjs)

const firebaseConfig = {
  apiKey: "AIzaSyAMHGJCN8vrmPWZxD2zw-KsXr89DwZBKdM",
  authDomain: "careerdiary-f2e0a.firebaseapp.com",
  projectId: "careerdiary-f2e0a",
  storageBucket: "careerdiary-f2e0a.firebasestorage.app",
  messagingSenderId: "979268861335",
  appId: "1:979268861335:web:d49589be2bbb82e31798d2",
  measurementId: "G-H3WLGYXSW0"
};

// Client-side Firestore instance getter (loaded dynamically in browser)
let _dbInstance = null;
async function getClientDb() {
  if (typeof window === 'undefined') return null;
  if (_dbInstance) return _dbInstance;
  const { initializeApp, getApps, getApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _dbInstance = getFirestore(app);
  return _dbInstance;
}

// Helper to sanitize Firestore document IDs (no forward slashes, no spaces)
export function cleanJobId(id) {
  if (!id) return '';
  return String(id)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── localStorage pending queue for failed Firestore saves ───
const PENDING_SAVES_KEY = 'career_diary_pending_firestore_saves';

function getPendingSaves() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_SAVES_KEY) || '[]');
  } catch (_) { return []; }
}

function addPendingSave(job) {
  try {
    const pending = getPendingSaves().filter(j => j.id !== job.id);
    pending.push(job);
    localStorage.setItem(PENDING_SAVES_KEY, JSON.stringify(pending));
  } catch (_) {}
}

function removePendingSave(jobId) {
  try {
    const pending = getPendingSaves().filter(j => j.id !== jobId);
    localStorage.setItem(PENDING_SAVES_KEY, JSON.stringify(pending));
  } catch (_) {}
}

// Retry pending Firestore saves (called on app load / after successful save)
export async function retryPendingSaves() {
  if (typeof window === 'undefined') return;
  const pending = getPendingSaves();
  if (pending.length === 0) return;
  console.log(`[Firestore] Retrying ${pending.length} pending saves...`);
  for (const job of pending) {
    const res = await publishJobToFirestore(job, /* skipQueue */ true);
    if (res.success) {
      console.log(`[Firestore] ✅ Pending save succeeded for: ${job.id}`);
    }
  }
}

// Save or publish a job to Firestore (client-side only) — with retry & backoff
export async function publishJobToFirestore(job, skipQueue = false) {
  const rawId = job.id || job.slug || job.title || '';
  const safeId = cleanJobId(rawId);
  if (!safeId) {
    return { success: false, error: new Error('Invalid Job ID: Post title or slug must contain letters or numbers.') };
  }
  const { _ts, _safeId, _normTitle, ...cleanData } = job;
  const nowIso = new Date().toISOString();
  const safeJob = {
    ...cleanData,
    id: safeId,
    slug: safeId,
    updatedAt: nowIso
  };

  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const db = await getClientDb();
      if (!db) throw new Error('Firestore is only available in browser');
      const { doc, setDoc } = await import('firebase/firestore');
      const jobRef = doc(db, 'jobs', safeId);
      await setDoc(jobRef, safeJob, { merge: true });
      // Success — remove from pending queue if it was there
      removePendingSave(safeId);
      return { success: true, cleanId: safeId };
    } catch (error) {
      lastError = error;
      const errMsg = String(error?.message || error?.code || '').toLowerCase();
      const isQuotaError = errMsg.includes('quota') || errMsg.includes('resource-exhausted') || errMsg.includes('429') || errMsg.includes('unavailable');
      if (isQuotaError && attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.warn(`[Firestore] Quota error on attempt ${attempt + 1}, retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        break;
      }
    }
  }

  // All retries failed — queue for later retry
  console.error('Error publishing job to Firestore after retries:', lastError);
  if (!skipQueue) {
    addPendingSave(safeJob);
    console.log(`[Firestore] 📋 Queued "${safeId}" for later retry (${getPendingSaves().length} pending)`);
  }
  return { success: false, error: lastError, queued: !skipQueue };
}

// Delete a job from Firestore (client-side only)
export async function deleteJobFromFirestore(jobId) {
  try {
    const safeId = cleanJobId(jobId);
    if (!safeId) return { success: false, error: 'Invalid Job ID' };
    const db = await getClientDb();
    if (!db) throw new Error('Firestore is only available in browser');
    const { doc, deleteDoc } = await import('firebase/firestore');
    const jobRef = doc(db, 'jobs', safeId);
    await deleteDoc(jobRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting job from Firestore:', error);
    return { success: false, error };
  }
}

// Real-time listener for Firestore Breaking News Settings (client-side only)
export function subscribeToBreakingNews(onUpdate) {
  if (typeof window === 'undefined') return () => {};
  let unsubPublic = null;
  let unsubSettings = null;

  getClientDb().then(async (db) => {
    if (!db) return;
    try {
      const { doc, onSnapshot } = await import('firebase/firestore');

      // 1. Listen to public doc in jobs collection (accessible to all unauthenticated visitors)
      const publicRef = doc(db, 'jobs', 'settings_breakingNews');
      unsubPublic = onSnapshot(publicRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items) && data.items.length > 0) {
            onUpdate(data.items);
            return;
          }
        }
      }, () => {});

      // 2. Also listen to settings/breakingNews (works for admin sessions)
      const newsRef = doc(db, 'settings', 'breakingNews');
      unsubSettings = onSnapshot(newsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items) && data.items.length > 0) {
            onUpdate(data.items);
          }
        }
      }, () => {});
    } catch (e) {
      console.warn('Could not subscribe to breaking news:', e);
    }
  });

  return () => {
    if (typeof unsubPublic === 'function') unsubPublic();
    if (typeof unsubSettings === 'function') unsubSettings();
  };
}

// Save breaking news array to Firestore (client-side only)
export async function saveBreakingNewsToFirestore(items) {
  try {
    const db = await getClientDb();
    if (!db) throw new Error('Firestore is only available in browser');
    const { doc, setDoc } = await import('firebase/firestore');

    // Save to settings/breakingNews
    try {
      const newsRef = doc(db, 'settings', 'breakingNews');
      await setDoc(newsRef, { items, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Could not save to settings/breakingNews:', e);
    }

    // ALSO save to public jobs/settings_breakingNews so ALL visitors can read it
    try {
      const publicRef = doc(db, 'jobs', 'settings_breakingNews');
      await setDoc(publicRef, { 
        id: 'settings_breakingNews',
        items, 
        updatedAt: new Date().toISOString(),
        isSystemDoc: true 
      }, { merge: true });
    } catch (e) {
      console.warn('Could not save to jobs/settings_breakingNews:', e);
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving breaking news:', error);
    return { success: false, error };
  }
}

// Real-time listener for Firestore jobs (client-side only)
export function subscribeToFirestoreJobs(onUpdate, onError, maxJobs = 150) {
  if (typeof window === 'undefined') return () => {};
  let unsubscribe = null;
  let active = true;

  getClientDb().then(async (db) => {
    if (!db || !active) return;
    try {
      const { collection, onSnapshot, query, orderBy, limit } = await import('firebase/firestore');
      const jobsCol = collection(db, 'jobs');
      const q = query(jobsCol, orderBy('updatedAt', 'desc'), limit(maxJobs));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = [];
        snapshot.forEach((d) => {
          posts.push(d.data());
        });
        onUpdate(posts);
      }, (err) => {
        console.warn('Firestore subscription error (fallback to local data):', err);
        if (onError) onError(err);
      });
    } catch (e) {
      console.warn('Could not subscribe to Firestore:', e);
      if (onError) onError(e);
    }
  });

  return () => {
    active = false;
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

function parseFirestoreValue(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(parseFirestoreValue);
  if ('mapValue' in val) {
    const res = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      res[k] = parseFirestoreValue(v);
    }
    return res;
  }
  if ('nullValue' in val) return null;
  return null;
}

function parseFirestoreDoc(doc) {
  const data = {};
  for (const [key, value] of Object.entries(doc.fields || {})) {
    data[key] = parseFirestoreValue(value);
  }
  const id = doc.name.split('/').pop();
  return { id, ...data };
}

let memoryCache = {
  data: null,
  timestamp: 0,
  quotaExceededUntil: 0,
};

const FIRESTORE_LIST_FIELDS = [
  'id', 'slug', 'title', 'category', 'secondaryCategories', 'badge', 'postDate', 'updatedAt',
  'displayOrder', 'order', 'pinned', 'state', 'qualification', 'vacancies',
  'totalPosts', 'appStart', 'lastDate', 'examDate', 'feeGen', 'feeSc', 'minAge', 'maxAge',
  'shortInfo', 'description', 'uniqueDescription', 'officialUrl', 'notificationUrl',
  'applyUrl', 'importantDates', 'important_dates', 'applicationFee', 'ageLimit',
  'vacancyDetails', 'importantLinks', 'important_links', 'isLatest', 'isLatestUpdate', 'latestOrder',
  'isFeatured', 'isTopCard', 'featured', 'featuredOrder', 'bannerColor', 'status', 'isBreakingNews', 'isTopForm'
];
const MASK_QUERY = FIRESTORE_LIST_FIELDS.map(f => `mask.fieldPaths=${encodeURIComponent(f)}`).join('&');

let pendingFetch = null;

// Fetch all jobs once (fast REST fetch with field masking, quota backoff, and concurrency lock)
export async function fetchFirestoreJobsOnce() {
  const now = Date.now();
  if (now < memoryCache.quotaExceededUntil) {
    return memoryCache.data || [];
  }
  if (memoryCache.data && (now - memoryCache.timestamp < 60000)) {
    return memoryCache.data;
  }
  if (pendingFetch) {
    return pendingFetch;
  }

  pendingFetch = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const url = `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents:runQuery`;
      
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'jobs' }],
          orderBy: [{ field: { fieldPath: 'updatedAt' }, direction: 'DESCENDING' }],
          limit: 60,
          select: { fields: FIRESTORE_LIST_FIELDS.map(f => ({ fieldPath: f })) }
        }
      };

      // Add cf-specific cache options to leverage Cloudflare CDN Cache API if available
      const res = await fetch(url, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody),
        signal: controller.signal, 
        cf: { cacheTtl: 120, cacheEverything: true }
      });
      clearTimeout(timeoutId);

      if (res.status === 429 || res.status === 403) {
        // Firebase daily quota reached - back off for 30 minutes to prevent resource limits error
        memoryCache.quotaExceededUntil = Date.now() + (30 * 60 * 1000);
        console.warn('Firebase Firestore quota exceeded (429). Using static data fallback for 30m.');
        return memoryCache.data || [];
      }

      if (!res.ok) {
        throw new Error(`Firestore REST error: ${res.statusText}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        return memoryCache.data || [];
      }
      
      const parsed = data
        .filter(item => item && item.document)
        .map(item => parseFirestoreDoc(item.document));
        
      memoryCache = {
        data: parsed,
        timestamp: Date.now(),
        quotaExceededUntil: 0,
      };
      return parsed;
    } catch (e) {
      const isRateLimit = String(e.message || '').includes('429') || String(e.message || '').includes('Too Many');
      if (isRateLimit) {
        memoryCache.quotaExceededUntil = Date.now() + (30 * 60 * 1000);
      }
      if (memoryCache.data) return memoryCache.data;
      return [];
    } finally {
      pendingFetch = null;
    }
  })();

  return pendingFetch;
}

const DOC_MEM_CACHE = new Map();

// Fetch a single document by ID from Firestore (includes full HTML content, ~30KB)
export async function fetchFirestoreJobById(docId) {
  if (!docId) return null;
  const clean = cleanJobId(docId);
  const now = Date.now();
  const cached = DOC_MEM_CACHE.get(clean);
  if (cached && (now - cached.time < 300000)) {
    return cached.data;
  }
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs/${clean}?key=${firebaseConfig.apiKey}`,
      { 
        cf: { cacheTtl: 300, cacheEverything: true }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const parsed = parseFirestoreDoc(data);
    if (parsed) {
      DOC_MEM_CACHE.set(clean, { time: now, data: parsed });
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

// Fetch Breaking News array from Firestore REST (server-side support)
export async function fetchBreakingNewsServer() {
  try {
    // 1. Try public jobs/settings_breakingNews first
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs/settings_breakingNews`,
      { 
        cf: { cacheTtl: 60, cacheEverything: true }
      }
    );
    if (res.ok) {
      const data = await res.json();
      const doc = parseFirestoreDoc(data);
      if (Array.isArray(doc.items) && doc.items.length > 0) {
        return doc.items;
      }
    }
  } catch (e) {}

  return [];
}

// Fetch jobs marked with isTopForm: true directly from Firestore REST
export async function fetchTopOnlineFormsServer() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const url = `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents:runQuery`;
    const query = {
      structuredQuery: {
        from: [{ collectionId: 'jobs' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'isTopForm' },
            op: 'EQUAL',
            value: { booleanValue: true }
          }
        },
        limit: 50
      }
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
      signal: controller.signal,
      cf: { cacheTtl: 60, cacheEverything: true }
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter(item => item && item.document)
      .map(item => parseFirestoreDoc(item.document));
  } catch (e) {
    console.warn('Error fetching top online forms from Firestore:', e);
    return [];
  }
}

// Real-time listener for Top Online Forms (client-side only)
export function subscribeToTopForms(onUpdate) {
  if (typeof window === 'undefined') return () => {};
  let unsubscribe = null;
  let active = true;

  getClientDb().then(async (db) => {
    if (!db || !active) return;
    try {
      const { collection, onSnapshot, query, where, limit } = await import('firebase/firestore');
      const jobsCol = collection(db, 'jobs');
      const q = query(jobsCol, where('isTopForm', '==', true), limit(50));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = [];
        snapshot.forEach((d) => {
          posts.push(d.data());
        });
        onUpdate(posts);
      }, (err) => {
        console.warn('Top forms snapshot error:', err);
      });
    } catch (e) {
      console.warn('Could not subscribe to top forms:', e);
    }
  });

  return () => {
    active = false;
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}



