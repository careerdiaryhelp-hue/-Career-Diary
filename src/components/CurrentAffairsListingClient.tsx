'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { DisplayAd, SidebarAd, InFeedAd } from './AdSenseBanner';
import { subscribeToCurrentAffairs } from '../firebase';
import {
  Calendar, Search, Newspaper, ArrowRight, Share2, Sparkles, BookOpen,
  CheckCircle2, Clock, Flame, Tag, HelpCircle
} from 'lucide-react';

interface CurrentAffairsPost {
  id: string;
  slug: string;
  title: string;
  date?: string;
  postDate?: string;
  category?: string;
  description?: string;
  status?: string;
  views?: number;
  tags?: string[];
  content?: string;
  updatedAt?: string;
}

export default function CurrentAffairsListingClient({ initialPosts = [] }: { initialPosts: CurrentAffairsPost[] }) {
  const [posts, setPosts] = useState<CurrentAffairsPost[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    // Subscribe to Firestore for real-time live updates
    const unsubscribe = subscribeToCurrentAffairs(
      (livePosts) => {
        if (Array.isArray(livePosts) && livePosts.length > 0) {
          setPosts(prev => {
            const merged = [...livePosts];
            const seen = new Set(livePosts.map(p => p.id || p.slug));
            prev.forEach(p => {
              const key = p.id || p.slug;
              if (!seen.has(key)) merged.push(p);
            });
            return merged;
          });
        }
      },
      (err) => console.warn('Current affairs live update error:', err)
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const categories = ['ALL', 'Daily Current Affairs', 'Monthly Current Affairs', 'GK Questions', 'Exam Special'];

  const filteredPosts = posts.filter((post) => {
    if (!post || post.status === 'Draft') return false;
    const matchesSearch =
      !searchQuery.trim() ||
      (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.date && post.date.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      (post.category && post.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Header />
      <Navbar currentCategory="CURRENT_AFFAIRS" />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '16px 16px 40px' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
          <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</a>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Current Affairs 2026</span>
        </div>

        {/* Top AdSense Display Ad */}
        <div style={{ marginBottom: '20px' }}>
          <DisplayAd label="ADVERTISEMENT" />
        </div>

        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 50%, #0369a1 100%)',
            borderRadius: '16px',
            padding: '28px 24px',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#fef08a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Flame size={14} color="#f59e0b" /> Daily Live GK & Current Affairs
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.25 }}>
              Today Current Affairs & GK Questions 2026
            </h1>
            <p style={{ margin: 0, fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', color: '#e0f2fe', maxWidth: '800px', lineHeight: 1.6 }}>
              दैनिक समसामयिकी (Current Affairs), राष्ट्रीय एवं अंतर्राष्ट्रीय घटनाक्रम, योजनाएं, खेलकूद, पुरस्कार तथा प्रतियोगी परीक्षाओं (SSC, BSSC, Railway, Banking, UPSC) के लिए महत्वपूर्ण बहुविकल्पीय प्रश्न (MCQs) विस्तृत उत्तर सहित।
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by topic, date, or exam name (e.g., 25 October, SSC, Nobel Prize)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: active ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: active ? '#2563eb' : '#ffffff',
                    color: active ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat === 'ALL' ? '🌐 All Topics' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Layout with Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: '24px' }} className="ca-grid-layout">
          {/* Left Column: Posts List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Newspaper size={18} color="#2563eb" />
                <span>Latest Current Affairs Updates ({filteredPosts.length})</span>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <HelpCircle size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
                <h3 style={{ margin: '0 0 6px', color: '#0f172a' }}>No Current Affairs found</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Try searching with a different date, keyword, or filter.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredPosts.map((post, idx) => {
                  const slug = post.slug || post.id;
                  const postUrl = `/current-affairs/${slug}`;

                  return (
                    <React.Fragment key={post.id || slug}>
                      <article
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          padding: '20px 22px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                      >
                        {/* Meta Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                          <span
                            style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Tag size={12} /> {post.category || 'Daily Current Affairs'}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                            <Calendar size={14} />
                            <span>{post.date || post.postDate || 'Live'}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.4 }}>
                          <a
                            href={postUrl}
                            style={{
                              color: '#0f172a',
                              textDecoration: 'none',
                              transition: 'color 0.15s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                          >
                            {post.title}
                          </a>
                        </h2>

                        {/* Short Excerpt */}
                        {post.description && (
                          <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                            {post.description}
                          </p>
                        )}

                        {/* Tags & Action Button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(post.tags || ['Current Affairs', 'GK MCQs']).map((t) => (
                              <span key={t} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                                #{t}
                              </span>
                            ))}
                          </div>

                          <a
                            href={postUrl}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#2563eb',
                              color: '#ffffff',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
                          >
                            <span>Read Questions & Answers</span>
                            <ArrowRight size={14} />
                          </a>
                        </div>
                      </article>

                      {/* In-feed Ad after every 3 items */}
                      {(idx + 1) % 3 === 0 && (
                        <div style={{ margin: '8px 0' }}>
                          <InFeedAd label="SPONSORED" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Social Community Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>
                📱 Get Daily GK on Telegram
              </h3>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.88rem', color: '#e0f2fe', lineHeight: 1.5 }}>
                Join our Telegram channel to receive daily current affairs PDFs, exam quizzes, and answer keys instantly.
              </p>
              <a
                href="https://telegram.me/careerdiary"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  background: '#ffffff',
                  color: '#0369a1',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxSizing: 'border-box'
                }}
              >
                Join Telegram Channel
              </a>
            </div>

            {/* Sidebar AdSense Ad */}
            <SidebarAd label="ADVERTISEMENT" />

            {/* Quick Links / Exam Categories */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '18px 20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <h3 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Exam Prep Sections
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="/latest-jobs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155', textDecoration: 'none', fontSize: '0.9rem', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>💼 Latest Govt Jobs 2026</span>
                  <ArrowRight size={14} color="#94a3b8" />
                </a>
                <a href="/admit-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155', textDecoration: 'none', fontSize: '0.9rem', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>🎟️ Admit Cards 2026</span>
                  <ArrowRight size={14} color="#94a3b8" />
                </a>
                <a href="/results" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155', textDecoration: 'none', fontSize: '0.9rem', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>🏆 Sarkari Results & Cutoff</span>
                  <ArrowRight size={14} color="#94a3b8" />
                </a>
                <a href="/syllabus" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155', textDecoration: 'none', fontSize: '0.9rem', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>📚 Exam Syllabus & Pattern</span>
                  <ArrowRight size={14} color="#94a3b8" />
                </a>
                <a href="/study-quiz" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155', textDecoration: 'none', fontSize: '0.9rem', padding: '6px 0' }}>
                  <span>🎯 Online GK Mock Tests</span>
                  <ArrowRight size={14} color="#94a3b8" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @media (max-width: 860px) {
          .ca-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
