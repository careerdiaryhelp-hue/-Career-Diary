'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { DisplayAd, SquareAd } from './AdSenseBanner';
import { subscribeToPyq } from '../firebase';
import {
  Calendar, Search, BookOpen, ArrowRight, Sparkles,
  CheckCircle2, Clock, Flame, Tag, HelpCircle, Award, Send, GraduationCap
} from 'lucide-react';

interface PyqPost {
  id: string;
  slug: string;
  title: string;
  exam?: string;
  year?: string;
  shift?: string;
  date?: string;
  postDate?: string;
  category?: string;
  description?: string;
  status?: string;
  views?: number;
  totalQuestions?: number;
  durationMinutes?: number;
  tags?: string[];
  questions?: any[];
  content?: string;
  updatedAt?: string;
}

export default function PyqListingClient({ initialPosts = [] }: { initialPosts: PyqPost[] }) {
  const [posts, setPosts] = useState<PyqPost[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  useEffect(() => {
    const unsubscribe = subscribeToPyq(
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
      (err) => console.warn('PYQ live update error:', err)
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const exams = ['ALL', 'BSSC CGL', 'SSC CGL', 'Railway RRB NTPC', 'Bihar Police', 'SSC GD', 'Banking', 'State PSC'];
  const years = ['ALL', '2024', '2023', '2022', '2021'];

  const filteredPosts = posts.filter((post) => {
    if (!post || post.status === 'Draft') return false;
    const matchesSearch =
      !searchQuery.trim() ||
      (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.exam && post.exam.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.date && post.date.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesExam =
      selectedExam === 'ALL' ||
      (post.exam && post.exam.toLowerCase() === selectedExam.toLowerCase()) ||
      (post.category && post.category.toLowerCase().includes(selectedExam.toLowerCase()));

    const matchesYear =
      selectedYear === 'ALL' ||
      (post.year && String(post.year) === selectedYear) ||
      (post.title && post.title.includes(selectedYear));

    return matchesSearch && matchesExam && matchesYear;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Header />
      <Navbar currentCategory="PYQ" />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '16px 16px 40px' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
          <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</a>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Previous Year Questions (PYQ)</span>
        </div>

        {/* Top AdSense Display Ad */}
        <div style={{ marginBottom: '20px' }}>
          <DisplayAd label="ADVERTISEMENT" />
        </div>

        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
            borderRadius: '16px',
            padding: '28px 24px',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(4, 120, 87, 0.25)',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#fef08a', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Flame size={14} color="#f59e0b" /> Official Solved Papers & Mock Tests
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.25 }}>
              Previous Year Question Papers (PYQ) – Real Exam Mock Tests
            </h1>
            <p style={{ margin: 0, fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', color: '#d1fae5', maxWidth: '850px', lineHeight: 1.6 }}>
              BSSC CGL, SSC CGL, Railway RRB NTPC, Group D, Bihar Police, SSC GD तथा अन्य सरकारी भर्ती परीक्षाओं के पिछले वर्षों के वास्तविक प्रश्न पत्रों का ऑनलाइन मॉक टेस्ट हल सहित। टाइमर के साथ रियल एग्जाम जैसा अनुभव प्राप्त करें।
            </p>
          </div>
        </div>

        {/* Search & Exam Filter Bar */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by exam name (e.g. BSSC CGL, SSC CGL, RRB NTPC, Bihar Police, 2024)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s'
              }}
            />
          </div>

          {/* Exam Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>
              Exam:
            </span>
            {exams.map((exam) => (
              <button
                key={exam}
                onClick={() => setSelectedExam(exam)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: selectedExam === exam ? '1.5px solid #059669' : '1px solid #cbd5e1',
                  background: selectedExam === exam ? '#059669' : '#ffffff',
                  color: selectedExam === exam ? '#ffffff' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {exam}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout: Posts Grid + Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: '24px' }} className="pyq-layout-grid">
          {/* Left Column: Posts List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {selectedExam === 'ALL' ? 'All Previous Year Papers' : `${selectedExam} Solved Papers`} ({filteredPosts.length})
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Instant explanations & CBT test available
              </span>
            </div>

            {filteredPosts.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0'
                }}
              >
                <GraduationCap size={48} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#1e293b' }}>No PYQ papers found</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Try adjusting your search terms or exam filter.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredPosts.map((post, index) => {
                  const slug = post.slug || post.id;
                  const totalQ = post.totalQuestions || (Array.isArray(post.questions) ? post.questions.length : 50);
                  const duration = post.durationMinutes || 30;

                  return (
                    <React.Fragment key={post.id || slug}>
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          border: '1.5px solid #e2e8f0',
                          padding: '20px 22px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Header Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                background: '#ecfdf5',
                                color: '#047857',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: '6px',
                                border: '1px solid #a7f3d0'
                              }}
                            >
                              {post.exam || post.category || 'PYQ Solved'}
                            </span>
                            {post.year && (
                              <span
                                style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: '6px'
                                }}
                              >
                                {post.year} {post.shift ? `• ${post.shift}` : ''}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                            <Calendar size={13} />
                            <span>{post.date || (post.postDate ? post.postDate.split('|')[0].trim() : '')}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <a
                          href={`/pyq/${slug}`}
                          style={{
                            textDecoration: 'none',
                            color: '#0f172a',
                            fontSize: '1.18rem',
                            fontWeight: 800,
                            lineHeight: 1.4
                          }}
                        >
                          {post.title}
                        </a>

                        {/* Description */}
                        {post.description && (
                          <p style={{ margin: 0, color: '#475569', fontSize: '0.92rem', lineHeight: 1.55 }}>
                            {post.description}
                          </p>
                        )}

                        {/* Metadata row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <HelpCircle size={14} color="#059669" />
                            <span><strong>{totalQ}</strong> MCQs Questions</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={14} color="#0284c7" />
                            <span><strong>{duration}</strong> Minutes Timer</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          <a
                            href={`/pyq/${slug}?mode=test`}
                            style={{
                              background: '#047857',
                              color: '#ffffff',
                              padding: '9px 18px',
                              borderRadius: '8px',
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)'
                            }}
                          >
                            🚀 Start CBT Mock Test
                          </a>
                          <a
                            href={`/pyq/${slug}?mode=study`}
                            style={{
                              background: '#f0fdf4',
                              color: '#047857',
                              border: '1.5px solid #a7f3d0',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            💡 Study Mode (Solutions)
                          </a>
                        </div>
                      </div>

                      {/* Clean In-feed Display Ad every 3 posts */}
                      {(index + 1) % 3 === 0 && index !== filteredPosts.length - 1 && (
                        <div style={{ margin: '6px 0' }}>
                          <DisplayAd label="ADVERTISEMENT" />
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
            {/* Telegram Channel CTA Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 4px 14px rgba(30, 27, 75, 0.25)',
                border: '1px solid #4338ca'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                <Flame size={16} /> Free PDF & Updates
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>
                Join Career Diary Telegram
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#e0e7ff', lineHeight: 1.5 }}>
                Get daily solved previous year papers, Sarkari job notifications, and answer keys directly on Telegram.
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
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <Send size={15} /> Join Telegram Channel
              </a>
            </div>

            {/* Sidebar Square Ad (Clean Display Banner) */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                padding: '16px 12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '8px' }}>
                ADVERTISEMENT
              </div>
              <SquareAd label={null} />
            </div>

            {/* Quick Navigation Box */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '18px 20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Popular Practice Sections
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href="/test-series"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    textDecoration: 'none',
                    color: '#334155',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <span>📝 Full Mock Test Series</span>
                  <ArrowRight size={14} color="#94a3b8" />
                </a>
                <a
                  href="/current-affairs"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    textDecoration: 'none',
                    color: '#334155',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <span>🔥 Daily Current Affairs Quiz</span>
                  <ArrowRight size={14} color="#94a3b8" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
