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

// Save or publish a job to Firestore
export async function publishJobToFirestore(job) {
  try {
    const jobRef = doc(db, 'jobs', job.id);
    await setDoc(jobRef, {
      ...job,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error publishing job to Firestore:', error);
    return { success: false, error };
  }
}

// Delete a job from Firestore
export async function deleteJobFromFirestore(jobId) {
  try {
    const jobRef = doc(db, 'jobs', jobId);
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
