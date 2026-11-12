'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { DisplayAd, Dis2Ad, SquareAd } from './AdSenseBanner';
import { CAQuestion, default50CurrentAffairsQuestions } from '../data/currentAffairs50Questions';
import { extractQuestionsFromContent } from '../data/questionExtractor';
import { fetchCurrentAffairsBySlug } from '../firebase';
import {
  Clock, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, ArrowLeft,
  Bookmark, Flag, HelpCircle, Check, Eye, EyeOff, Trophy, AlertTriangle,
  Flame, BookOpen, Share2, MessageCircle, Send, Copy, Calendar, Tag, User, Newspaper
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
  questions?: CAQuestion[];
  durationMinutes?: number;
  marksPerQuestion?: number;
  negativeMarks?: number;
  totalQuestions?: number;
  isChunked?: boolean;
  chunkCount?: number;
  topicsSummary?: { [topic: string]: number };
}

function getQuestionImages(q: CAQuestion): string[] {
  if (Array.isArray(q.images) && q.images.length > 0) return q.images.filter(Boolean);
  if (q.image && String(q.image).trim()) return [String(q.image).trim()];
  return [];
}

function getSolutionImages(q: CAQuestion): string[] {
  if (Array.isArray(q.explanation_images) && q.explanation_images.length > 0) return q.explanation_images.filter(Boolean);
  if (q.explanation_image && String(q.explanation_image).trim()) return [String(q.explanation_image).trim()];
  return [];
}

function formatMark(n: number): string {
  return Number.isInteger(n) ? `${n}.00` : String(Number(n.toFixed(2)));
}

const subscribeToHistory = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};
const getCaUrlModeSnapshot = (): 'test' | 'study' | 'article' | null => {
  const m = new URLSearchParams(window.location.search).get('mode');
  return m === 'study' || m === 'test' || m === 'article' ? m : null;
};
const getServerModeSnapshot = () => null;

function renderOptionContent(text: string) {
  if (!text) return '';
  const trimmed = String(text).trim();
  const imgTagMatch = trimmed.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgTagMatch) {
    const remainingText = trimmed.replace(/<img[^>]*>/gi, '').trim();
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
        <img src={imgTagMatch[1]} alt="Option" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
        {remainingText && <span>{remainingText}</span>}
      </span>
    );
  }
  if (/^data:image\//i.test(trimmed) || /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(trimmed)) {
    return <img src={trimmed} alt="Option" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />;
  }
  return text;
}

