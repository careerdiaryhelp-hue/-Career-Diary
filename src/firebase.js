// Firebase Configuration and Firestore Initialization for Career Diary
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
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
