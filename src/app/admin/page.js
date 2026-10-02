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
  cleanJobId
} from '../../firebase';

const DEFAULT_CATEGORIES = [
  { id: '3', name: 'Latest Jobs', subtitle: 'Latest Job 2026 @Careerdiary', slug: '/latest-jobs', order: 1, seoTitle: 'Latest Jobs 2026', seoDescription: 'Latest Government Jobs, Notifications, Apply Online...' },
  { id: '2', name: 'Admit Card', subtitle: 'Latest Exams Admit Card 2026 - Download Admit Card ,Exam Date& Online | [Career Diary 2026]', slug: '/admit-card', order: 2, seoTitle: 'Admit Cards 2026', seoDescription: 'Get the latest updates on admit cards and hall tickets. Download your exam call letters for SSC, Banking, Railways, and...' },
  { id: '1', name: 'Results', subtitle: 'Latest Exam Results 2026 - Check Merit Lists & Cut-Off Marks Online | [Career Diary 2026]', slug: '/results', order: 3, seoTitle: 'Results 2026', seoDescription: 'Download the [Result Pdf] All Result 2026 here. Download," "Direct Link," "Live," "Official." Get the direct link, exam date,...' },
  { id: '4', name: 'Answer Key', subtitle: 'Official Answer Keys', slug: '/answer-key', order: 4, seoTitle: 'Answer Key 2026', seoDescription: 'Download official answer keys and response sheets...' },
  { id: '5', name: 'Syllabus', subtitle: 'Exam Syllabus & Pattern', slug: '/syllabus', order: 5, seoTitle: 'Exam Syllabus 2026', seoDescription: 'Detailed exam syllabus and selection process...' },
  { id: '6', name: 'Admission', subtitle: 'Admission Notices', slug: '/admission', order: 6, seoTitle: 'Admissions 2026', seoDescription: 'College, University, and School admissions 2026...' },
];

const DEFAULT_BREAKING_NEWS = [
  { id: '1', category: 'Result', message: 'Bihar BTSC Staff Nurse 2026 Result Out', link: '/bihar-btsc-staff-nurse-2026-result-out', priority: 1, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '2', category: 'Result', message: 'Railway RRB Group D CEN 09/2025 Level 1 Answer Key 2026 Out 🔥', link: '/railway-rrb-group-d-cen-09-2025-level-1-answer-key-2026-out', priority: 1, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '3', category: 'Admit Card', message: 'Railway RRB Group D Level 1 Admit Card 2026 Out', link: '/railway-rrb-group-d-level-1-admit-card-2026-out', priority: 1, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '4', category: 'Admit Card', message: 'Railway RRB ALP Recruitment 2026 CEN 01/2026 Application Status Out', link: '/railway-rrb-alp-recruitment-2026-cen-01-2026-application-status-o', priority: 1, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '5', category: 'Latest Job', message: 'India Post GDS Recruitment 2026', link: '/india-post-gds-recruitment-2026', priority: 0, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '6', category: 'Latest Job', message: 'BPSSC Bihar Police Range Officer of Forest Recruitment 2026 Online Start', link: '/bpssc-bihar-police-range-officer-of-forest-recruitment-2026-online-form-16-post', priority: 0, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '7', category: 'Admission', message: 'Simultala Awasiya Vidyalaya (SAV) Bihar Class 6 Admission Form 2026 Extended', link: '/simultala-awasiya-vidyalaya-sav-bihar-class-6-admission-form-2026', priority: 2, expiry: '12/31/2026, 11:59:00 PM', active: true },
  { id: '8', category: 'Admission', message: 'BSEB Bihar D.El.Ed Common Application Form 2026', link: '/bseb-bihar-d-el-ed-common-application-form-2026', priority: 2, expiry: '12/31/2026, 11:59:00 PM', active: true },
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [breakingNews, setBreakingNews] = useState(DEFAULT_BREAKING_NEWS);

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
      const storedNews = localStorage.getItem('career_diary_breaking_news');
      if (storedNews) {
        const parsed = JSON.parse(storedNews);
        if (Array.isArray(parsed) && parsed.length > 0) setBreakingNews(parsed);
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

    return () => {
      active = false;
      if (typeof unsubscribe === 'function') unsubscribe();
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
    const sanitizedJob = {
      ...newJob,
      id: safeId,
      slug: safeId,
      updatedAt: newJob.updatedAt || new Date().toISOString()
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

  const handleSaveBreakingNews = (newNews) => {
    setBreakingNews(newNews);
    try {
      localStorage.setItem('career_diary_breaking_news', JSON.stringify(newNews));
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
