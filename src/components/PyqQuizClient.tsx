'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import { DisplayAd, SquareAd } from './AdSenseBanner';
import { CAQuestion } from '../data/currentAffairs50Questions';
import { extractQuestionsFromContent } from '../data/questionExtractor';
import {
  Clock, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, ArrowLeft,
  Bookmark, Flag, HelpCircle, Check, Eye, EyeOff, Trophy, AlertTriangle,
  Flame, BookOpen, Share2, MessageCircle, Send, Copy, Calendar, Tag, User, GraduationCap
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
  content?: string;
  questions?: CAQuestion[];
  durationMinutes?: number;
  totalQuestions?: number;
}

function renderOptionContent(text: string) {
  if (!text) return '';
  const imgTagMatch = text.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgTagMatch) {
    const remainingText = text.replace(/<img[^>]*>/gi, '').trim();
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
        <img src={imgTagMatch[1]} alt="Option" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
        {remainingText && <span>{remainingText}</span>}
      </span>
    );
  }
  if (/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(text.trim())) {
    return <img src={text.trim()} alt="Option" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />;
  }
  return text;
}

export default function PyqQuizClient({
  post,
  relatedPosts = []
}: {
  post: PyqPost;
  relatedPosts?: any[];
}) {
  const questions: CAQuestion[] = React.useMemo(() => {
    if (post.content) {
      const extracted = extractQuestionsFromContent(post.content);
      if (extracted && extracted.length > 0) {
        return extracted;
      }
    }
    if (Array.isArray(post.questions) && post.questions.length > 0) {
      return post.questions;
    }
    return [];
  }, [post.questions, post.content]);

  const totalQuestions = questions.length;
  const durationMinutes = post.durationMinutes || (totalQuestions > 50 ? 120 : 30);
  const durationSeconds = durationMinutes * 60;

  const [mode, setMode] = useState<'test' | 'study' | 'result'>('test');
  const [currentIdx, setCurrentIdx] = useState(0);

  // Test mode states
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: string }>({});
  const [markedForReview, setMarkedForReview] = useState<{ [qId: number]: boolean }>({});
  const [visitedQuestions, setVisitedQuestions] = useState<{ [qId: number]: boolean }>({ 1: true });
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Study mode states
  const [studyAnswers, setStudyAnswers] = useState<{ [qId: number]: string }>({});
  const [revealedSolutions, setRevealedSolutions] = useState<{ [qId: number]: boolean }>({});

  // Result states
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);

  // Handle URL mode query param (?mode=study or ?mode=test)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'study') setMode('study');
      else if (urlMode === 'test') setMode('test');
    }
  }, []);

  // Timer Countdown in Test Mode
  useEffect(() => {
    if (mode !== 'test' || !isTimerRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isTimerRunning, timeLeft]);

  // Format mm:ss or hh:mm:ss
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx] || null;

  // Jump to Question
  const handleJumpToQuestion = (idx: number) => {
    if (idx < 0 || idx >= totalQuestions) return;
    setCurrentIdx(idx);
    const targetQ = questions[idx];
    if (targetQ) {
      setVisitedQuestions(prev => ({ ...prev, [targetQ.id]: true }));
    }
  };

  // Option selection in Test Mode
  const handleSelectOptionInTest = (qId: number, optKey: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optKey
    }));
  };

  // Clear current response
  const handleClearResponse = (qId: number) => {
    setSelectedAnswers(prev => {
      const updated = { ...prev };
      delete updated[qId];
      return updated;
    });
  };

  // Mark for review toggle
  const handleToggleMarkReview = (qId: number) => {
    setMarkedForReview(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Save & Next
  const handleSaveAndNext = () => {
    if (currentIdx < totalQuestions - 1) {
      handleJumpToQuestion(currentIdx + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  // Submit test and calculate score
  const handleSubmitTest = () => {
    setIsTimerRunning(false);
    setTimeTakenSeconds(durationSeconds - timeLeft);

    let correct = 0;
    let incorrect = 0;

    questions.forEach(q => {
      const userAns = selectedAnswers[q.id];
      if (userAns) {
        if (userAns.toUpperCase() === q.correct_answer.toUpperCase()) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    setScore(correct);
    setCorrectCount(correct);
    setIncorrectCount(incorrect);
    setShowSubmitModal(false);
    setMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restart Test
  const handleRestartTest = () => {
    setSelectedAnswers({});
    setMarkedForReview({});
    setVisitedQuestions({ 1: true });
    setTimeLeft(durationSeconds);
    setIsTimerRunning(true);
    setCurrentIdx(0);
    setMode('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Study mode option selection
  const handleSelectOptionInStudy = (qId: number, optKey: string) => {
    setStudyAnswers(prev => ({
      ...prev,
      [qId]: optKey
    }));
    setRevealedSolutions(prev => ({
      ...prev,
      [qId]: true
    }));
  };

  // Share handlers
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://careerdiary.in/pyq/${post.slug || post.id}`;
  const shareTitle = `${post.title} – Free Online PYQ Mock Test on Career Diary!`;

  const copyToClipboard = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pageUrl);
      alert('Link copied to clipboard!');
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unvisitedCount = Math.max(0, totalQuestions - Object.keys(visitedQuestions).length);
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Header />
      <Navbar currentCategory="PYQ" />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '16px 14px 40px' }}>
        {/* Top Breadcrumb & Ad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#64748b', marginBottom: '14px', flexWrap: 'wrap' }}>
          <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</a>
          <span>/</span>
          <a href="/pyq" style={{ color: '#047857', textDecoration: 'none', fontWeight: 600 }}>Previous Year Questions (PYQ)</a>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{post.title}</span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <DisplayAd label="ADVERTISEMENT" />
        </div>

        {/* Top Hero / Title Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
            borderRadius: '16px',
            padding: '22px 24px',
            color: '#ffffff',
            boxShadow: '0 6px 20px rgba(4, 120, 87, 0.25)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '3px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700, color: '#fef08a', marginBottom: '8px', textTransform: 'uppercase' }}>
                <Flame size={13} color="#f59e0b" /> {post.exam || 'Official Exam PYQ'} {post.year ? `• ${post.year}` : ''}
              </div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)', fontWeight: 800, margin: '0 0 6px 0', lineHeight: 1.3 }}>
                {post.title}
              </h1>
              <div style={{ fontSize: '0.85rem', color: '#d1fae5', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span>📅 Date: {post.date || (post.postDate ? post.postDate.split('|')[0].trim() : '2026')}</span>
                <span>⏱️ Time: {durationMinutes} Mins</span>
                <span>📊 {totalQuestions} MCQs Questions</span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '5px', borderRadius: '10px' }}>
              <button
                onClick={() => setMode('test')}
                style={{
                  background: mode === 'test' ? '#ffffff' : 'transparent',
                  color: mode === 'test' ? '#064e3b' : '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '7px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Clock size={15} /> Live CBT Test
              </button>
              <button
                onClick={() => setMode('study')}
                style={{
                  background: mode === 'study' ? '#ffffff' : 'transparent',
                  color: mode === 'study' ? '#064e3b' : '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '7px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpen size={15} /> Instant Study Mode
              </button>
            </div>
          </div>
        </div>

        {/* ───────── 1. LIVE CBT TEST MODE ───────── */}
        {mode === 'test' && totalQuestions > 0 && currentQ && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 340px)', gap: '20px' }} className="pyq-cbt-grid">
            {/* Left: Active Question Card */}
            <div>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  padding: '22px 24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* Question Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#047857', color: '#ffffff', fontWeight: 800, fontSize: '0.9rem', padding: '4px 12px', borderRadius: '6px' }}>
                      Question {currentIdx + 1} of {totalQuestions}
                    </span>
                    {markedForReview[currentQ.id] && (
                      <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.78rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flag size={12} /> Marked for Review
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Marks: <strong style={{ color: '#16a34a' }}>+1.00</strong> / <strong style={{ color: '#dc2626' }}>-0.25</strong>
                  </div>
                </div>

                {/* Question Statement */}
                <div style={{ fontSize: '1.12rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.6, marginBottom: '22px', whiteSpace: 'pre-line' }}>
                  {currentQ.question}
                </div>

                {/* Optional Question Image */}
                {currentQ.image && (
                  <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <img src={currentQ.image} alt={`Question ${currentQ.id}`} style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }} />
                  </div>
                )}

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(currentQ.options).map(([optKey, optVal]) => {
                    if (!optVal) return null;
                    const isSelected = selectedAnswers[currentQ.id] === optKey;

                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOptionInTest(currentQ.id, optKey)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px 18px',
                          border: isSelected ? '2px solid #047857' : '1.5px solid #cbd5e1',
                          borderRadius: '12px',
                          background: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 4px 12px rgba(4, 120, 87, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isSelected ? '#047857' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {optKey}
                        </div>
                        <div
                          style={{
                            fontSize: '1rem',
                            color: isSelected ? '#064e3b' : '#1e293b',
                            fontWeight: isSelected ? 700 : 500,
                            lineHeight: 1.5,
                            whiteSpace: 'pre-line'
                          }}
                        >
                          {renderOptionContent(optVal)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '26px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleClearResponse(currentQ.id)}
                      disabled={!selectedAnswers[currentQ.id]}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        background: selectedAnswers[currentQ.id] ? '#ffffff' : '#f8fafc',
                        color: selectedAnswers[currentQ.id] ? '#64748b' : '#cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: selectedAnswers[currentQ.id] ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Clear Response
                    </button>
                    <button
                      onClick={() => handleToggleMarkReview(currentQ.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '7px',
                        border: '1px solid #d8b4fe',
                        background: markedForReview[currentQ.id] ? '#f3e8ff' : '#ffffff',
                        color: '#7e22ce',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Flag size={14} /> {markedForReview[currentQ.id] ? 'Unmark Review' : 'Mark for Review'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleJumpToQuestion(currentIdx - 1)}
                      disabled={currentIdx === 0}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: currentIdx === 0 ? '#cbd5e1' : '#334155',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ArrowLeft size={16} /> Previous
                    </button>
                    <button
                      onClick={handleSaveAndNext}
                      style={{
                        padding: '9px 22px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#047857',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(4, 120, 87, 0.3)'
                      }}
                    >
                      {currentIdx === totalQuestions - 1 ? 'Save & Review' : 'Save & Next'} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Under-Question Ad (Clean Square Display Banner) */}
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
                <SquareAd label={null} />
              </div>
            </div>

            {/* Right: Timer & Question Palette */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Countdown Timer Card */}
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
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Time Remaining
                </div>
                <div
                  style={{
                    fontFamily: 'Outfit, monospace',
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    color: timeLeft < 300 ? '#dc2626' : '#047857',
                    letterSpacing: '1px'
                  }}
                >
                  {formatTimer(timeLeft)}
                </div>
              </div>

              {/* Question Palette Card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '18px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    Question Palette ({totalQuestions})
                  </h3>
                </div>

                {/* Status Legend */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem', marginBottom: '16px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#16a34a', display: 'inline-block' }}></span>
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#dc2626', display: 'inline-block' }}></span>
                    <span>Unanswered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#7e22ce', display: 'inline-block' }}></span>
                    <span>Marked ({markedCount})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#94a3b8', display: 'inline-block' }}></span>
                    <span>Not Visited</span>
                  </div>
                </div>

                {/* 50-Question Palette Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                  {questions.map((q, idx) => {
                    const isAnswered = Boolean(selectedAnswers[q.id]);
                    const isMarked = Boolean(markedForReview[q.id]);
                    const isCurrent = currentIdx === idx;
                    const isVisited = Boolean(visitedQuestions[q.id]);

                    let bg = '#ffffff';
                    let col = '#334155';
                    let border = '1px solid #cbd5e1';

                    if (isAnswered) {
                      bg = '#16a34a';
                      col = '#ffffff';
                      border = '1px solid #15803d';
                    } else if (isMarked) {
                      bg = '#7e22ce';
                      col = '#ffffff';
                      border = '1px solid #6b21a8';
                    } else if (isVisited) {
                      bg = '#dc2626';
                      col = '#ffffff';
                      border = '1px solid #b91c1c';
                    } else {
                      bg = '#f1f5f9';
                      col = '#64748b';
                      border = '1px solid #e2e8f0';
                    }

                    if (isCurrent) {
                      border = '2.5px solid #0f172a';
                    }

                    return (
                      <button
                        key={q.id}
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
                    background: '#047857',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(4, 120, 87, 0.3)',
                    transition: 'background 0.15s'
                  }}
                >
                  🚀 Submit PYQ Test Now
                </button>
              </div>

              {/* Sidebar Square Ad (Clean Display Banner) */}
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
                <SquareAd label={null} />
              </div>
            </aside>
          </div>
        )}

        {/* ───────── 2. INSTANT STUDY MODE ───────── */}
        {mode === 'study' && totalQuestions > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontWeight: 700, color: '#064e3b', fontSize: '0.95rem' }}>
                💡 Instant Practice Mode: Click any option to test yourself, correct answer and detailed explanation will appear instantly!
              </div>
              <button
                onClick={() => setMode('test')}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Switch to Timed CBT Test
              </button>
            </div>

            {questions.map((q, idx) => {
              const userAns = studyAnswers[q.id];
              const isRevealed = revealedSolutions[q.id];

              return (
                <React.Fragment key={q.id}>
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1.5px solid #cbd5e1',
                      padding: '22px 24px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ background: '#f0fdf4', color: '#047857', fontWeight: 800, fontSize: '0.85rem', padding: '4px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                        Question {idx + 1}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.6, marginBottom: '18px', whiteSpace: 'pre-line' }}>
                      {q.question}
                    </div>

                    {/* Optional Question Image */}
                    {q.image && (
                      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                        <img src={q.image} alt={`Question ${q.id}`} style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }} />
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                      {Object.entries(q.options).map(([optKey, optVal]) => {
                        if (!optVal) return null;
                        const isSelected = userAns === optKey;
                        const isCorrect = q.correct_answer === optKey;

                        let optBg = '#ffffff';
                        let optBorder = '1.5px solid #cbd5e1';
                        let optColor = '#1e293b';

                        if (isRevealed) {
                          if (isCorrect) {
                            optBg = '#f0fdf4';
                            optBorder = '2px solid #16a34a';
                            optColor = '#15803d';
                          } else if (isSelected && !isCorrect) {
                            optBg = '#fef2f2';
                            optBorder = '2px solid #dc2626';
                            optColor = '#b91c1c';
                          }
                        }

                        return (
                          <div
                            key={optKey}
                            onClick={() => handleSelectOptionInStudy(q.id, optKey)}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: optBorder,
                              background: optBg,
                              color: optColor,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              fontSize: '0.95rem',
                              fontWeight: isSelected || (isRevealed && isCorrect) ? 700 : 500
                            }}
                          >
                            <span style={{ width: '26px', height: '26px', borderRadius: '6px', background: isRevealed && isCorrect ? '#16a34a' : '#f1f5f9', color: isRevealed && isCorrect ? '#ffffff' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800 }}>
                              {optKey}
                            </span>
                            <span style={{ whiteSpace: 'pre-line' }}>{renderOptionContent(optVal)}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {isRevealed && (
                      <div
                        style={{
                          background: '#f8fafc',
                          borderLeft: '4px solid #047857',
                          padding: '14px 16px',
                          borderRadius: '6px',
                          marginTop: '12px'
                        }}
                      >
                        <div style={{ fontWeight: 800, color: '#064e3b', marginBottom: '6px', fontSize: '0.92rem' }}>
                          ✅ Correct Answer: Option ({q.correct_answer})
                        </div>
                        <div style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                          {q.solution}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clean Square Display Ad every 5 questions */}
                  {(idx + 1) % 5 === 0 && idx !== questions.length - 1 && (
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        padding: '14px',
                        margin: '6px 0',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '8px' }}>
                        ADVERTISEMENT
                      </div>
                      <SquareAd label={null} />
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
                background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '30px 24px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(4, 120, 87, 0.25)'
              }}
            >
              <Trophy size={48} style={{ margin: '0 auto 12px', color: '#fbbf24' }} />
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 900, margin: '0 0 6px 0' }}>
                PYQ Mock Test Completed!
              </h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#d1fae5' }}>
                Here is your detailed performance report for {post.title}:
              </p>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px 12px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>TOTAL SCORE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fef08a', marginTop: '4px' }}>{score} / {totalQuestions}</div>
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
                    color: '#064e3b',
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
                  <RotateCcw size={16} /> Retake PYQ Mock Test
                </button>
              </div>
            </div>

            {/* In-Between Ad */}
            <DisplayAd label="ADVERTISEMENT" />

            {/* Question by Question Review */}
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Detailed Question Solutions & Explanations ({totalQuestions})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questions.map((q, idx) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns && userAns.toUpperCase() === q.correct_answer.toUpperCase();
                  const isAttempted = Boolean(userAns);

                  return (
                    <div
                      key={q.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: isCorrect ? '2px solid #86efac' : isAttempted ? '2px solid #fca5a5' : '1px solid #cbd5e1',
                        padding: '18px 20px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 800, color: '#047857', fontSize: '0.9rem' }}>
                          Q{idx + 1}.
                        </span>
                        {isCorrect ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.78rem', padding: '3px 10px', borderRadius: '4px' }}>
                            ✓ Correct (+1.00)
                          </span>
                        ) : isAttempted ? (
                          <span style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: 800, fontSize: '0.78rem', padding: '3px 10px', borderRadius: '4px' }}>
                            ✗ Incorrect (-0.25)
                          </span>
                        ) : (
                          <span style={{ background: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: '0.78rem', padding: '3px 10px', borderRadius: '4px' }}>
                            Not Attempted
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {q.question}
                      </div>

                      {/* Optional Question Image */}
                      {q.image && (
                        <div style={{ marginBottom: '14px', textAlign: 'center' }}>
                          <img src={q.image} alt={`Question ${q.id}`} style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }} />
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                        {Object.entries(q.options).map(([optKey, optVal]) => {
                          if (!optVal) return null;
                          const isOptionCorrect = q.correct_answer === optKey;
                          const isOptionChosen = userAns === optKey;

                          let bg = '#ffffff';
                          let border = '1px solid #cbd5e1';
                          let textCol = '#334155';

                          if (isOptionCorrect) {
                            bg = '#f0fdf4';
                            border = '2px solid #16a34a';
                            textCol = '#15803d';
                          } else if (isOptionChosen && !isOptionCorrect) {
                            bg = '#fef2f2';
                            border = '2px solid #dc2626';
                            textCol = '#b91c1c';
                          }

                          return (
                            <div
                              key={optKey}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border,
                                background: bg,
                                color: textCol,
                                fontSize: '0.9rem',
                                fontWeight: isOptionCorrect || isOptionChosen ? 700 : 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              <span style={{ fontWeight: 800 }}>({optKey})</span>
                              <span style={{ whiteSpace: 'pre-line' }}>{renderOptionContent(optVal)}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', borderLeft: '4px solid #047857', fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        <strong style={{ color: '#064e3b' }}>Detailed Solution:</strong> {q.solution}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ───────── 4. FALLBACK RAW HTML / EMBEDDED CONTENT (If no extracted questions) ───────── */}
        {totalQuestions === 0 && post.content && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #cbd5e1',
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            {(() => {
              const lower = post.content.toLowerCase();
              const isFullDoc = lower.includes('<!doctype') || lower.includes('<html') || lower.includes('<script');

              if (isFullDoc) {
                return (
                  <iframe
                    srcDoc={post.content}
                    title={post.title}
                    sandbox="allow-same-origin allow-scripts"
                    style={{
                      width: '100%',
                      minHeight: '800px',
                      border: 'none',
                      display: 'block',
                      background: '#ffffff'
                    }}
                  />
                );
              }

              return (
                <div
                  className="pyq-rich-html-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{ fontSize: '1rem', lineHeight: 1.7, color: '#1e293b' }}
                />
              );
            })()}
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px'
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '28px',
                maxWidth: '460px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                textAlign: 'center'
              }}
            >
              <AlertTriangle size={48} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                Submit PYQ Mock Test?
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 20px 0' }}>
                Are you sure you want to finish this test? Once submitted, your score and detailed solutions will be displayed.
              </p>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.88rem' }}>
                <div>Answered: <strong style={{ color: '#16a34a' }}>{answeredCount}</strong></div>
                <div>Unanswered: <strong style={{ color: '#dc2626' }}>{totalQuestions - answeredCount}</strong></div>
                <div>Marked: <strong style={{ color: '#7e22ce' }}>{markedCount}</strong></div>
                <div>Time Left: <strong>{formatTimer(timeLeft)}</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTest}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#047857',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