export default function CurrentAffairsQuizClient({
  post,
  relatedPosts = []
}: {
  post: CurrentAffairsPost;
  relatedPosts?: any[];
}) {
  const [fetchedDoc, setFetchedDoc] = useState<{ key: string; data: CurrentAffairsPost } | null>(null);
  const postKey = `${post?.id || ''}:${post?.slug || ''}:${Array.isArray(post?.questions) ? post.questions.length : 0}:${post?.isChunked ? 1 : 0}`;
  const hasFetchedFull = fetchedDoc?.key === postKey;
  const slugOrId = post?.slug || post?.id;
  const needsFullFetch =
    !hasFetchedFull &&
    Boolean(slugOrId) &&
    (Boolean(post?.isChunked) ||
      (typeof post?.totalQuestions === 'number' &&
        post.totalQuestions > 3 &&
        Array.isArray(post.questions) &&
        post.questions.length <= 3));

  const activePost: CurrentAffairsPost =
    hasFetchedFull && fetchedDoc
      ? {
          ...post,
          ...fetchedDoc.data,
          questions:
            Array.isArray(fetchedDoc.data.questions) && fetchedDoc.data.questions.length > 0
              ? fetchedDoc.data.questions
              : post.questions
        }
      : post;

  // Safety net: if post was chunked or summary-only, fetch & reassemble full questions
  useEffect(() => {
    if (!needsFullFetch || !slugOrId) return;

    let cancelled = false;
    fetchCurrentAffairsBySlug(slugOrId)
      .then((fullDoc) => {
        if (!cancelled && fullDoc) {
          setFetchedDoc({ key: postKey, data: fullDoc });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [needsFullFetch, slugOrId, postKey]);

  const hasHtmlArticleContent = React.useMemo(() => {
    if (!activePost.content) return false;
    const trimmed = String(activePost.content).trim();
    return Boolean(trimmed && !trimmed.startsWith('{') && !trimmed.startsWith('[') && !trimmed.startsWith('// ✅'));
  }, [activePost.content]);

  // Extract questions from activePost.questions or activePost.content
  const extractedQuestions = React.useMemo(() => {
    if (Array.isArray(activePost.questions) && activePost.questions.length > 0) {
      return activePost.questions.map((q: any, idx: number) => {
        let normOpts: { A: string; B: string; C: string; D: string; [key: string]: string } = {
          A: '',
          B: '',
          C: '',
          D: ''
        };
        if (Array.isArray(q.options)) {
          q.options.forEach((opt: any, oIdx: number) => {
            const rawKey = String(opt?.label || ['A', 'B', 'C', 'D'][oIdx] || 'A').trim().toUpperCase();
            const m = rawKey.match(/^\(?([A-D])\)?\.?$/);
            const k = m ? m[1] : rawKey;
            normOpts[k] = String(opt?.text ?? opt ?? '').trim();
          });
        } else if (q.options && typeof q.options === 'object') {
          normOpts = {
            A: String(q.options.A ?? q.options.a ?? ''),
            B: String(q.options.B ?? q.options.b ?? ''),
            C: String(q.options.C ?? q.options.c ?? ''),
            D: String(q.options.D ?? q.options.d ?? '')
          };
        }
        const rawAns = String(q.correct_answer ?? q.correct_option ?? q.correct ?? 'A').trim().toUpperCase();
        const ansMatch = rawAns.match(/^\(?([A-D])\)?\.?$/);
        const correctAns = ansMatch ? ansMatch[1] : rawAns;

        return {
          ...q,
          id: q.id !== undefined && q.id !== null && String(q.id).trim() !== '' ? String(q.id) : String(idx + 1),
          options: normOpts,
          correct_answer: correctAns,
          solution: q.solution || q.explanation || ''
        };
      });
    }
    if (activePost.content) {
      const extracted = extractQuestionsFromContent(activePost.content);
      if (extracted && extracted.length > 0) {
        return extracted.map((q, idx) => ({
          ...q,
          id: q.id !== undefined && q.id !== null && String(q.id).trim() !== '' ? String(q.id) : String(idx + 1),
          correct_answer: String(q.correct_answer || 'A').trim().toUpperCase()
        }));
      }
    }
    return [];
  }, [activePost.questions, activePost.content]);

  // Use extracted questions if available; otherwise fallback only if no custom HTML content was provided
  const questions: CAQuestion[] = React.useMemo(() => {
    if (extractedQuestions.length > 0) {
      return extractedQuestions;
    }
    if (!hasHtmlArticleContent && !activePost.content) {
      return default50CurrentAffairsQuestions.map((q, idx) => ({
        ...q,
        id: q.id !== undefined && q.id !== null ? String(q.id) : String(idx + 1)
      }));
    }
    return [];
  }, [extractedQuestions, hasHtmlArticleContent, activePost.content]);

  const totalQuestions = questions.length;
  const durationMinutes =
    activePost.durationMinutes && Number(activePost.durationMinutes) > 0
      ? Number(activePost.durationMinutes)
      : (totalQuestions <= 15 ? 10 : (totalQuestions <= 30 ? 20 : 30));
  const durationSeconds = durationMinutes * 60;

  const marksPerQuestion =
    activePost.marksPerQuestion !== undefined &&
    activePost.marksPerQuestion !== null &&
    !Number.isNaN(Number(activePost.marksPerQuestion))
      ? Number(activePost.marksPerQuestion)
      : 1;
  const negativeMarks =
    activePost.negativeMarks !== undefined &&
    activePost.negativeMarks !== null &&
    !Number.isNaN(Number(activePost.negativeMarks))
      ? Math.abs(Number(activePost.negativeMarks))
      : 0.25;
  const maxScore = Number((totalQuestions * marksPerQuestion).toFixed(2));
  const posMarkLabel = formatMark(marksPerQuestion);
  const negMarkLabel = formatMark(negativeMarks);

  const urlMode = useSyncExternalStore(subscribeToHistory, getCaUrlModeSnapshot, getServerModeSnapshot);
  const [userMode, setMode] = useState<'test' | 'study' | 'article' | 'result' | null>(null);
  const defaultMode: 'test' | 'article' = totalQuestions === 0 && hasHtmlArticleContent ? 'article' : 'test';
  const mode: 'test' | 'study' | 'article' | 'result' = userMode ?? urlMode ?? defaultMode;
  const [currentIdx, setCurrentIdx] = useState(0);

  // Test mode states
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timeLeft = Math.max(0, durationSeconds - elapsedSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: string }>({});
  const [markedForReview, setMarkedForReview] = useState<{ [qId: string]: boolean }>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const elapsedRef = useRef(0);

  // Study mode states
  const [studyAnswers, setStudyAnswers] = useState<{ [qId: string]: string }>({});
  const [studyRevealed, setStudyRevealed] = useState<{ [qId: string]: boolean }>({});

  // Share link copied state
  const [copied, setCopied] = useState(false);

  const formatTimer = (seconds: number) => {
    const safeSecs = Math.max(0, seconds);
    const hrs = Math.floor(safeSecs / 3600);
    const mins = Math.floor((safeSecs % 3600) / 60);
    const secs = safeSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOptionInTest = (optKey: string) => {
    const q = questions[currentIdx];
    if (!q) return;
    const qKey = String(q.id);
    setSelectedAnswers(prev => ({
      ...prev,
      [qKey]: optKey
    }));
  };

  const handleClearOption = () => {
    const q = questions[currentIdx];
    if (!q) return;
    const qKey = String(q.id);
    setSelectedAnswers(prev => {
      const next = { ...prev };
      delete next[qKey];
      return next;
    });
  };

  const handleToggleReview = () => {
    const q = questions[currentIdx];
    if (!q) return;
    const qKey = String(q.id);
    setMarkedForReview(prev => ({
      ...prev,
      [qKey]: !prev[qKey]
    }));
  };

  const handleNextQuestion = () => {
    if (currentIdx < totalQuestions - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
    }
  };

  const handleJumpToQuestion = (idx: number) => {
    setCurrentIdx(idx);
  };

  const handleSubmitTest = (_autoSubmit = false) => {
    setIsTimerRunning(false);
    setShowSubmitModal(false);
    setTimeTakenSeconds(Math.min(durationSeconds, Math.max(0, elapsedRef.current)));
    setMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Timer interval & safe auto-submit when countdown reaches zero
  useEffect(() => {
    if (mode !== 'test' || !isTimerRunning || totalQuestions === 0) return;

    const timer = setInterval(() => {
      const next = elapsedRef.current + 1;
      elapsedRef.current = next;
      setElapsedSeconds(next);
      if (next >= durationSeconds) {
        clearInterval(timer);
        setIsTimerRunning(false);
        setShowSubmitModal(false);
        setTimeTakenSeconds(durationSeconds);
        setMode('result');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isTimerRunning, totalQuestions, durationSeconds]);

  const handleRestartTest = () => {
    setSelectedAnswers({});
    setMarkedForReview({});
    setCurrentIdx(0);
    elapsedRef.current = 0;
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setMode('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Score calculations
  const totalAttempted = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  let incorrectCount = 0;

  questions.forEach(q => {
    const userAns = selectedAnswers[String(q.id)];
    if (userAns) {
      if (userAns.trim().toUpperCase() === String(q.correct_answer || '').trim().toUpperCase()) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
  });

  const unattemptedCount = totalQuestions - totalAttempted;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const score = Math.max(0, Number((correctCount * marksPerQuestion - incorrectCount * negativeMarks).toFixed(2)));
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const currentQ = questions[currentIdx] || questions[0];
  const currentQId = currentQ ? String(currentQ.id) : '';

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://careerdiary.in/current-affairs/${activePost.slug || activePost.id}`;
  const shareTitle = `${activePost.title} (${totalQuestions} MCQs • ${durationMinutes} Min Live Test)`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9' }}>
      <Header />
      <Navbar currentCategory="CURRENT_AFFAIRS" />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '16px 14px 40px' }}>
        {/* Top Breadcrumb & Ad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#64748b', marginBottom: '14px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/current-affairs" style={{ color: '#2563eb', textDecoration: 'none' }}>Current Affairs</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{activePost.title}</span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <DisplayAd label="ADVERTISEMENT" />
        </div>

        {/* Top Hero / Title Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 60%, #0369a1 100%)',
            borderRadius: '16px',
            padding: '22px 24px',
            color: '#ffffff',
            boxShadow: '0 6px 20px rgba(30, 58, 138, 0.25)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '3px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700, color: '#fef08a', marginBottom: '8px', textTransform: 'uppercase' }}>
                <Flame size={14} color="#f59e0b" /> {totalQuestions > 0 ? `${totalQuestions} Questions • ${durationMinutes} Minutes Live MCQ Mock Test` : 'Daily Current Affairs & GK Notes'}
              </div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3.2vw, 1.9rem)', fontWeight: 800, margin: '0 0 6px 0', lineHeight: 1.3 }}>
                {activePost.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: '#e0f2fe', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} />
                  <span>{activePost.date || activePost.postDate || 'Live Today'}</span>
                </div>
                {totalQuestions > 0 && (
                  <>
                    <span>•</span>
                    <span>Exam Pattern: +{posMarkLabel} Mark, -{negMarkLabel} Negative</span>
                  </>
                )}
              </div>
            </div>

            {/* Mode Switcher Buttons */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '5px', borderRadius: '10px', flexWrap: 'wrap' }}>
              {totalQuestions > 0 && (
                <>
                  <button
                    onClick={() => setMode('test')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '7px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: mode === 'test' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Clock size={15} /> {durationMinutes}-Min Test
                  </button>
                  <button
                    onClick={() => setMode('study')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '7px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: mode === 'study' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <BookOpen size={15} /> Practice Mode
                  </button>
                </>
              )}

              {hasHtmlArticleContent && activePost.content && (
                <button
                  onClick={() => setMode('article')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: mode === 'article' ? '#2563eb' : 'transparent',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Newspaper size={15} /> Article / HTML
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ───────── 1. TEST MODE ───────── */}
        {mode === 'test' && totalQuestions > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 340px)', gap: '20px' }} className="ca-quiz-grid">
            {/* Left: Active Question Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Question Header Card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '22px 24px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* Meta Top: Q Number & Marks */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '0.9rem', padding: '4px 12px', borderRadius: '6px' }}>
                      Question {currentIdx + 1} of {totalQuestions}
                    </span>
                    {markedForReview[currentQId] && (
                      <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.78rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flag size={12} /> Marked for Review
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>
                    Marks: +{posMarkLabel} / -{negMarkLabel}
                  </span>
                </div>

                {/* Question Text */}
                <div style={{ fontSize: '1.18rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.55, marginBottom: '22px', whiteSpace: 'pre-line' }}>
                  {currentQ?.question}
                </div>

                {/* Optional Question Diagrams (Single or Multi-image) */}
                {currentQ && getQuestionImages(currentQ).length > 0 && (
                  <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    {getQuestionImages(currentQ).map((imgSrc, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={imgSrc}
                        alt={`Question ${currentQId} diagram ${imgIdx + 1}`}
                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }}
                      />
                    ))}
                  </div>
                )}

                {/* 4 Clickable Options (2x2 square-like grid) */}
                <div
                  className="ca-options-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '14px'
                  }}
                >
                  {Object.entries(currentQ?.options || {}).map(([key, optText]) => {
                    if (!optText) return null;
                    const isSelected = selectedAnswers[currentQId] === key;
                    return (
                      <div
                        key={key}
                        onClick={() => handleSelectOptionInTest(key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px 18px',
                          minHeight: '70px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.98rem',
                            flexShrink: 0,
                            background: isSelected ? '#2563eb' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#334155',
                            border: isSelected ? 'none' : '1.5px solid #cbd5e1'
                          }}
                        >
                          {key}
                        </div>
                        <div style={{ fontSize: '1.02rem', color: isSelected ? '#1e3a8a' : '#1e293b', fontWeight: isSelected ? 600 : 500, lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                          {renderOptionContent(optText)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation and Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '26px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleClearOption}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Clear Response
                    </button>
                    <button
                      onClick={handleToggleReview}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '7px',
                        border: '1.5px solid #c084fc',
                        background: markedForReview[currentQId] ? '#7e22ce' : '#faf5ff',
                        color: markedForReview[currentQId] ? '#ffffff' : '#7e22ce',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Flag size={14} />
                      <span>{markedForReview[currentQId] ? 'Unmark Review' : 'Mark for Review'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      disabled={currentIdx === 0}
                      onClick={handlePrevQuestion}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: currentIdx === 0 ? '#f1f5f9' : '#ffffff',
                        color: currentIdx === 0 ? '#94a3b8' : '#0f172a',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ArrowLeft size={16} /> Prev
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      style={{
                        padding: '9px 22px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      <span>Save & Next</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Under-Question Ad (Fills the blank space directly below the active question) */}
              <div
                style={{
                  marginTop: '18px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  ADVERTISEMENT
                </div>
                <SquareAd slot="7208581106" label={null} />
              </div>
            </div>

            {/* Right: Timer & 50-Question Palette */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Live 30-Minute Countdown Timer Card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Time Remaining
                </div>
                <div
                  style={{
                    fontFamily: 'Outfit, monospace',
                    fontSize: '2.4rem',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    color: timeLeft <= 300 ? '#dc2626' : (timeLeft <= 600 ? '#ea580c' : '#0f172a')
                  }}
                >
                  {formatTimer(timeLeft)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  {formatTimer(durationSeconds)} Total Duration
                </div>
              </div>

              {/* Question Palette (1 to N Grid) */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                    Question Palette ({totalQuestions})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                    {totalAttempted} Answered
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.75rem', color: '#475569', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#16a34a' }} />
                    <span>Answered ({totalAttempted})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#e2e8f0' }} />
                    <span>Not Answered ({unattemptedCount})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#7e22ce' }} />
                    <span>Review ({markedCount})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #2563eb', background: '#ffffff' }} />
                    <span>Current</span>
                  </div>
                </div>

                {/* Circular Question Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {questions.map((q, idx) => {
                    const qKey = String(q.id);
                    const isAns = Boolean(selectedAnswers[qKey]);
                    const isRev = Boolean(markedForReview[qKey]);
                    const isCur = currentIdx === idx;

                    let bg = '#f1f5f9';
                    let col = '#334155';
                    let border = '1px solid #cbd5e1';

                    if (isAns) {
                      bg = '#16a34a';
                      col = '#ffffff';
                      border = '1px solid #15803d';
                    } else if (isRev) {
                      bg = '#7e22ce';
                      col = '#ffffff';
                      border = '1px solid #6b21a8';
                    }

                    if (isCur) {
                      border = '2.5px solid #2563eb';
                    }

                    return (
                      <button
                        key={qKey}
                        onClick={() => handleJumpToQuestion(idx)}
                        style={{
                          height: '36px',
                          borderRadius: '8px',
                          border,
                          background: bg,
                          color: col,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Submit Test Button */}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(22, 163, 74, 0.3)',
                    transition: 'background 0.15s'
                  }}
                >
                  🚀 Submit Test Now
                </button>
              </div>

              {/* Sidebar Square Ad (Replaces tall vertical ad with clean 300x250 square ad) */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  padding: '16px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  ADVERTISEMENT
                </div>
                <SquareAd slot="6233897431" label={null} />
              </div>
            </aside>
          </div>
        )}

        {/* ───────── 2. PRACTICE / STUDY MODE (Instant Answer & Explanation) ───────── */}
        {mode === 'study' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.95rem' }}>
                💡 Instant Practice Mode: Click any option to test yourself, correct answer and explanation will appear instantly!
              </div>
              <button
                onClick={() => setMode('test')}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Switch to {durationMinutes}-Min Timed Test
              </button>
            </div>

            {questions.map((q, idx) => {
              const qKey = String(q.id);
              const qImgs = getQuestionImages(q);
              const sImgs = getSolutionImages(q);
              const normCorrect = String(q.correct_answer || '').trim().toUpperCase();
              const userOpt = studyAnswers[qKey];
              const isRevealed = Boolean(studyRevealed[qKey] || userOpt);

              return (
                <React.Fragment key={qKey}>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      padding: '22px 24px',
                      border: '1.5px solid #cbd5e1',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', padding: '3px 10px', borderRadius: '4px' }}>
                        Q{idx + 1} of {totalQuestions}
                      </span>
                      <button
                        onClick={() => setStudyRevealed(prev => ({ ...prev, [qKey]: !prev[qKey] }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{isRevealed ? 'Hide Answer' : 'Show Answer'}</span>
                      </button>
                    </div>

                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.5, marginBottom: '18px', whiteSpace: 'pre-line' }}>
                      {q.question}
                    </div>

                    {/* Optional Question Diagrams (Single or Multi-image) */}
                    {qImgs.length > 0 && (
                      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                        {qImgs.map((imgSrc, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={imgSrc}
                            alt={`Question ${qKey} diagram ${imgIdx + 1}`}
                            style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Options (2x2 square-like grid) */}
                    <div
                      className="ca-options-grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '16px'
                      }}
                    >
                      {Object.entries(q.options || {}).map(([key, optText]) => {
                        if (!optText) return null;
                        const normKey = key.trim().toUpperCase();
                        const isUserChoice = userOpt === key;
                        const isRightAns = normCorrect === normKey;

                        let bg = '#ffffff';
                        let border = '1.5px solid #cbd5e1';
                        let col = '#1e293b';

                        if (isRevealed) {
                          if (isRightAns) {
                            bg = '#dcfce7';
                            border = '2px solid #16a34a';
                            col = '#14532d';
                          } else if (isUserChoice) {
                            bg = '#fee2e2';
                            border = '2px solid #dc2626';
                            col = '#7f1d1d';
                          }
                        }

                        return (
                          <div
                            key={key}
                            onClick={() => {
                              setStudyAnswers(prev => ({ ...prev, [qKey]: key }));
                              setStudyRevealed(prev => ({ ...prev, [qKey]: true }));
                            }}
                            style={{
                              padding: '14px 16px',
                              minHeight: '62px',
                              borderRadius: '10px',
                              border,
                              background: bg,
                              color: col,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '0.98rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                flexShrink: 0,
                                background: isRevealed && isRightAns ? '#16a34a' : isRevealed && isUserChoice ? '#dc2626' : '#f1f5f9',
                                color: isRevealed && (isRightAns || isUserChoice) ? '#ffffff' : '#334155',
                                border: isRevealed && (isRightAns || isUserChoice) ? 'none' : '1px solid #cbd5e1'
                              }}
                            >
                              {key}
                            </div>
                            <span style={{ fontWeight: isUserChoice || (isRevealed && isRightAns) ? 600 : 500, whiteSpace: 'pre-line' }}>{renderOptionContent(optText)}</span>
                            {isRevealed && isRightAns && <CheckCircle2 size={18} color="#16a34a" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                            {isRevealed && isUserChoice && !isRightAns && <XCircle size={18} color="#dc2626" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {isRevealed && (
                      <div style={{ background: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '14px 18px', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.95rem', marginBottom: '4px' }}>
                          ✅ सही उत्तर: Option ({normCorrect}) {q.options?.[normCorrect] ? '- ' : ''}{q.options?.[normCorrect] ? renderOptionContent(q.options[normCorrect]) : ''}
                        </div>
                        <div style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                          <strong>विस्तृत व्याख्या:</strong> {q.solution || `सही विकल्प (${normCorrect}) है।`}
                        </div>
                        {sImgs.length > 0 && (
                          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {sImgs.map((imgSrc, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={imgSrc}
                                alt={`Solution ${qKey} diagram ${imgIdx + 1}`}
                                style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '8px', border: '1px solid #bbf7d0', objectFit: 'contain', background: '#ffffff' }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Google AdSense Ad after every 5 questions */}
                  {(idx + 1) % 5 === 0 && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1.5px dashed #cbd5e1',
                        borderRadius: '12px',
                        padding: '14px',
                        margin: '6px 0',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '8px' }}>
                        ADVERTISEMENT
                      </div>
                      <SquareAd
                        slot={['1202522135', '7208581106', '6233897431'][Math.floor(idx / 5) % 3]}
                        label={null}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ───────── 3. SCORECARD & DETAILED TEST RESULT ───────── */}
        {mode === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Score Trophy Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 50%, #047857 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '30px 24px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(4, 120, 87, 0.25)'
              }}
            >
              <Trophy size={48} style={{ margin: '0 auto 12px', color: '#fbbf24' }} />
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, margin: '0 0 6px 0' }}>
                Test Completed Successfully!
              </h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#e0f2fe' }}>
                You have submitted the {totalQuestions} MCQs Current Affairs Test. Here is your detailed performance report:
              </p>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px 12px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>TOTAL SCORE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fef08a', marginTop: '4px' }}>{score} / {maxScore}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px 12px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>ACCURACY</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#86efac', marginTop: '4px' }}>{percentage}%</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px 12px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>CORRECT</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4ade80', marginTop: '4px' }}>{correctCount}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px 12px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>INCORRECT</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>{incorrectCount}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px 12px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>TIME TAKEN</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#93c5fd', marginTop: '4px' }}>{formatTimer(timeTakenSeconds)}</div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={handleRestartTest}
                  style={{
                    background: '#ffffff',
                    color: '#065f46',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 28px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  <RotateCcw size={16} /> Retake {durationMinutes}-Min Test
                </button>
              </div>
            </div>

            {/* In-Between Ad (Dis2) */}
            <Dis2Ad label="ADVERTISEMENT" />

            {/* Question by Question Review */}
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Detailed Question Solutions & Explanations ({totalQuestions})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questions.map((q, idx) => {
                  const qKey = String(q.id);
                  const qImgs = getQuestionImages(q);
                  const sImgs = getSolutionImages(q);
                  const normCorrect = String(q.correct_answer || '').trim().toUpperCase();
                  const userAns = selectedAnswers[qKey];
                  const isCorrect = Boolean(userAns && userAns.trim().toUpperCase() === normCorrect);
                  const isAttempted = Boolean(userAns);

                  return (
                    <div
                      key={qKey}
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '20px 24px',
                        border: isAttempted ? (isCorrect ? '2px solid #86efac' : '2px solid #fca5a5') : '1.5px solid #cbd5e1'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', padding: '3px 10px', borderRadius: '4px' }}>
                          Q{idx + 1}
                        </span>
                        {isAttempted ? (
                          isCorrect ? (
                            <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={16} /> Correct (+{posMarkLabel})
                            </span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <XCircle size={16} /> Incorrect (-{negMarkLabel})
                            </span>
                          )
                        ) : (
                          <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                            Unattempted (0.00)
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', whiteSpace: 'pre-line' }}>
                        {q.question}
                      </div>

                      {/* Optional Question Diagrams */}
                      {qImgs.length > 0 && (
                        <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          {qImgs.map((imgSrc, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={imgSrc}
                              alt={`Question ${qKey} diagram ${imgIdx + 1}`}
                              style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Options Review */}
                      <div
                        className="ca-options-grid"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '10px',
                          marginBottom: '14px'
                        }}
                      >
                        {Object.entries(q.options || {}).map(([k, text]) => {
                          if (!text) return null;
                          const isRight = k.trim().toUpperCase() === normCorrect;
                          const isUserPicked = userAns === k;

                          let bg = '#ffffff';
                          let border = '1px solid #cbd5e1';
                          let textCol = '#334155';

                          if (isRight) {
                            bg = '#dcfce7';
                            border = '2px solid #16a34a';
                            textCol = '#14532d';
                          } else if (isUserPicked && !isRight) {
                            bg = '#fee2e2';
                            border = '2px solid #dc2626';
                            textCol = '#7f1d1d';
                          }

                          return (
                            <div
                              key={k}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '6px',
                                border,
                                background: bg,
                                color: textCol,
                                fontSize: '0.92rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              <span style={{ fontWeight: 800 }}>({k})</span>
                              <span style={{ whiteSpace: 'pre-line' }}>{renderOptionContent(text)}</span>
                              {isRight && <Check size={14} color="#16a34a" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                              {isUserPicked && !isRight && <XCircle size={14} color="#dc2626" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Solution */}
                      <div style={{ background: '#f8fafc', borderLeft: '4px solid #2563eb', padding: '12px 16px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                          <strong>विस्तृत उत्तर:</strong> {q.solution || `सही विकल्प (${normCorrect}) है।`}
                        </div>
                        {sImgs.length > 0 && (
                          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {sImgs.map((imgSrc, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={imgSrc}
                                alt={`Solution ${qKey} diagram ${imgIdx + 1}`}
                                style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '8px', border: '1px solid #cbd5e1', objectFit: 'contain', background: '#ffffff' }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ───────── 4. FULL ARTICLE / NOTES VIEW ───────── */}
        {mode === 'article' && hasHtmlArticleContent && activePost.content && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: '24px' }} className="ca-detail-grid">
            <article
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px 28px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              }}
            >
              {totalQuestions > 0 && (
                <div style={{
                  background: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '0.92rem', color: '#1e40af', fontWeight: 600 }}>
                    💡 <strong>Live Test Available:</strong> You can attempt these {totalQuestions} questions with real-time timer and instant scorecard!
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setMode('test')}
                      style={{
                        padding: '8px 16px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Start Live Test ({durationMinutes}m)
                    </button>
                    <button
                      onClick={() => setMode('study')}
                      style={{
                        padding: '8px 16px',
                        background: '#ffffff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Study Mode
                    </button>
                  </div>
                </div>
              )}

              {(() => {
                const rawHtml = activePost.content || '';
                const lower = rawHtml.toLowerCase();
                const isFullDoc = lower.includes('<!doctype') || lower.includes('<html') || lower.includes('<script');

                if (isFullDoc) {
                  return (
                    <div style={{ width: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                      <iframe
                        srcDoc={rawHtml}
                        title={activePost.title}
                        sandbox="allow-same-origin allow-scripts"
                        style={{
                          width: '100%',
                          minHeight: '850px',
                          border: 'none',
                          display: 'block',
                          background: '#ffffff'
                        }}
                      />
                    </div>
                  );
                }

                const scopedHtml = rawHtml.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
                  const scopedCss = css
                    .replace(/\b(html|body)\b/gi, '.sr-rich-html-content')
                    .replace(/:root/gi, '.sr-rich-html-content');
                  return `<style>${scopedCss}</style>`;
                });

                return (
                  <div
                    className="sr-rich-html-content"
                    dangerouslySetInnerHTML={{ __html: scopedHtml }}
                  />
                );
              })()}
            </article>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SquareAd slot="6233897431" label="SPONSORED" />
              {relatedPosts.length > 0 && (
                <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px 20px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    Recent Current Affairs
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {relatedPosts.map((rp) => (
                      <a
                        key={rp.id || rp.slug}
                        href={`/current-affairs/${rp.slug || rp.id}`}
                        style={{ textDecoration: 'none', color: '#1e293b', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <ArrowRight size={13} color="#2563eb" />
                        <span style={{ lineHeight: 1.4 }}>{rp.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ───────── SUBMIT CONFIRMATION MODAL ───────── */}
        {showSubmitModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '16px'
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  Submit {totalQuestions} MCQs Test?
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Please review your attempt summary before final submission.
                </p>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Questions:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{totalQuestions}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Answered:</span>
                  <span style={{ fontWeight: 800, color: '#16a34a' }}>{totalAttempted}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>Unanswered:</span>
                  <span style={{ fontWeight: 800, color: '#dc2626' }}>{unattemptedCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#7e22ce', fontWeight: 600 }}>Marked for Review:</span>
                  <span style={{ fontWeight: 800, color: '#7e22ce' }}>{markedCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <span style={{ color: '#64748b' }}>Time Left:</span>
                  <span style={{ fontWeight: 800, color: '#2563eb' }}>{formatTimer(timeLeft)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Return to Test
                </button>
                <button
                  onClick={() => handleSubmitTest(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  Yes, Submit Test
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style jsx global>{`
        @media (max-width: 880px) {
          .ca-quiz-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .ca-options-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
