'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { DisplayAd } from '../components/AdSenseBanner';
import { QuizSet, Question, getAllQuizSets, getQuizSetBySlug } from '../data/quizRegistry';
import {
  BookOpen,
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Bookmark,
  Share2,
  Search,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Flag,
  ArrowRight,
  Filter,
  Check,
  Eye,
  EyeOff,
  Trophy,
  AlertCircle,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';

interface StudyQuizPageProps {
  initialSlug?: string;
  initialMode?: 'hub' | 'study' | 'test';
}

export default function StudyQuizPage({ initialSlug = 'bssc-cgl-set-1', initialMode = 'hub' }: StudyQuizPageProps) {
  const allSets = useMemo(() => getAllQuizSets(), []);
  const [selectedSet, setSelectedSet] = useState<QuizSet>(() => {
    return getQuizSetBySlug(initialSlug) || allSets[0];
  });

  const [mode, setMode] = useState<'hub' | 'study' | 'test' | 'result'>(initialMode);

  // ───────── STUDY MODE STATE ─────────
  const [studyTopic, setStudyTopic] = useState<string>('All');
  const [studyDifficulty, setStudyDifficulty] = useState<string>('All');
  const [studySearch, setStudySearch] = useState<string>('');
  const [revealedAnswers, setRevealedAnswers] = useState<{ [qId: string]: boolean }>({});
  const [userSelectedOptions, setUserSelectedOptions] = useState<{ [qId: string]: string }>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState<boolean>(false);

  // ───────── TEST MODE STATE ─────────
  const [testTimeRemaining, setTestTimeRemaining] = useState<number>(() => selectedSet.durationMinutes * 60);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [testAnswers, setTestAnswers] = useState<{ [qId: string]: string }>({});
  const [markedForReview, setMarkedForReview] = useState<{ [qId: string]: boolean }>({});
  const [visitedQuestions, setVisitedQuestions] = useState<{ [qId: string]: boolean }>({});
  const [testSectionFilter, setTestSectionFilter] = useState<string>('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [showPaletteMobile, setShowPaletteMobile] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load bookmarks and URL query params
  useEffect(() => {
    try {
      const saved = localStorage.getItem('careerdiary_quiz_bookmarks');
      if (saved) setBookmarkedQuestions(JSON.parse(saved));
    } catch (_) {}

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'study') {
        setMode('study');
      } else if (urlMode === 'test') {
        startTest();
      }
    }
  }, []);

  const toggleBookmark = (qId: string) => {
    setBookmarkedQuestions(prev => {
      const next = prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId];
      try {
        localStorage.setItem('careerdiary_quiz_bookmarks', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Test Timer countdown
  useEffect(() => {
    if (mode === 'test' && isTestRunning) {
      timerRef.current = setInterval(() => {
        setTestTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isTestRunning]);

  // Mark visited question in test mode
  useEffect(() => {
    if (mode === 'test' && selectedSet.questions[currentQuestionIndex]) {
      const qId = selectedSet.questions[currentQuestionIndex].id;
      setVisitedQuestions(prev => ({ ...prev, [qId]: true }));
    }
  }, [currentQuestionIndex, mode, selectedSet]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // ───────── STUDY MODE FILTERING ─────────
  const filteredStudyQuestions = useMemo(() => {
    return selectedSet.questions.filter(q => {
      if (studyTopic !== 'All' && q.topic !== studyTopic) return false;
      if (studyDifficulty !== 'All' && q.difficulty !== studyDifficulty) return false;
      if (showOnlyBookmarked && !bookmarkedQuestions.includes(q.id)) return false;
      if (studySearch.trim()) {
        const query = studySearch.toLowerCase().trim();
        const inQ = q.question.toLowerCase().includes(query);
        const inSol = (q.solution || '').toLowerCase().includes(query);
        const inOpt = Object.values(q.options).some(o => o.toLowerCase().includes(query));
        if (!inQ && !inSol && !inOpt) return false;
      }
      return true;
    });
  }, [selectedSet, studyTopic, studyDifficulty, showOnlyBookmarked, bookmarkedQuestions, studySearch]);

  const uniqueTopics = useMemo(() => {
    const topics = Array.from(new Set(selectedSet.questions.map(q => q.topic)));
    return ['All', ...topics];
  }, [selectedSet]);

  // ───────── TEST NAVIGATION & ACTIONS ─────────
  const startTest = () => {
    setTestTimeRemaining(selectedSet.durationMinutes * 60);
    setTestAnswers({});
    setMarkedForReview({});
    setVisitedQuestions({});
    setCurrentQuestionIndex(0);
    setIsTestRunning(true);
    setMode('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOptionInTest = (qId: string, optKey: string) => {
    setTestAnswers(prev => ({
      ...prev,
      [qId]: optKey
    }));
  };

  const clearCurrentResponse = () => {
    const currentQ = selectedSet.questions[currentQuestionIndex];
    if (!currentQ) return;
    setTestAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const toggleMarkForReview = () => {
    const currentQ = selectedSet.questions[currentQuestionIndex];
    if (!currentQ) return;
    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleFinalSubmit = () => {
    setIsTestRunning(false);
    setIsSubmitModalOpen(false);
    setMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ───────── TEST SCORE CARD CALCULATION ─────────
  const testResults = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    const topicStats: { [t: string]: { total: number; correct: number; incorrect: number; skipped: number } } = {};

    selectedSet.questions.forEach(q => {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0, incorrect: 0, skipped: 0 };
      }
      topicStats[q.topic].total += 1;

      const userAns = testAnswers[q.id];
      if (!userAns) {
        skipped += 1;
        topicStats[q.topic].skipped += 1;
      } else if (userAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase()) {
        correct += 1;
        topicStats[q.topic].correct += 1;
      } else {
        incorrect += 1;
        topicStats[q.topic].incorrect += 1;
      }
    });

    const totalQuestions = selectedSet.questions.length;
    const attempted = correct + incorrect;
    const rawScore = (correct * selectedSet.marksPerQuestion) - (incorrect * selectedSet.negativeMarks);
    const score = Math.max(0, rawScore);
    const percentage = ((score / selectedSet.totalMarks) * 100).toFixed(1);
    const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : '0';
    const timeSpentSecs = (selectedSet.durationMinutes * 60) - testTimeRemaining;

    return {
      totalQuestions,
      attempted,
      correct,
      incorrect,
      skipped,
      score,
      rawScore,
      percentage,
      accuracy,
      timeSpentSecs,
      topicStats
    };
  }, [selectedSet, testAnswers, testTimeRemaining]);

  // Current question in test mode
  const currentTestQuestion = selectedSet.questions[currentQuestionIndex];

  return (
    <div className="study-quiz-wrapper" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      {/* 1. Career Diary Header */}
      <Header />

      {/* 2. Navigation Bar */}
      <Navbar currentCategory="STUDY_QUIZ" onNavigate={(path: string) => (window.location.href = path)} />

      {/* Main Content Area */}
      <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 12px 60px' }}>

        {/* ─────────── 1. HUB / HOME VIEW ─────────── */}
        {mode === 'hub' && (
          <div className="hub-view">
            {/* Hero Header Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '32px 24px',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)',
                marginBottom: '28px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ maxWidth: '750px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '12px' }}>
                  <Sparkles size={14} color="#fde047" /> FREE PRACTICE PORTAL • CAREER DIARY
                </div>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.25, margin: '0 0 10px 0' }}>
                  Study Material &amp; Free Mock Test Series
                </h1>
                <p style={{ fontSize: '0.98rem', opacity: 0.92, lineHeight: 1.5, margin: '0 0 20px 0' }}>
                  उच्च स्तरीय अभ्यास प्रश्न, विस्तृत द्विभाषी (Hindi/English) समाधान और रीयल-टाइम परीक्षा टाइमर के साथ अपनी तैयारी को दें नया मुकाम।
                </p>

                {/* Highlights Badge Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '8px' }}>
                    <CheckCircle2 size={16} color="#86efac" /> 100% Free Access
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '8px' }}>
                    <Clock size={16} color="#93c5fd" /> Official Exam Timing
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '8px' }}>
                    <BookOpen size={16} color="#fde047" /> Detailed Step Solutions
                  </div>
                </div>
              </div>
            </div>

            {/* Section Heading */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  उपलब्ध मॉक टेस्ट और अध्ययन सेट (Available Sets)
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                  अपनी परीक्षा चुनें और अभ्यास या लाइव टेस्ट शुरू करें
                </p>
              </div>
            </div>

            {/* Set Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {allSets.map(set => (
                <div
                  key={set.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                >
                  {/* Card Top */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                        {set.exam}
                      </span>
                      {set.badge && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#dc2626', backgroundColor: '#fef2f2', padding: '3px 8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                          ★ {set.badge}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0' }}>
                      <a href={set.urlPath} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {set.title}
                      </a>
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 16px 0' }}>
                      {set.subtitle}
                    </p>

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '16px', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Questions</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{set.total_questions}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Time</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{set.durationMinutes}m</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Total Marks</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{set.totalMarks}</div>
                      </div>
                    </div>

                    {/* Subjects included */}
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        शामिल विषय (Syllabus Coverage):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {Object.entries(set.topicsSummary).map(([topic, count]) => (
                          <span key={topic} style={{ fontSize: '0.75rem', color: '#334155', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                            {topic} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions: Dual buttons (Study Mode vs Test Mode) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                    <a
                      href={`${set.urlPath}?mode=study`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSet(set);
                        setMode('study');
                        if (typeof window !== 'undefined') {
                          window.history.pushState({}, '', `${set.urlPath}?mode=study`);
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <BookOpen size={16} /> Study Mode
                    </a>
                    <a
                      href={`${set.urlPath}?mode=test`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSet(set);
                        if (typeof window !== 'undefined') {
                          window.history.pushState({}, '', `${set.urlPath}?mode=test`);
                        }
                        startTest();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Clock size={16} /> Take Quiz
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Display Ad Slot in Hub View */}
            <div style={{ marginTop: '36px' }}>
              <DisplayAd label="ADVERTISEMENT" />
            </div>
          </div>
        )}

        {/* ─────────── 2. STUDY MODE VIEW ─────────── */}
        {mode === 'study' && (
          <div className="study-view">
            {/* Breadcrumb & Switcher */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <button
                  onClick={() => {
                    setMode('hub');
                    if (typeof window !== 'undefined') {
                      window.history.pushState({}, '', '/test-series');
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  ← All Sets
                </button>
                <span style={{ color: '#94a3b8' }}>/</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedSet.title} (Study Mode)</span>
              </div>

              {/* Mode Toggle Pills */}
              <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '8px', padding: '3px' }}>
                <button
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    backgroundColor: '#ffffff',
                    color: '#2563eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'default'
                  }}
                >
                  📖 Study (अध्ययन)
                </button>
                <button
                  onClick={startTest}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  ⏱️ Take Quiz (टेस्ट)
                </button>
              </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              {/* Search input */}
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="प्रश्न, विषय या कीवर्ड खोजें (Search questions, articles, formulas)..."
                  value={studySearch}
                  onChange={(e) => setStudySearch(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px 10px 38px',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Topic Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>विषय (Topic):</span>
                {uniqueTopics.map(t => (
                  <button
                    key={t}
                    onClick={() => setStudyTopic(t)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: studyTopic === t ? '#2563eb' : '#f1f5f9',
                      color: studyTopic === t ? '#ffffff' : '#334155'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Difficulty & Quick Toggles */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '0.82rem', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#475569', fontWeight: 500 }}>कठिनाई (Difficulty):</span>
                  {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                    <button
                      key={d}
                      onClick={() => setStudyDifficulty(d)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: studyDifficulty === d ? '#2563eb' : '#e2e8f0',
                        backgroundColor: studyDifficulty === d ? '#eff6ff' : '#ffffff',
                        color: studyDifficulty === d ? '#2563eb' : '#64748b',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#475569', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={showOnlyBookmarked}
                      onChange={(e) => setShowOnlyBookmarked(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    ⭐ Bookmarks ({bookmarkedQuestions.length})
                  </label>

                  <button
                    onClick={() => {
                      const allRevealed = filteredStudyQuestions.every(q => revealedAnswers[q.id]);
                      const next: { [qId: string]: boolean } = {};
                      filteredStudyQuestions.forEach(q => {
                        next[q.id] = !allRevealed;
                      });
                      setRevealedAnswers(next);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {filteredStudyQuestions.every(q => revealedAnswers[q.id]) ? 'Hide All Answers' : 'Reveal All Answers'}
                  </button>
                </div>
              </div>
            </div>

            {/* Questions Counter Header */}
            <div style={{ marginBottom: '14px', fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>
              Showing {filteredStudyQuestions.length} of {selectedSet.total_questions} Questions
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredStudyQuestions.map((q, idx) => {
                const isAnswerRevealed = !!revealedAnswers[q.id];
                const selectedOpt = userSelectedOptions[q.id];
                const isBookmarked = bookmarkedQuestions.includes(q.id);

                return (
                  <div
                    key={q.id}
                    id={q.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '20px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Question Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#1e3a8a', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                          Q{idx + 1} ({q.id})
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                          {q.topic} {q.subtopic ? `• ${q.subtopic}` : ''}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: q.difficulty === 'Easy' ? '#f0fdf4' : q.difficulty === 'Medium' ? '#fefce8' : '#faf5ff',
                            color: q.difficulty === 'Easy' ? '#16a34a' : q.difficulty === 'Medium' ? '#ca8a04' : '#9333ea'
                          }}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        title={isBookmarked ? 'Remove Bookmark' : 'Save to Bookmark'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isBookmarked ? '#eab308' : '#94a3b8',
                          padding: '4px'
                        }}
                      >
                        <Bookmark size={20} fill={isBookmarked ? '#eab308' : 'none'} />
                      </button>
                    </div>

                    {/* Question Text */}
                    <div style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.6, color: '#0f172a', whiteSpace: 'pre-line', marginBottom: '16px' }}>
                      {q.question}
                    </div>

                    {/* Optional Question Image */}
                    {q.image && (
                      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                        <img src={q.image} alt={`Question ${q.id}`} style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      </div>
                    )}

                    {/* Options (A, B, C, D) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                      {Object.entries(q.options).map(([optKey, optText]) => {
                        const isSelected = selectedOpt === optKey;
                        const isCorrect = q.correct_answer === optKey;
                        let optBg = '#f8fafc';
                        let optBorder = '#e2e8f0';
                        let optColor = '#334155';

                        if (isAnswerRevealed) {
                          if (isCorrect) {
                            optBg = '#f0fdf4';
                            optBorder = '#86efac';
                            optColor = '#166534';
                          } else if (isSelected) {
                            optBg = '#fef2f2';
                            optBorder = '#fca5a5';
                            optColor = '#991b1b';
                          }
                        } else if (isSelected) {
                          optBg = '#eff6ff';
                          optBorder = '#93c5fd';
                          optColor = '#1d4ed8';
                        }

                        return (
                          <div
                            key={optKey}
                            onClick={() => {
                              setUserSelectedOptions(prev => ({
                                ...prev,
                                [q.id]: optKey
                              }));
                            }}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: `1.5px solid ${optBorder}`,
                              backgroundColor: optBg,
                              color: optColor,
                              fontSize: '0.9rem',
                              fontWeight: isSelected || (isAnswerRevealed && isCorrect) ? 600 : 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: isAnswerRevealed && isCorrect ? '#22c55e' : isSelected ? '#2563eb' : '#e2e8f0',
                                color: isAnswerRevealed && isCorrect || isSelected ? '#ffffff' : '#475569',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                flexShrink: 0,
                                marginTop: '2px'
                              }}
                            >
                              {optKey}
                            </span>
                            <span style={{ flex: 1, whiteSpace: 'pre-line' }}>{optText}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Action: Reveal / Hide Answer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => {
                          setRevealedAnswers(prev => ({
                            ...prev,
                            [q.id]: !prev[q.id]
                          }));
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}
                      >
                        {isAnswerRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                        {isAnswerRevealed ? 'Hide Solution (समाधान छिपाएँ)' : 'Show Answer & Explanation (उत्तर एवं व्याख्या)'}
                      </button>

                      {isAnswerRevealed && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={16} /> Correct: {q.correct_answer}
                        </span>
                      )}
                    </div>

                    {/* Solution Details Card */}
                    {isAnswerRevealed && (
                      <div
                        style={{
                          marginTop: '14px',
                          backgroundColor: '#f8fafc',
                          borderLeft: '4px solid #22c55e',
                          borderRadius: '0 8px 8px 0',
                          padding: '14px 16px',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          color: '#1e293b'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          💡 विस्तृत व्याख्या एवं समाधान (Detailed Solution):
                        </div>
                        <div style={{ whiteSpace: 'pre-line' }}>
                          {q.solution}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ad Banner after questions list */}
            <div style={{ marginTop: '36px' }}>
              <DisplayAd label="ADVERTISEMENT" />
            </div>
          </div>
        )}

        {/* ─────────── 3. LIVE CBT TEST / QUIZ MODE ─────────── */}
        {mode === 'test' && (
          <div className="test-view">
            {/* Top Fixed Sticky Test Header */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  {selectedSet.exam} • CBT MOCK TEST
                </span>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Question {currentQuestionIndex + 1} of {selectedSet.total_questions}
                </h2>
              </div>

              {/* Timer Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: testTimeRemaining < 300 ? '#fef2f2' : '#f0fdf4',
                  border: `1.5px solid ${testTimeRemaining < 300 ? '#fca5a5' : '#86efac'}`,
                  color: testTimeRemaining < 300 ? '#dc2626' : '#166534',
                  padding: '6px 16px',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  fontFamily: 'monospace'
                }}
              >
                <Clock size={18} />
                <span>{formatTime(testTimeRemaining)}</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setShowPaletteMobile(!showPaletteMobile)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  <Layers size={16} /> Question Palette
                </button>
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(22,163,74,0.2)'
                  }}
                >
                  Submit Test
                </button>
              </div>
            </div>

            {/* Test Body: Two Column layout (Question viewport + Palette) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

              {/* Left Column: Current Question */}
              {currentTestQuestion && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '24px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Subject Tag & Marking Info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '4px' }}>
                        {currentTestQuestion.topic}
                      </span>
                      {currentTestQuestion.subtopic && (
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>• {currentTestQuestion.subtopic}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16a34a' }}>
                      Mark: +{selectedSet.marksPerQuestion} | Neg: -{selectedSet.negativeMarks}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.65, color: '#0f172a', whiteSpace: 'pre-line', marginBottom: '22px' }}>
                    {currentTestQuestion.question}
                  </div>

                  {/* Optional Question Image */}
                  {currentTestQuestion.image && (
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                      <img src={currentTestQuestion.image} alt="Question" style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px' }} />
                    </div>
                  )}

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                    {Object.entries(currentTestQuestion.options).map(([optKey, optText]) => {
                      const isSelected = testAnswers[currentTestQuestion.id] === optKey;
                      return (
                        <div
                          key={optKey}
                          onClick={() => handleSelectOptionInTest(currentTestQuestion.id, optKey)}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
                              color: isSelected ? '#ffffff' : '#475569',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            {optKey}
                          </span>
                          <span style={{ fontSize: '0.95rem', color: isSelected ? '#1d4ed8' : '#334155', fontWeight: isSelected ? 600 : 500, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                            {optText}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Navigation Toolbar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={clearCurrentResponse}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#64748b',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Clear Response
                      </button>
                      <button
                        onClick={toggleMarkForReview}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '6px',
                          border: '1px solid #c084fc',
                          backgroundColor: markedForReview[currentTestQuestion.id] ? '#f3e8ff' : '#ffffff',
                          color: '#7e22ce',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {markedForReview[currentTestQuestion.id] ? '✓ Marked for Review' : 'Mark for Review'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: currentQuestionIndex === 0 ? '#f1f5f9' : '#ffffff',
                          color: currentQuestionIndex === 0 ? '#94a3b8' : '#334155',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => {
                          if (currentQuestionIndex < selectedSet.questions.length - 1) {
                            setCurrentQuestionIndex(prev => prev + 1);
                          } else {
                            setIsSubmitModalOpen(true);
                          }
                        }}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                        }}
                      >
                        {currentQuestionIndex === selectedSet.questions.length - 1 ? 'Save & Review' : 'Save & Next →'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Column: Question Palette Sidebar */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '18px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  position: 'sticky',
                  top: '80px'
                }}
              >
                {/* Palette Summary Legend */}
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>
                  Question Palette ({selectedSet.total_questions})
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', marginBottom: '14px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    Answered: {Object.keys(testAnswers).length}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    Unanswered: {Object.keys(visitedQuestions).length - Object.keys(testAnswers).length}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                    Review: {Object.values(markedForReview).filter(Boolean).length}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                    Not Visited: {selectedSet.total_questions - Object.keys(visitedQuestions).length}
                  </div>
                </div>

                {/* Section filter in palette */}
                <div style={{ marginBottom: '12px' }}>
                  <select
                    value={testSectionFilter}
                    onChange={(e) => setTestSectionFilter(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    <option value="All">All Sections (150)</option>
                    {uniqueTopics.filter(t => t !== 'All').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Question Numbers Grid */}
                <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', paddingRight: '4px' }}>
                  {selectedSet.questions.map((q, i) => {
                    if (testSectionFilter !== 'All' && q.topic !== testSectionFilter) return null;

                    const isCurrent = i === currentQuestionIndex;
                    const isAnswered = !!testAnswers[q.id];
                    const isMarked = !!markedForReview[q.id];
                    const isVisited = !!visitedQuestions[q.id];

                    let bg = '#f1f5f9';
                    let textCol = '#475569';
                    let border = '1px solid #e2e8f0';

                    if (isAnswered) {
                      bg = '#22c55e';
                      textCol = '#ffffff';
                      border = 'none';
                    } else if (isMarked) {
                      bg = '#a855f7';
                      textCol = '#ffffff';
                      border = 'none';
                    } else if (isVisited) {
                      bg = '#ef4444';
                      textCol = '#ffffff';
                      border = 'none';
                    }

                    if (isCurrent) {
                      border = '2.5px solid #1e3a8a';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(i)}
                        style={{
                          height: '34px',
                          borderRadius: '6px',
                          border,
                          backgroundColor: bg,
                          color: textCol,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Confirmation Modal */}
            {isSubmitModalOpen && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 9999,
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    maxWidth: '480px',
                    width: '100%',
                    padding: '28px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    textAlign: 'center'
                  }}
                >
                  <AlertCircle size={44} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                    क्या आप टेस्ट सबमिट करना चाहते हैं?
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                    Are you sure you want to submit? Once submitted, your scorecard and detailed answer key will be generated.
                  </p>

                  {/* Summary Table */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '24px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedSet.total_questions}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>Answered</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>{Object.keys(testAnswers).length}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>Left</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>{selectedSet.total_questions - Object.keys(testAnswers).length}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      onClick={() => setIsSubmitModalOpen(false)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      वापस टेस्ट दें (Resume)
                    </button>
                    <button
                      onClick={handleFinalSubmit}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      हाँ, सबमिट करें (Submit)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────── 4. TEST RESULT & SCORECARD VIEW ─────────── */}
        {mode === 'result' && (
          <div className="result-view">
            {/* Scorecard Hero Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
                marginBottom: '28px'
              }}
            >
              <Trophy size={48} color="#facc15" style={{ margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                मॉक टेस्ट परिणाम (Test Performance Scorecard)
              </h2>
              <p style={{ fontSize: '0.95rem', opacity: 0.9, margin: '0 0 24px 0' }}>
                {selectedSet.title} • Negative Marking Scheme (-1 / +4)
              </p>

              {/* Major Score Circle */}
              <div
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  padding: '20px 40px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  marginBottom: '24px'
                }}
              >
                <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 }}>Your Score</div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.1, color: '#fde047' }}>
                  {testResults.score} <span style={{ fontSize: '1.2rem', color: '#ffffff', opacity: 0.7 }}>/ {selectedSet.totalMarks}</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '4px', color: '#86efac' }}>
                  Percentage: {testResults.percentage}% | Accuracy: {testResults.accuracy}%
                </div>
              </div>

              {/* 4 Quick Stat Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', maxWidth: '680px', margin: '0 auto' }}>
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Attempted</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{testResults.attempted}</div>
                </div>
                <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '12px', borderRadius: '10px', color: '#86efac' }}>
                  <div style={{ fontSize: '0.75rem' }}>Correct (+4)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{testResults.correct}</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '10px', color: '#fca5a5' }}>
                  <div style={{ fontSize: '0.75rem' }}>Incorrect (-1)</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{testResults.incorrect}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Skipped</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{testResults.skipped}</div>
                </div>
              </div>
            </div>

            {/* Subject-Wise Performance Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '28px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a' }}>
                विषयवार विश्लेषण (Subject-wise Performance Breakdown)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '12px' }}>Subject (विषय)</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Questions</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Attempted</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#16a34a' }}>Correct</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: '#dc2626' }}>Wrong</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(testResults.topicStats).map(([topic, stat]) => {
                      const topicAtt = stat.correct + stat.incorrect;
                      const acc = topicAtt > 0 ? ((stat.correct / topicAtt) * 100).toFixed(0) + '%' : '-';
                      return (
                        <tr key={topic} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>{topic}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{stat.total}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{topicAtt}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#16a34a' }}>{stat.correct}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#dc2626' }}>{stat.incorrect}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>{acc}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
              <button
                onClick={startTest}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(37,99,235,0.2)'
                }}
              >
                <RotateCcw size={18} /> Retake Test (दोबारा टेस्ट दें)
              </button>
              <button
                onClick={() => {
                  setMode('study');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={18} /> Detailed Answer Key &amp; Study (सभी प्रश्नों का हल)
              </button>
            </div>

            {/* Display Ad Slot in Result View */}
            <div style={{ marginTop: '20px' }}>
              <DisplayAd label="ADVERTISEMENT" />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
