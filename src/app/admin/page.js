'use client';

import React, { useState, useEffect } from 'react';
import AdminDashboardPage from '../../views/AdminDashboardPage';
import AdminLoginPage from '../../views/AdminLoginPage';
import { getInitialJobs } from '../../data/initialJobs';
import { mergeAndSortJobs } from '../../utils/jobsService';
import {
  publishJobToFirestore,
  deleteJobFromFirestore,
  subscribeToFirestoreJobs,
  cleanJobId,
  subscribeToBreakingNews,
  saveBreakingNewsToFirestore
} from '../../firebase';

const DEFAULT_CATEGORIES = [
  { id: '3', name: 'Latest Jobs', subtitle: 'Latest Job 2026 @Careerdiary', slug: '/latest-jobs', order: 1, seoTitle: 'Latest Jobs 2026', seoDescription: 'Latest Government Jobs, Notifications, Apply Online...' },
  { id: '2', name: 'Admit Card', subtitle: 'Latest Exams Admit Card 2026 - Download Admit Card ,Exam Date& Online | [Career Diary 2026]', slug: '/admit-card', order: 2, seoTitle: 'Admit Cards 2026', seoDescription: 'Get the latest updates on admit cards and hall tickets. Download your exam call letters for SSC, Banking, Railways, and...' },
  { id: '1', name: 'Results', subtitle: 'Latest Exam Results 2026 - Check Merit Lists & Cut-Off Marks Online | [Career Diary 2026]', slug: '/results', order: 3, seoTitle: 'Results 2026', seoDescription: 'Download the [Result Pdf] All Result 2026 here. Download," "Direct Link," "Live," "Official." Get the direct link, exam date,...' },
  { id: '4', name: 'Answer Key', subtitle: 'Official Answer Keys', slug: '/answer-key', order: 4, seoTitle: 'Answer Key 2026', seoDescription: 'Download official answer keys and response sheets...' },
  { id: '5', name: 'Syllabus', subtitle: 'Exam Syllabus & Pattern', slug: '/syllabus', order: 5, seoTitle: 'Exam Syllabus 2026', seoDescription: 'Detailed exam syllabus and selection process...' },
  { id: '6', name: 'Admission', subtitle: 'Admission Notices', slug: '/admission', order: 6, seoTitle: 'Admissions 2026', seoDescription: 'College, University, and School admissions 2026...' },
];

// Removed DEFAULT_BREAKING_NEWS so it's fully dynamic

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [breakingNews, setBreakingNews] = useState([]);

  useEffect(() => {
    // Check admin authentication
    const searchParams = new URLSearchParams(window.location.search);
    const hasAdminParam = searchParams.get('admin') === 'true' || searchParams.get('admin') === 'secret';
    const isSavedAdmin = localStorage.getItem('career_diary_admin') === 'true';

    if (hasAdminParam || isSavedAdmin) {
      setIsAdmin(true);
    }
    setIsLoaded(true);

    // Read stored categories & news
    try {
      const storedCats = localStorage.getItem('career_diary_categories');
      if (storedCats) {
        const parsed = JSON.parse(storedCats);
        if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
      }
    } catch (_) {}

    // Subscribe to Firestore jobs and load static jobs
    let active = true;
    getInitialJobs().then(staticJobs => {
      if (!active) return;
      setJobs(prev => mergeAndSortJobs(prev, staticJobs));
    });

    const unsubscribe = subscribeToFirestoreJobs((firestorePosts) => {
      if (Array.isArray(firestorePosts) && firestorePosts.length > 0) {
        getInitialJobs().then(staticJobs => {
          if (active) setJobs(() => mergeAndSortJobs(firestorePosts, staticJobs));
        });
      }
    });

    const unsubNews = subscribeToBreakingNews((newsData) => {
      if (active) {
        setBreakingNews(newsData);
        if (Array.isArray(newsData) && newsData.length > 0) {
          saveBreakingNewsToFirestore(newsData);
        }
      }
    });

    return () => {
      active = false;
      if (typeof unsubscribe === 'function') unsubscribe();
      if (typeof unsubNews === 'function') unsubNews();
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('career_diary_admin', 'true');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.setItem('career_diary_admin', 'false');
    window.location.href = '/';
  };

  const handleAddJob = async (newJob) => {
    const rawId = newJob.id || newJob.slug || newJob.title || '';
    const safeId = cleanJobId(rawId);
    const { _ts, _safeId, _normTitle, ...cleanJob } = newJob;
    const nowIso = new Date().toISOString();
    const sanitizedJob = {
      ...cleanJob,
      id: safeId,
      slug: safeId,
      updatedAt: nowIso
    };

    setJobs((prevJobs) => {
      const filtered = prevJobs.filter(j => j.id !== safeId && j.id !== newJob.id);
      return mergeAndSortJobs([sanitizedJob, ...filtered], []);
    });

    try {
      const res = await publishJobToFirestore(sanitizedJob);
      if (res && res.error) throw res.error;
      return { success: true, cleanId: safeId };
    } catch (err) {
      console.error('Firestore publish error:', err);
      return { success: false, error: err };
    }
  };

  const handleDeleteJob = async (id) => {
    const safeId = cleanJobId(id);
    setJobs(jobs.filter(j => j.id !== id && j.id !== safeId));
    try {
      await deleteJobFromFirestore(safeId || id);
    } catch (err) {
      console.error('Firestore delete error:', err);
    }
  };

  const handleSaveCategories = (newCats) => {
    setCategories(newCats);
    try {
      localStorage.setItem('career_diary_categories', JSON.stringify(newCats));
    } catch (_) {}
  };

  const handleSaveBreakingNews = async (newNews) => {
    setBreakingNews(newNews);
    try {
      await saveBreakingNewsToFirestore(newNews);
    } catch (_) {}
  };

  if (!isLoaded) return null;

  if (!isAdmin) {
    return (
      <AdminLoginPage
        onLoginSuccess={handleLoginSuccess}
        onLogin={handleLoginSuccess}
        onCancel={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  return (
    <AdminDashboardPage
      jobs={jobs}
      onAddJob={handleAddJob}
      onDeleteJob={handleDeleteJob}
      onLogout={handleLogout}
      categories={categories}
      onSaveCategories={handleSaveCategories}
      breakingNews={breakingNews}
      onSaveBreakingNews={handleSaveBreakingNews}
    />
  );
}
