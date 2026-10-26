'use client';

import React, { useState } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { DisplayAd, SidebarAd, InFeedAd } from './AdSenseBanner';
import {
  Calendar, User, Eye, Share2, Copy, Check, MessageCircle, Send,
  ArrowLeft, ArrowRight, Tag, BookOpen, Flame, Newspaper
} from 'lucide-react';

interface CurrentAffairsPost {
  id: string;
  slug: string;
  title: string;
  date?: string;
  postDate?: string;
  category?: string;
  description?: string;
  content?: string;
  author?: string;
  tags?: string[];
  views?: number;
  updatedAt?: string;
}

export default function CurrentAffairsDetailClient({
  post,
  relatedPosts = [],
}: {
  post: CurrentAffairsPost;
  relatedPosts?: CurrentAffairsPost[];
}) {
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://careerdiary.in/current-affairs/${post.slug || post.id}`;
  const shareTitle = post.title;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareOnWhatsApp = () => {
    const text = `${shareTitle}\n\n👉 Read Complete Current Affairs Questions & Answers:\n${pageUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Header />
      <Navbar currentCategory="CURRENT_AFFAIRS" />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '16px 16px 40px' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', flexWrap: 'wrap' }}>
          <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</a>
          <span>/</span>
          <a href="/current-affairs" style={{ color: '#2563eb', textDecoration: 'none' }}>Current Affairs</a>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600, maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.title}
          </span>
        </div>

        {/* Top AdSense Banner */}
        <div style={{ marginBottom: '20px' }}>
          <DisplayAd label="ADVERTISEMENT" />
        </div>

        {/* Layout: Article + Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: '24px' }} className="ca-detail-grid">
          {/* Main Article Content */}
          <article
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            {/* Category Badge */}
            <div style={{ marginBottom: '12px' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Tag size={13} /> {post.category || 'Daily Current Affairs'}
              </span>
            </div>

            {/* Post Title */}
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.3,
                margin: '0 0 16px 0'
              }}
            >
              {post.title}
            </h1>

            {/* Meta Row: Date, Author, Views */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 0',
                borderTop: '1px solid #f1f5f9',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '20px',
                fontSize: '0.86rem',
                color: '#64748b'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="#2563eb" />
                  <span>{post.postDate || post.date || 'Updated Today'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="#64748b" />
                  <span>{post.author || 'Career Diary Team'}</span>
                </div>
              </div>

              {/* Share Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={shareOnWhatsApp}
                  title="Share on WhatsApp"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#25d366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>

                <button
                  onClick={shareOnTelegram}
                  title="Share on Telegram"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#0088cc',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Send size={14} /> Telegram
                </button>

                <button
                  onClick={handleCopyLink}
                  title="Copy Page Link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* In-Article Ad #1 */}
            <div style={{ margin: '16px 0 24px' }}>
              <DisplayAd label="ADVERTISEMENT" />
            </div>

            {/* Render Raw HTML Questions / MCQs Content */}
            {post.content ? (
              (() => {
                const lower = post.content.toLowerCase();
                const isFullDoc = lower.includes('<!doctype') || lower.includes('<html') || lower.includes('<script');

                if (isFullDoc) {
                  return (
                    <div style={{ width: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                      <iframe
                        srcDoc={post.content}
                        title={post.title}
                        sandbox="allow-same-origin allow-scripts"
                        style={{
                          width: '100%',
                          minHeight: '750px',
                          border: 'none',
                          display: 'block',
                          background: '#ffffff'
                        }}
                      />
                    </div>
                  );
                }

                // Scope any embedded style tags so body/html selectors don't leak globally
                const scopedHtml = post.content.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
                  const scopedCss = css
                    .replace(/\b(html|body)\b/gi, '.sr-rich-html-content')
                    .replace(/:root/gi, '.sr-rich-html-content');
                  return `<style>${scopedCss}</style>`;
                });

                return (
                  <div
                    className="sr-rich-html-content"
                    dangerouslySetInnerHTML={{ __html: scopedHtml }}
                    style={{
                      fontSize: '1rem',
                      lineHeight: 1.7,
                      color: '#1e293b'
                    }}
                  />
                );
              })()
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px' }}>
                <p style={{ color: '#64748b', margin: 0 }}>Content is being prepared. Check back shortly!</p>
              </div>
            )}

            {/* In-Article Ad #2 (Post Content Bottom) */}
            <div style={{ margin: '28px 0 16px' }}>
              <DisplayAd label="ADVERTISEMENT" />
            </div>

            {/* Social Share Call to Action */}
            <div
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '18px 20px',
                marginTop: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px', color: '#1e3a8a', fontSize: '1rem' }}>
                  📢 Share this Current Affairs set with your study group!
                </h4>
                <p style={{ margin: 0, color: '#3b82f6', fontSize: '0.88rem' }}>
                  Help fellow aspirants prepare for upcoming competitive exams.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={shareOnWhatsApp}
                  style={{
                    background: '#25d366',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={16} /> WhatsApp Share
                </button>
                <button
                  onClick={shareOnTelegram}
                  style={{
                    background: '#0088cc',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={16} /> Telegram Share
                </button>
              </div>
            </div>

            {/* Related Current Affairs Sets */}
            {relatedPosts.length > 0 && (
              <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '2px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Newspaper size={20} color="#2563eb" />
                  <span>Other Recent Current Affairs Notes</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {relatedPosts.map((rel) => {
                    const rSlug = rel.slug || rel.id;
                    return (
                      <a
                        key={rel.id || rSlug}
                        href={`/current-affairs/${rSlug}`}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px',
                          transition: 'border-color 0.2s, transform 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>
                          {rel.date || rel.category}
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', lineHeight: 1.4 }}>
                          {rel.title}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span>Read Questions</span> <ArrowRight size={13} />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </article>

          {/* Right Column: Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Telegram Channel Box */}
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
                <Flame size={16} /> Live Daily Updates
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>
                Join Career Diary Official
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#e0e7ff', lineHeight: 1.5 }}>
                Get daily Current Affairs MCQs, Govt Job notifications, and exam answer keys directly on Telegram.
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

            {/* Sidebar AdSense Ad */}
            <SidebarAd label="ADVERTISEMENT" />

            {/* Navigation back to all current affairs */}
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
                Explore More
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href="/current-affairs"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    padding: '8px 12px',
                    background: '#eff6ff',
                    borderRadius: '8px'
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>All Current Affairs Posts</span>
                </a>
                <a
                  href="/study-quiz"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#0f172a',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    padding: '8px 12px'
                  }}
                >
                  <BookOpen size={15} color="#64748b" />
                  <span>Online GK Quizzes</span>
                </a>
                <a
                  href="/latest-jobs"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#0f172a',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    padding: '8px 12px'
                  }}
                >
                  <Tag size={15} color="#64748b" />
                  <span>Latest Govt Vacancies</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @media (max-width: 860px) {
          .ca-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
