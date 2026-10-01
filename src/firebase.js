import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMHGJCN8vrmPWZxD2zw-KsXr89DwZBKdM",
  authDomain: "careerdiary-f2e0a.firebaseapp.com",
  projectId: "careerdiary-f2e0a",
  storageBucket: "careerdiary-f2e0a.firebasestorage.app",
  messagingSenderId: "979268861335",
  appId: "1:979268861335:web:d49589be2bbb82e31798d2",
  measurementId: "G-H3WLGYXSW0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper to sanitize Firestore document IDs (no forward slashes, no spaces)
export function cleanJobId(id) {
  if (!id) return '';
  return String(id)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Save or publish a job to Firestore
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
    const jobRef = doc(db, 'jobs', safeId);
    await setDoc(jobRef, safeJob, { merge: true });
    return { success: true, cleanId: safeId };
  } catch (error) {
    console.error('Error publishing job to Firestore:', error);
    return { success: false, error };
  }
}

// Delete a job from Firestore
export async function deleteJobFromFirestore(jobId) {
  try {
    const safeId = cleanJobId(jobId);
    if (!safeId) return { success: false, error: 'Invalid Job ID' };
    const jobRef = doc(db, 'jobs', safeId);
    await deleteDoc(jobRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting job from Firestore:', error);
    return { success: false, error };
  }
}

// Real-time listener for Firestore jobs
export function subscribeToFirestoreJobs(onUpdate, onError) {
  try {
    const jobsCol = collection(db, 'jobs');
    return onSnapshot(jobsCol, (snapshot) => {
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
    return () => {};
  }
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
};

const FIRESTORE_LIST_FIELDS = [
  'id', 'slug', 'title', 'category', 'badge', 'postDate', 'updatedAt',
  'displayOrder', 'order', 'pinned', 'state', 'qualification', 'vacancies',
  'totalPosts', 'appStart', 'lastDate', 'feeGen', 'feeSc', 'minAge', 'maxAge',
  'shortInfo', 'description', 'uniqueDescription', 'officialUrl', 'notificationUrl',
  'applyUrl', 'importantDates', 'important_dates', 'applicationFee', 'ageLimit',
  'vacancyDetails', 'importantLinks', 'important_links', 'isLatest', 'isLatestUpdate',
  'isFeatured', 'isTopCard', 'bannerColor', 'status'
];
const MASK_QUERY = FIRESTORE_LIST_FIELDS.map(f => `mask.fieldPaths=${encodeURIComponent(f)}`).join('&');

// Fetch all jobs once (fast REST fetch with field masking to prevent >2MB cache error)
export async function fetchFirestoreJobsOnce() {
  const now = Date.now();
  if (memoryCache.data && (now - memoryCache.timestamp < 60000)) {
    return memoryCache.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const url = `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs?pageSize=100&${MASK_QUERY}`;
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 60 } });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`Firestore REST error: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) {
      return memoryCache.data || [];
    }
    const parsed = data.documents.map(parseFirestoreDoc);
    memoryCache = {
      data: parsed,
      timestamp: Date.now(),
    };
    return parsed;
  } catch (e) {
    console.warn('Could not fetch Firestore jobs via REST (falling back to client SDK or static):', e.message);
    if (memoryCache.data) return memoryCache.data;
    try {
      if (typeof window !== 'undefined') {
        const jobsCol = collection(db, 'jobs');
        const snapshot = await getDocs(jobsCol);
        const posts = [];
        snapshot.forEach((d) => {
          posts.push({ id: d.id, ...d.data() });
        });
        memoryCache = {
          data: posts,
          timestamp: Date.now(),
        };
        return posts;
      }
    } catch (innerErr) {
      console.warn('Client SDK fetch also failed:', innerErr);
    }
    return [];
  }
}

// Fetch a single document by ID from Firestore (includes full HTML content, ~30KB)
export async function fetchFirestoreJobById(docId) {
  if (!docId) return null;
  const clean = cleanJobId(docId);
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/careerdiary-f2e0a/databases/(default)/documents/jobs/${clean}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return parseFirestoreDoc(data);
  } catch (e) {
    return null;
  }
}


