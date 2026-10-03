'use client';

import React from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import JobDetailPage from '../views/JobDetailPage';

export default function JobDetailWrapper({ job: initialJob, allJobs = [], slug = '' }) {
  const [job, setJob] = React.useState(initialJob);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const clean = String(slug || '').toLowerCase().trim();
    if (!clean) return;

    // Only fetch live Firestore document if content is missing or user is an admin
    const isAdminUser = typeof window !== 'undefined' && (
      localStorage.getItem('career_diary_admin') === 'true' ||
      window.location.search.includes('admin')
    );
    const needsFetch = !initialJob || (!initialJob.content && !initialJob.htmlContent) || isAdminUser;

    if (needsFetch) {
      import('../firebase').then(({ fetchFirestoreJobById }) => {
        fetchFirestoreJobById(clean).then(liveDoc => {
          if (liveDoc && (liveDoc.content || liveDoc.htmlContent || liveDoc.title)) {
            setJob(prev => {
              if (!prev) return liveDoc;
              const liveHasContent = Boolean(liveDoc.content || liveDoc.htmlContent);
              const prevHasContent = Boolean(prev.content || prev.htmlContent);
              const liveTs = new Date(liveDoc.updatedAt || 0).getTime();
              const prevTs = new Date(prev.updatedAt || 0).getTime();
              if ((liveHasContent && !prevHasContent) || liveTs >= prevTs) {
                return { ...prev, ...liveDoc };
              }
              return prev;
            });
          }
        }).catch(() => {});
      });
    }

    if (!job) {
      try {
        // Fallback: Try finding in allJobs with loose match
        const inAll = allJobs.find(j => {
          if (!j) return false;
          const id = String(j.id || '').toLowerCase();
          const s = String(j.slug || '').toLowerCase();
          return id === clean || s === clean || id.includes(clean) || clean.includes(id);
        });
        if (inAll) {
          setJob(inAll);
          return;
        }

        // Try finding in client cached firestore jobs
        const cached = localStorage.getItem('career_diary_cached_firestore_jobs');
        if (cached) {
          const posts = JSON.parse(cached);
          const inCache = posts.find(j => {
            if (!j) return false;
            const id = String(j.id || '').toLowerCase();
            const s = String(j.slug || '').toLowerCase();
            return id === clean || s === clean || id.includes(clean) || clean.includes(id);
          });
          if (inCache) {
            setJob(inCache);
            return;
          }
        }
      } catch (e) {}
    }
  }, [slug, allJobs]);

  if (!job) {
    return (
      <div className="app-root">
        <Header
          searchQuery={search}
          setSearchQuery={setSearch}
          onResetFilters={() => window.location.href = '/'}
        />
        <Navbar onNavigate={(path) => window.location.href = path} />
        <main className="main-content container" style={{ padding: '60px 20px', textAlign: 'center', minHeight: '500px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '36px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#1e293b', fontSize: '1.8rem', fontWeight: 800 }}>
              Post / Result Not Found
            </h2>
            <p style={{ color: '#64748b', marginTop: '12px', lineHeight: 1.6 }}>
              Yeh link abhi available nahi hai ya update process me hai. Aap search karke ya category se check kar sakte hain.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (search.trim()) window.location.href = '/?q=' + encodeURIComponent(search.trim());
              }}
              style={{ display: 'flex', gap: '8px', marginTop: '20px', marginBottom: '20px' }}
            >
              <input
                type="text"
                placeholder="Search jobs, results, admit cards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#d81b60', color: '#fff', border: 'none', padding: '0 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Search
              </button>
            </form>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/" className="btn btn-primary" style={{ backgroundColor: '#d81b60', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                Back to Home
              </a>
              <a href="/results" style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                Latest Results
              </a>
              <a href="/latest-jobs" style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                Latest Jobs
              </a>
            </div>
          </div>
        </main>
        <Footer />

        {/* Floating Action Buttons */}
        <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="floating-btn float-whatsapp">
          Join WhatsApp
        </a>
        <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="floating-btn float-telegram">
          Join Telegram
        </a>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header
        searchQuery=""
        setSearchQuery={(q) => {
          if (q) window.location.href = '/?q=' + encodeURIComponent(q);
        }}
        onResetFilters={() => {
          window.location.href = '/';
        }}
      />
      <Navbar
        currentCategory="all"
        setCurrentCategory={() => {}}
        onNavigate={(path) => {
          window.location.href = path;
        }}
      />
      <main className="main-content">
        <JobDetailPage
          job={job}
          allJobs={allJobs}
          onBack={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = '/';
            }
          }}
          onSelectJob={(id) => {
            const target = String(id || '').startsWith('/') ? id : '/' + id;
            window.location.href = target;
          }}
        />
      </main>
      <Footer />

      {/* Floating Action Buttons */}
      <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="floating-btn float-whatsapp">
        Join WhatsApp
      </a>
      <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="floating-btn float-telegram">
        Join Telegram
      </a>
    </div>
  );
}
