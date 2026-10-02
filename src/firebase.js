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

// Save or publish a job to Firestore (client-side only)
export async function publishJobToFirestore(job) {
  try {
    const rawId = job.id || job.slug || job.title || '';
    const safeId = cleanJobId(rawId);
    if (!safeId) {
      throw new Error('Invalid Job ID: Post title or slug must contain letters or numbers.');
    }
    const safeJob = {
      ...job,
      id: safeId,
      slug: safeId,
      updatedAt: new Date().toISOString()
    };
    const db = await getClientDb();
    if (!db) throw new Error('Firestore is only available in browser');
    const { doc, setDoc } = await import('firebase/firestore');
    const jobRef = doc(db, 'jobs', safeId);
    await setDoc(jobRef, safeJob, { merge: true });
    return { success: true, cleanId: safeId };
  } catch (error) {
    console.error('Error publishing job to Firestore:', error);
    return { success: false, error };
  }
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
  let unsubscribe = null;
  getClientDb().then(async (db) => {
    if (!db) return;
    try {
      const { doc, onSnapshot } = await import('firebase/firestore');
      const newsRef = doc(db, 'settings', 'breakingNews');
      unsubscribe = onSnapshot(newsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onUpdate(data.items || []);
        } else {
          onUpdate([]);
        }
      });
    } catch (e) {
      console.warn('Could not subscribe to breaking news:', e);
    }
  });
  return () => {
    if (typeof unsubscribe === 'function') unsubscribe();
  };
}

// Save breaking news array to Firestore (client-side only)
export async function saveBreakingNewsToFirestore(items) {
  try {
    const db = await getClientDb();
    if (!db) throw new Error('Firestore is only available in browser');
    const { doc, setDoc } = await import('firebase/firestore');
    const newsRef = doc(db, 'settings', 'breakingNews');
    await setDoc(newsRef, { items, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving breaking news:', error);
    return { success: false, error };
  }
}

// Real-time listener for Firestore jobs (client-side only)
export function subscribeToFirestoreJobs(onUpdate, onError) {
  if (typeof window === 'undefined') return () => {};
  let unsubscribe = null;
  let active = true;

  getClientDb().then(async (db) => {
    if (!db || !active) return;
    try {
      const { collection, onSnapshot, query, orderBy, limit } = await import('firebase/firestore');
      const jobsCol = collection(db, 'jobs');
      const q = query(jobsCol, orderBy('updatedAt', 'desc'), limit(150));
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

// Fetch a single document by ID from Firestore (includes full HTML content, ~30KB)
export async function fetchFirestoreJobById(docId) {
  if (!docId) return null;
  const clean = cleanJobId(docId);
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs/${clean}`,
      { 
        cf: { cacheTtl: 120, cacheEverything: true }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return parseFirestoreDoc(data);
  } catch (e) {
    return null;
  }
}

// Fetch Breaking News array from Firestore REST (server-side support)
export async function fetchBreakingNewsServer() {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/settings/breakingNews`,
      { 
        cf: { cacheTtl: 120, cacheEverything: true }
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const doc = parseFirestoreDoc(data);
    return doc.items || [];
  } catch (e) {
    return [];
  }
}


