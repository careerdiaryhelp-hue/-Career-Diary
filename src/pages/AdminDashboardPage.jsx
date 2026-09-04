import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Layers, Megaphone, PlusSquare, FilePlus, Trash2, Search,
  LogOut, Eye, BookmarkCheck, ChevronRight, X, Save, UploadCloud, Edit3,
  Download, BarChart3, FileText, IdCard, CheckSquare, GraduationCap, Bookmark, Briefcase,
  RotateCcw, RotateCw, Bold, Italic, Underline, Strikethrough, Code, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link2, Unlink,
  Image, Video, Table, Maximize2, Minimize2, FileCode, Globe,
  ChevronDown, ChevronUp, Palette, Highlighter, CheckCircle2, AlertCircle, Info,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus, Copy, ExternalLink,
  Calendar, Link as LinkIcon
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'Select Category' },
  { value: 'LATEST JOB', label: 'Latest Job', icon: Briefcase },
  { value: 'ADMIT CARD', label: 'Admit Card', icon: IdCard },
  { value: 'RESULT', label: 'Result', icon: CheckSquare },
  { value: 'ANSWER KEY', label: 'Answer Key', icon: CheckSquare },
  { value: 'SYLLABUS', label: 'Syllabus', icon: FileText },
  { value: 'ADMISSION', label: 'Admission', icon: GraduationCap },
];

const EMPTY_FORM = {
  title: '',
  category: 'LATEST JOB',
  organization: '',
  vacancies: '',
  totalPosts: '',
  displayOrder: 0,
  featured: false,
  slug: '',
  lastDate: '',
  appStart: '',
  examDate: '',
  badge: 'New!',
  bannerColor: 'pink',
  description: '',
  content: '',
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
  applyUrl: '',
  notificationUrl: '',
  officialUrl: '',
  feeGen: '',
  feeSc: '',
  minAge: '18 Years',
  maxAge: '37 Years',
  qualification: '',
  state: 'All India',
  importantLinks: {},
  importantDates: {},
  applicationFee: {},
  ageLimit: {},
};

export default function AdminDashboardPage({
  jobs,
  onAddJob,
  onDeleteJob,
  categories = [],
  onSaveCategories,
  breakingNews = [],
  onSaveBreakingNews,
  onBack,
  onLogout
}) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingJobId, setEditingJobId] = useState(null);
  const [importUrl, setImportUrl] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#fef08a');

  // Dynamic Categories Management State (Matching Screenshots 1 & 3)
  const [localCategories, setLocalCategories] = useState(() => {
    if (categories && categories.length > 0) return categories;
    try {
      const saved = localStorage.getItem('career_diary_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', name: 'Results', subtitle: 'Latest Exam Results 2026 - Check Merit Lists & Cut-Off Marks Online | [Career Diary 2026]', slug: '/results', order: 1, seoTitle: 'Results 2026', seoDescription: 'Download the [Result Pdf] All Result 2026 here. Download," "Direct Link," "Live," "Official." Get the direct link, exam date,...' },
      { id: '2', name: 'Admit Card', subtitle: 'Latest Exams Admit Card 2026 - Download Admit Card ,Exam Date& Online | [Career Diary 2026]', slug: '/admit-card', order: 2, seoTitle: 'Admit Cards 2026', seoDescription: 'Get the latest updates on admit cards and hall tickets. Download your exam call letters for SSC, Banking, Railways, and...' },
      { id: '3', name: 'Latest Jobs', subtitle: 'Latest Job 2026 @Careerdiary', slug: '/latest-jobs', order: 3, seoTitle: 'Latest Jobs 2026', seoDescription: 'Latest Government Jobs, Notifications, Apply Online...' },
      { id: '4', name: 'Answer Key', subtitle: 'Official Answer Keys', slug: '/answer-key', order: 4, seoTitle: 'Answer Key 2026', seoDescription: 'Download official answer keys and response sheets...' },
      { id: '5', name: 'Admission', subtitle: 'Admission Notices', slug: '/admission', order: 5, seoTitle: 'Admissions 2026', seoDescription: 'College, University, and School admissions 2026...' },
      { id: '6', name: 'Syllabus', subtitle: 'Exam Syllabus & Pattern', slug: '/syllabus', order: 6, seoTitle: 'Exam Syllabus 2026', seoDescription: 'Detailed exam syllabus and selection process...' },
    ];
  });

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    subtitle: '',
    slug: '',
    order: 0,
    seoTitle: '',
    seoDescription: ''
  });

  // Dynamic Breaking News Management State (Matching Screenshots 2 & 4)
  const [localBreakingNews, setLocalBreakingNews] = useState(() => {
    if (breakingNews && breakingNews.length > 0) return breakingNews;
    try {
      const saved = localStorage.getItem('career_diary_breaking_news');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', message: 'BPSSC Bihar Police Range Officer of Forest Recruitment 2026 Online Start', link: 'https://www.careerdiary.in/post/bpssc-bihar-police-range-officer-of-forest-recruitment-2026-online-form-16-post', priority: 0, expiry: '8/17/2026, 5:32:00 AM', active: true },
      { id: '2', message: 'Railway RRB Section Controller Recruitment 2026 Online Start', link: 'https://www.careerdiary.in/post/railway-rrb-section-controller-recruitment-2026', priority: 1, expiry: '8/15/2026, 4:53:00 PM', active: true },
      { id: '3', message: 'Patna High Court Ex-Cadre Assistant Recruitment 2026 Online start', link: 'https://www.careerdiary.in/post/patna-high-court-ex-cadre-assistant-recruitment-2026', priority: 2, expiry: '8/30/2026, 11:52:00 PM', active: true },
      { id: '4', message: 'JSSC 10+2 Inter Level JILCCE Recruitment 2026 Online Start', link: 'https://www.careerdiary.in/post/jssc-10-2-inter-level-jilcce-recruitment-2026-online-start', priority: 0, expiry: '9/8/2026, 5:20:00 AM', active: true },
      { id: '5', message: 'RRB Group D Level 1 Exam City & Admit Card Download', link: 'https://www.careerdiary.in/post/railway-rrb-group-d-admit-card-exam-city-2026-out', priority: 0, expiry: '8/31/2026, 11:21:00 PM', active: true },
    ];
  });

  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsForm, setNewsForm] = useState({
    category: 'Latest Job',
    message: '',
    link: '',
    expiry: '',
    priority: 0,
    active: true
  });

  // Sync external props if provided
  useEffect(() => {
    if (categories && categories.length > 0) setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (breakingNews && breakingNews.length > 0) setLocalBreakingNews(breakingNews);
  }, [breakingNews]);

  // In-App Toast State (Zero browser alert popups)
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3800);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // In-App Custom Input Modal State (Zero browser prompt popups)
  const [insertModal, setInsertModal] = useState({
    isOpen: false,
    type: null, // 'link' | 'image' | 'video' | 'import'
    title: '',
    label: '',
    placeholder: '',
    value: '',
  });
  const savedSelectionRef = useRef(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const visualEditorRef = useRef(null);
  const isVisualFocusedRef = useRef(false);

  const [activeTableState, setActiveTableState] = useState(null);
  const activeTableElementRef = useRef(null);
  const activeRowElementRef = useRef(null);
  const activeCellElementRef = useRef(null);

  const updateActiveTableInfo = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      return;
    }
    let node = sel.anchorNode;
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }
    const td = node?.closest('td, th');
    const tr = node?.closest('tr');
    const table = node?.closest('table');

    if (table && visualEditorRef.current?.contains(table)) {
      activeTableElementRef.current = table;
      activeRowElementRef.current = tr || null;
      activeCellElementRef.current = td || null;
      setActiveTableState({
        hasTable: true,
        rowIndex: tr ? tr.rowIndex : 0,
        cellIndex: td ? td.cellIndex : 0,
        totalRows: table.rows.length,
        totalCols: tr ? tr.cells.length : (table.rows[0]?.cells.length || 0)
      });
    } else {
      activeTableElementRef.current = null;
      activeRowElementRef.current = null;
      activeCellElementRef.current = null;
      setActiveTableState(null);
    }
  };

  const set = (key, val) => {
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === 'applyUrl' && val) {
        next.importantLinks = { ...(next.importantLinks || {}), 'Apply Online': val };
      }
      if (key === 'notificationUrl' && val) {
        next.importantLinks = { ...(next.importantLinks || {}), 'Download Official Notification PDF': val };
      }
      if (key === 'officialUrl' && val) {
        next.importantLinks = { ...(next.importantLinks || {}), 'Official Website': val };
      }
      return next;
    });
  };

  const updateCustomLink = (oldKey, newKey, newUrl) => {
    setForm(prev => {
      const nextLinks = { ...(prev.importantLinks || {}) };
      if (oldKey && oldKey !== newKey) {
        delete nextLinks[oldKey];
      }
      if (newKey && newKey.trim()) {
        nextLinks[newKey.trim()] = newUrl;
      }
      const updates = { importantLinks: nextLinks };
      const kl = (newKey || '').toLowerCase();
      if (kl.includes('apply') && newUrl) updates.applyUrl = newUrl;
      if ((kl.includes('notif') || kl.includes('pdf')) && newUrl) updates.notificationUrl = newUrl;
      if ((kl.includes('official') || kl.includes('website')) && newUrl) updates.officialUrl = newUrl;
      return { ...prev, ...updates };
    });
  };

  const removeCustomLink = (keyToRemove) => {
    setForm(prev => {
      const nextLinks = { ...(prev.importantLinks || {}) };
      delete nextLinks[keyToRemove];
      return { ...prev, importantLinks: nextLinks };
    });
  };

  const addCustomLink = () => {
    setForm(prev => ({
      ...prev,
      importantLinks: {
        ...(prev.importantLinks || {}),
        [`Important Link ${Object.keys(prev.importantLinks || {}).length + 1}`]: ''
      }
    }));
  };

  const updateDate = (oldKey, newKey, val) => {
    setForm(prev => {
      const nextDates = { ...(prev.importantDates || {}) };
      if (oldKey && oldKey !== newKey) delete nextDates[oldKey];
      if (newKey && newKey.trim()) nextDates[newKey.trim()] = val;
      const updates = { importantDates: nextDates };
      const kl = (newKey || '').toLowerCase();
      if (kl.includes('start') || kl.includes('begin')) updates.appStart = val;
      if (kl.includes('last') || kl.includes('end') || kl.includes('closing')) updates.lastDate = val;
      if (kl.includes('exam')) updates.examDate = val;
      return { ...prev, ...updates };
    });
  };

  const removeDate = (key) => {
    setForm(prev => {
      const nextDates = { ...(prev.importantDates || {}) };
      delete nextDates[key];
      return { ...prev, importantDates: nextDates };
    });
  };

  const addDate = () => {
    setForm(prev => ({
      ...prev,
      importantDates: {
        ...(prev.importantDates || {}),
        [`Date ${Object.keys(prev.importantDates || {}).length + 1}`]: ''
      }
    }));
  };

  const updateFee = (oldKey, newKey, val) => {
    setForm(prev => {
      const nextFees = { ...(prev.applicationFee || {}) };
      if (oldKey && oldKey !== newKey) delete nextFees[oldKey];
      if (newKey && newKey.trim()) nextFees[newKey.trim()] = val;
      const updates = { applicationFee: nextFees };
      const kl = (newKey || '').toLowerCase();
      if (kl.includes('gen') || kl.includes('obc') || kl.includes('ur')) updates.feeGen = val;
      if (kl.includes('sc') || kl.includes('st')) updates.feeSc = val;
      return { ...prev, ...updates };
    });
  };

  const removeFee = (key) => {
    setForm(prev => {
      const nextFees = { ...(prev.applicationFee || {}) };
      delete nextFees[key];
      return { ...prev, applicationFee: nextFees };
    });
  };

  const addFee = () => {
    setForm(prev => ({
      ...prev,
      applicationFee: {
        ...(prev.applicationFee || {}),
        [`Category ${Object.keys(prev.applicationFee || {}).length + 1}`]: ''
      }
    }));
  };

  const updateAge = (oldKey, newKey, val) => {
    setForm(prev => {
      const nextAge = { ...(prev.ageLimit || {}) };
      if (oldKey && oldKey !== newKey) delete nextAge[oldKey];
      if (newKey && newKey.trim()) nextAge[newKey.trim()] = val;
      const updates = { ageLimit: nextAge };
      const kl = (newKey || '').toLowerCase();
      if (kl.includes('min')) updates.minAge = val;
      if (kl.includes('max')) updates.maxAge = val;
      return { ...prev, ...updates };
    });
  };

  const removeAge = (key) => {
    setForm(prev => {
      const nextAge = { ...(prev.ageLimit || {}) };
      delete nextAge[key];
      return { ...prev, ageLimit: nextAge };
    });
  };

  const addAge = () => {
    setForm(prev => ({
      ...prev,
      ageLimit: {
        ...(prev.ageLimit || {}),
        [`Rule ${Object.keys(prev.ageLimit || {}).length + 1}`]: ''
      }
    }));
  };

  // Keep Visual Editor in sync when HTML source changes from left editor
  useEffect(() => {
    if (visualEditorRef.current && !isVisualFocusedRef.current) {
      if (visualEditorRef.current.innerHTML !== (form.content || '')) {
        visualEditorRef.current.innerHTML = form.content || '';
      }
    }
  }, [form.content]);

  const stats = useMemo(() => ({
    total: jobs.length,
    jobs: jobs.filter(j => (j.category || '').toUpperCase().includes('JOB')).length,
    admitCards: jobs.filter(j => (j.category || '').toUpperCase().includes('ADMIT')).length,
    results: jobs.filter(j => (j.category || '').toUpperCase().includes('RESULT')).length,
    admissions: jobs.filter(j => (j.category || '').toUpperCase().includes('ADMISSION')).length,
  }), [jobs]);

  const formatCategory = (cat) => {
    if (!cat) return 'Latest Jobs';
    const c = String(cat).toUpperCase();
    if (c.includes('JOB')) return 'Latest Jobs';
    if (c.includes('ADMIT')) return 'Admit Card';
    if (c.includes('RESULT')) return 'Results';
    if (c.includes('ANSWER')) return 'Answer Key';
    if (c.includes('SYLLABUS')) return 'Syllabus';
    if (c.includes('ADMISSION')) return 'Admission';
    if (c.includes('CERTIFICATE')) return 'Certificate';
    if (c.includes('IMPORTANT')) return 'Important';
    return cat;
  };

  const formatDate = (job) => {
    if (job.postDate) {
      const d = new Date(job.postDate);
      if (!isNaN(d.getTime())) {
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      }
      return job.postDate;
    }
    if (job.updatedAt) {
      const d = new Date(job.updatedAt);
      if (!isNaN(d.getTime())) {
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      }
    }
    if (job.lastDate) return job.lastDate;
    return '8/31/2026';
  };

  const publishedCount = useMemo(() => jobs.filter(j => j && j.status !== 'Draft' && j.status !== 'draft').length, [jobs]);
  const draftCount = useMemo(() => jobs.filter(j => j && (j.status === 'Draft' || j.status === 'draft')).length, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      if (!j || !j.title) return false;
      const isDraft = j.status === 'Draft' || j.status === 'draft';
      const matchStatus = statusFilter === 'all'
        ? true
        : statusFilter === 'draft'
          ? isDraft
          : !isDraft;
      const matchCat = filterCat === 'all' || (j.category || '').toUpperCase() === filterCat.toUpperCase();
      const matchSearch = !searchTerm || j.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchCat && matchSearch;
    });
  }, [jobs, statusFilter, filterCat, searchTerm]);

  const handleStartNewPost = () => {
    setEditingJobId(null);
    setForm({ ...EMPTY_FORM });
    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = '';
    }
    setActiveSection('new-post');
  };

  const handleEditJob = (job) => {
    if (!job) return;
    setEditingJobId(job.id);
    setForm({
      title: job.title || '',
      category: job.category || 'LATEST JOB',
      status: job.status || 'Published',
      organization: job.organization || '',
      vacancies: job.vacancies || job.totalPosts || '',
      totalPosts: job.totalPosts || job.vacancies || '',
      displayOrder: job.displayOrder ?? 0,
      featured: Boolean(job.featured),
      slug: job.id || '',
      lastDate: job.lastDate || job.appLast || '',
      appStart: job.appStart || '',
      examDate: job.examDate || '',
      badge: job.badge || 'New!',
      bannerColor: job.bannerColor || 'pink',
      description: job.description || job.uniqueDescription || job.shortInfo || '',
      content: job.content || job.htmlContent || '',
      seoTitle: job.seoTitle || job.title || '',
      seoKeywords: job.seoKeywords || '',
      seoDescription: job.seoDescription || job.description || '',
      applyUrl: job.applyUrl || job.importantLinks?.['Apply Online'] || '',
      notificationUrl: job.notificationUrl || job.importantLinks?.['Download Official Notification PDF'] || '',
      officialUrl: job.officialUrl || job.importantLinks?.['Official Website'] || '',
      feeGen: job.feeGen || job.applicationFee?.General || '',
      feeSc: job.feeSc || job.applicationFee?.['SC / ST'] || '',
      minAge: job.minAge || job.ageLimit?.['Minimum Age'] || '',
      maxAge: job.maxAge || job.ageLimit?.['Maximum Age'] || '',
      qualification: job.qualification || '',
      state: job.state || 'All India',
      importantLinks: job.importantLinks || {},
      importantDates: job.importantDates || {},
      applicationFee: job.applicationFee || {},
      ageLimit: job.ageLimit || {},
    });

    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = job.content || job.htmlContent || '';
    }
    setActiveSection('new-post');
    showToast(`✏️ Loaded "${job.title}" for editing.`, 'info');
  };

  const handleDuplicateJob = async (job) => {
    if (!job) return;
    const newId = `${job.id || 'post'}-copy-${Date.now()}`;
    const duplicatedJob = {
      ...job,
      id: newId,
      title: `${job.title} (Copy)`,
      status: 'Draft',
      displayOrder: (job.displayOrder ?? 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await onAddJob(duplicatedJob);
    showToast(`📋 Post duplicated as Draft: "${duplicatedJob.title}"`, 'success');
  };

  // Group duplicate jobs by normalized title / slug
  const duplicateGroups = useMemo(() => {
    const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const map = new Map();
    jobs.forEach(job => {
      const key = normalize(job.title || job.id);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(job);
    });
    const dupes = [];
    map.forEach(group => {
      if (group.length > 1) {
        dupes.push(group);
      }
    });
    return dupes;
  }, [jobs]);

  const handleCleanDuplicates = () => {
    let deletedCount = 0;
    duplicateGroups.forEach(group => {
      // Keep the cleanest ID (prefer ID without timestamp suffixes like -1234, or latest updated)
      const sorted = [...group].sort((a, b) => {
        const aHasSuffix = /-\d{4,}$/.test(a.id);
        const bHasSuffix = /-\d{4,}$/.test(b.id);
        if (aHasSuffix && !bHasSuffix) return 1;
        if (!aHasSuffix && bHasSuffix) return -1;
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
      // Keep sorted[0], delete all other duplicates
      sorted.slice(1).forEach(dupe => {
        onDeleteJob(dupe.id);
        deletedCount++;
      });
    });
    showToast(`🧹 Removed ${deletedCount} duplicate post(s)! Kept 1 clean copy for each.`, 'success');
  };

  const slugPreview = form.slug.trim() || (form.title
    ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : '');

  // ── WYSIWYG Command Execution ──
  const execCmd = (cmd, val = null) => {
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand(cmd, false, val);
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
    }
  };

  const handleVisualInput = (e) => {
    const html = e.currentTarget.innerHTML;
    setForm(prev => ({ ...prev, content: html }));
  };

  const applyBackgroundColor = (color, wholeRow = false) => {
    if (!visualEditorRef.current) return;

    // 1. If applying to whole row
    if (wholeRow && activeRowElementRef.current && visualEditorRef.current.contains(activeRowElementRef.current)) {
      Array.from(activeRowElementRef.current.cells).forEach(c => {
        c.style.backgroundColor = color;
      });
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
      showToast(`🎨 Row background changed to ${color}`, 'success');
      return;
    }

    // 2. If text selection exists in visual editor
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('hiliteColor', false, color);
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
      showToast(`🎨 Highlight color applied!`, 'success');
      return;
    }

    // 3. If an active table cell/header is selected
    if (activeCellElementRef.current && visualEditorRef.current.contains(activeCellElementRef.current)) {
      activeCellElementRef.current.style.backgroundColor = color;
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
      showToast(`🎨 Cell background changed to ${color}`, 'success');
      return;
    }

    // 4. If cursor is inside any block element
    if (sel && sel.anchorNode) {
      let node = sel.anchorNode;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      const block = node?.closest('th, td, p, div, h1, h2, h3, h4, h5, li');
      if (block && visualEditorRef.current.contains(block)) {
        block.style.backgroundColor = color;
        const updated = visualEditorRef.current.innerHTML;
        setForm(prev => ({ ...prev, content: updated }));
        showToast(`🎨 Background color changed!`, 'success');
        return;
      }
    }

    execCmd('hiliteColor', color);
  };

  const applyTextColor = (color) => {
    if (!visualEditorRef.current) return;

    // 1. If text is selected in visual editor
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, color);
      try {
        const range = sel.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const el = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
        if (el) {
          if (el.tagName === 'FONT') {
            el.setAttribute('color', color);
            el.style.color = color;
          }
          el.querySelectorAll?.('font').forEach(f => {
            f.setAttribute('color', color);
            f.style.color = color;
          });
        }
      } catch (err) {}
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
      showToast(`🎨 Text color changed to ${color}`, 'success');
      return;
    }

    // 2. If active table cell/header is selected
    if (activeCellElementRef.current && visualEditorRef.current.contains(activeCellElementRef.current)) {
      activeCellElementRef.current.style.color = color;
      // Also update any nested font tags or child text spans
      activeCellElementRef.current.querySelectorAll('font').forEach(f => {
        f.setAttribute('color', color);
        f.style.color = color;
      });
      activeCellElementRef.current.querySelectorAll('span, p, strong, b, em, a').forEach(el => {
        el.style.color = color;
      });
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
      showToast(`🎨 Cell text color changed to ${color}`, 'success');
      return;
    }

    // 3. If cursor is inside any block element
    if (sel && sel.anchorNode) {
      let node = sel.anchorNode;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      const block = node?.closest('th, td, p, div, h1, h2, h3, h4, h5, li');
      if (block && visualEditorRef.current.contains(block)) {
        block.style.color = color;
        block.querySelectorAll?.('font').forEach(f => {
          f.setAttribute('color', color);
          f.style.color = color;
        });
        const updated = visualEditorRef.current.innerHTML;
        setForm(prev => ({ ...prev, content: updated }));
        showToast(`🎨 Text color changed!`, 'success');
        return;
      }
    }

    execCmd('foreColor', color);
  };

  const applyHeaderTheme = (bgColor, textColor = '#ffffff') => {
    if (!visualEditorRef.current) return;

    if (activeRowElementRef.current && visualEditorRef.current.contains(activeRowElementRef.current)) {
      Array.from(activeRowElementRef.current.cells).forEach(cell => {
        cell.style.backgroundColor = bgColor;
        cell.style.color = textColor;
        cell.querySelectorAll('font').forEach(f => {
          f.setAttribute('color', textColor);
          f.style.color = textColor;
        });
        cell.querySelectorAll('span, p, strong, b, em, a').forEach(el => {
          el.style.color = textColor;
        });
      });
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
      showToast(`🎨 Applied theme: ${bgColor}`, 'success');
      return;
    }

    if (activeCellElementRef.current && visualEditorRef.current.contains(activeCellElementRef.current)) {
      activeCellElementRef.current.style.backgroundColor = bgColor;
      activeCellElementRef.current.style.color = textColor;
      activeCellElementRef.current.querySelectorAll('font').forEach(f => {
        f.setAttribute('color', textColor);
        f.style.color = textColor;
      });
      activeCellElementRef.current.querySelectorAll('span, p, strong, b, em, a').forEach(el => {
        el.style.color = textColor;
      });
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
      showToast(`🎨 Applied theme to cell`, 'success');
      return;
    }

    showToast('Click a table row or cell first to apply header style', 'info');
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th colspan="2" style="background-color: #ff0080; color: #fff; text-align: center; font-weight: bold; padding: 10px; font-size: 1.1rem;">
              Important Information Details
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 45%;">Organization Name</td>
            <td style="border: 1px solid #000; padding: 8px 12px;">${form.organization || 'Govt Portal'}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Application Start Date</td>
            <td style="border: 1px solid #000; padding: 8px 12px;">${form.appStart || 'Check Notice'}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Last Date for Apply</td>
            <td style="border: 1px solid #000; padding: 8px 12px; color: #ff0000; font-weight: bold;">${form.lastDate || 'Check Notice'}</td>
          </tr>
        </tbody>
      </table><p></p>
    `;
    execCmd('insertHTML', tableHtml);
    setTimeout(updateActiveTableInfo, 50);
  };

  const handleAddRow = (position = 'below') => {
    let table = activeTableElementRef.current;
    let tr = activeRowElementRef.current;
    if (!table) {
      table = visualEditorRef.current?.querySelector('table');
    }
    if (!table) {
      showToast('⚠️ Please click inside a table to add a row.', 'info');
      return;
    }
    if (!tr) {
      tr = position === 'above' ? table.rows[0] : table.rows[table.rows.length - 1];
    }
    if (!tr) return;

    const numCols = tr.cells.length || (table.rows[0]?.cells.length) || 2;
    const newTr = document.createElement('tr');
    for (let i = 0; i < numCols; i++) {
      const td = document.createElement('td');
      td.style.border = '1px solid #000';
      td.style.padding = '8px 12px';
      td.style.fontSize = '0.9rem';
      td.innerHTML = '&nbsp;';
      newTr.appendChild(td);
    }

    if (position === 'above') {
      tr.parentNode.insertBefore(newTr, tr);
    } else {
      tr.parentNode.insertBefore(newTr, tr.nextSibling);
    }

    activeRowElementRef.current = newTr;
    activeCellElementRef.current = newTr.cells[0];
    const updated = visualEditorRef.current.innerHTML;
    setForm(prev => ({ ...prev, content: updated }));
    updateActiveTableInfo();
    showToast(`✅ Row added ${position}!`, 'success');
  };

  const handleDeleteRow = () => {
    let table = activeTableElementRef.current;
    let tr = activeRowElementRef.current;
    if (!table) {
      table = visualEditorRef.current?.querySelector('table');
    }
    if (!table) {
      showToast('⚠️ Please click inside a table row to delete it.', 'info');
      return;
    }
    if (!tr) {
      tr = table.rows[table.rows.length - 1];
    }
    if (!tr) return;

    if (table.rows.length <= 1) {
      table.remove();
      activeTableElementRef.current = null;
      activeRowElementRef.current = null;
      activeCellElementRef.current = null;
      setActiveTableState(null);
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
      showToast('🗑️ Table deleted (last row was removed).', 'info');
      return;
    }

    const nextRow = tr.nextElementSibling || tr.previousElementSibling;
    tr.remove();
    activeRowElementRef.current = nextRow;
    const updated = visualEditorRef.current.innerHTML;
    setForm(prev => ({ ...prev, content: updated }));
    updateActiveTableInfo();
    showToast('🗑️ Row deleted successfully!', 'success');
  };

  const handleAddColumn = (position = 'right') => {
    let table = activeTableElementRef.current;
    let cell = activeCellElementRef.current;
    if (!table) {
      table = visualEditorRef.current?.querySelector('table');
    }
    if (!table) {
      showToast('⚠️ Please click inside a table cell to add columns.', 'info');
      return;
    }
    const cellIdx = cell ? cell.cellIndex : (position === 'left' ? 0 : (table.rows[0]?.cells.length || 1) - 1);
    const targetIdx = position === 'left' ? cellIdx : cellIdx + 1;

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const isHeaderRow = row.parentNode?.tagName === 'THEAD' || row.querySelector('th');
      const newCell = document.createElement(isHeaderRow && i === 0 ? 'th' : 'td');
      newCell.style.border = '1px solid #000';
      newCell.style.padding = '8px 12px';
      newCell.style.fontSize = '0.9rem';
      if (isHeaderRow && i === 0) {
        newCell.style.background = '#ff0080';
        newCell.style.color = '#fff';
        newCell.style.fontWeight = 'bold';
        newCell.innerHTML = 'Heading';
      } else {
        newCell.innerHTML = '&nbsp;';
      }
      if (targetIdx >= row.cells.length) {
        row.appendChild(newCell);
      } else {
        row.insertBefore(newCell, row.cells[targetIdx]);
      }
    }

    const updated = visualEditorRef.current.innerHTML;
    setForm(prev => ({ ...prev, content: updated }));
    updateActiveTableInfo();
    showToast(`✅ Column added ${position}!`, 'success');
  };

  const handleDeleteColumn = () => {
    let table = activeTableElementRef.current;
    let cell = activeCellElementRef.current;
    if (!table) {
      table = visualEditorRef.current?.querySelector('table');
    }
    if (!table) {
      showToast('⚠️ Please click inside a table column to delete it.', 'info');
      return;
    }
    const cellIdx = cell ? cell.cellIndex : ((table.rows[0]?.cells.length || 1) - 1);

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      if (row.cells.length > cellIdx) {
        row.deleteCell(cellIdx);
      }
    }

    if (table.rows[0] && table.rows[0].cells.length === 0) {
      table.remove();
      activeTableElementRef.current = null;
      activeRowElementRef.current = null;
      activeCellElementRef.current = null;
      setActiveTableState(null);
    }

    const updated = visualEditorRef.current.innerHTML;
    setForm(prev => ({ ...prev, content: updated }));
    updateActiveTableInfo();
    showToast('🗑️ Column deleted successfully!', 'success');
  };

  const handleDeleteTable = () => {
    let table = activeTableElementRef.current;
    if (!table) {
      table = visualEditorRef.current?.querySelector('table');
    }
    if (!table) {
      showToast('⚠️ No table found to delete.', 'info');
      return;
    }

    table.remove();
    activeTableElementRef.current = null;
    activeRowElementRef.current = null;
    activeCellElementRef.current = null;
    setActiveTableState(null);
    const updated = visualEditorRef.current.innerHTML;
    setForm(prev => ({ ...prev, content: updated }));
    showToast('🗑️ Table deleted completely!', 'success');
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node = sel.anchorNode;
        if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
        const td = node?.closest('td, th');
        const tr = node?.closest('tr');
        const table = node?.closest('table');
        if (td && tr && table) {
          const isLastCell = td === tr.cells[tr.cells.length - 1];
          const isLastRow = tr === table.rows[table.rows.length - 1];
          if (isLastCell && isLastRow && !e.shiftKey) {
            e.preventDefault();
            handleAddRow('below');
          }
        }
      }
    }
  };

  const handleOpenLinkModal = () => {
    saveSelection();
    setInsertModal({
      isOpen: true,
      type: 'link',
      title: 'Insert Web Link',
      label: 'Destination Web Address (URL):',
      placeholder: 'https://example.com',
      value: 'https://',
    });
  };

  const handleOpenImageModal = () => {
    saveSelection();
    setInsertModal({
      isOpen: true,
      type: 'image',
      title: 'Insert Image',
      label: 'Direct Image URL:',
      placeholder: 'https://example.com/photo.png',
      value: '',
    });
  };

  const handleOpenVideoModal = () => {
    saveSelection();
    setInsertModal({
      isOpen: true,
      type: 'video',
      title: 'Embed Video',
      label: 'YouTube or Video Embed Link:',
      placeholder: 'https://www.youtube.com/embed/...',
      value: '',
    });
  };

  const handleConfirmInsert = () => {
    const val = insertModal.value.trim();
    if (!val) {
      setInsertModal(prev => ({ ...prev, isOpen: false }));
      return;
    }

    if (insertModal.type === 'import') {
      setInsertModal(prev => ({ ...prev, isOpen: false }));
      setImportUrl(val);
      setTimeout(() => executeImport(val), 60);
      return;
    }

    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      restoreSelection();
      if (insertModal.type === 'link') {
        document.execCommand('createLink', false, val);
      } else if (insertModal.type === 'image') {
        document.execCommand('insertImage', false, val);
      } else if (insertModal.type === 'video') {
        const videoHtml = `<p><iframe src="${val}" width="100%" height="340" frameborder="0" allowfullscreen style="border-radius: 8px; margin: 12px 0;"></iframe></p>`;
        document.execCommand('insertHTML', false, videoHtml);
      }
      const updated = visualEditorRef.current.innerHTML;
      setForm(prev => ({ ...prev, content: updated }));
    }
    setInsertModal(prev => ({ ...prev, isOpen: false }));
    showToast('Inserted successfully into visual editor!', 'success');
  };

  // Helper to sanitize external branding and decode HTML entities
  const cleanStr = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8230;/g, '…')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—')
      // First, replace full URLs of competitor portals with careerdiary.in (preserving direct pdf/image files)
      .replace(/https?:\/\/(?:www\.)?(?:sarkariresult|resultbharat|rojgarresult|bigbooster)[^\s"'<>]*/gi, (url) => {
        const lower = url.toLowerCase();
        if (lower.endsWith('.pdf') || lower.endsWith('.jpg') || lower.endsWith('.png') || lower.endsWith('.jpeg')) {
          return url;
        }
        return 'https://careerdiary.in/';
      })
      .replace(/sarkariresult\.com\.cm/gi, 'careerdiary.in')
      .replace(/sarkariresult\.co\.cm/gi, 'careerdiary.in')
      .replace(/sarkariresult\.com/gi, 'careerdiary.in')
      .replace(/resultbharat\.com/gi, 'careerdiary.in')
      .replace(/rojgarresult\.com/gi, 'careerdiary.in')
      .replace(/sarkari\s*result/gi, 'Career Diary')
      .replace(/result\s*bharat/gi, 'Career Diary')
      .replace(/rojgar\s*result/gi, 'Career Diary')
      .replace(/bigbooster/gi, 'Career Diary')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Helper to parse WordPress REST API post with ACF (e.g. from sarkariresult.com.cm)
  const parseWordPressPost = (post) => {
    if (!post || typeof post !== 'object') return null;
    const acf = post.acf || {};

    const clean = (s) => cleanStr(s || '');

    // 1. Title
    const title = clean(acf.long_post_title || post.title?.rendered || '');

    // 2. Short description
    const rawShortHtml = acf['short_details:'] || acf.short_details || post.excerpt?.rendered || '';
    const shortText = clean(rawShortHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

    // 3. Organization
    let org = '';
    const orgTagMatch = rawShortHtml.match(/<a[^>]*>([^<]+)<\/a>/i) || rawShortHtml.match(/<strong>([^<]+)<\/strong>/i);
    if (orgTagMatch && orgTagMatch[1] && orgTagMatch[1].length < 80) {
      org = clean(orgTagMatch[1].replace(/,/g, '').trim());
    } else {
      const m = shortText.match(/^([A-Za-z\s]+(?:\([A-Z]+\))?)/);
      org = m ? m[1].replace(/,/g, '').trim() : '';
    }
    if (!org || org.length < 3) {
      org = title.split(' ')[0] + ' Recruitment Board';
    }

    // 4. Total Posts
    const totalPosts = clean(acf.total_post || '');

    // 5. Helper to parse <li> into key/value pairs
    const parseList = (html) => {
      const res = {};
      if (!html) return res;
      const regex = /<li>([\s\S]*?)<\/li>/gi;
      let m;
      while ((m = regex.exec(html)) !== null) {
        const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const parts = text.split(/\s*:\s*/);
        if (parts.length >= 2) {
          const k = clean(parts[0].trim());
          const v = clean(parts.slice(1).join(': ').trim());
          if (k && v) res[k] = v;
        }
      }
      return res;
    };

    const dates = parseList(acf.important_dates || '');
    const fees = parseList(acf.application_fee || '');
    const age = parseList(acf.age_limits_details || '');

    // 6. Parse links from table or html
    const links = {};
    const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    while ((trMatch = trRegex.exec(acf.important_links || '')) !== null) {
      const row = trMatch[1];
      const linkMatch = row.match(/href="([^"]+)"/i);
      const textMatch = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
      if (textMatch && textMatch.length >= 1) {
        const label = clean(textMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        let href = linkMatch ? linkMatch[1].trim() : '';
        if (label && href && href.startsWith('http')) {
          const hl = href.toLowerCase();
          const ll = label.toLowerCase();
          if (
            ll.includes('career diary') ||
            ll.includes('careerdiary') ||
            ll.includes('sarkari result') ||
            hl.includes('sarkariresult') ||
            hl.includes('resultbharat') ||
            hl.includes('rojgarresult') ||
            hl.includes('bigbooster')
          ) {
            if (!hl.endsWith('.pdf') && !hl.endsWith('.jpg') && !hl.endsWith('.png') && !hl.endsWith('.jpeg')) {
              href = 'https://careerdiary.in/';
            }
          }
          links[label] = href;
        }
      }
    }

    // Quick URL detection
    let applyUrl = '';
    let notificationUrl = '';
    let officialUrl = '';

    Object.entries(links).forEach(([k, u]) => {
      const kl = k.toLowerCase();
      if (!applyUrl && (kl.includes('apply') || kl.includes('online'))) applyUrl = u;
      if (!notificationUrl && (kl.includes('notif') || kl.includes('pdf') || kl.includes('advt') || kl.includes('brochure'))) notificationUrl = u;
      if (!officialUrl && (kl.includes('official') || kl.includes('website') || kl.includes('portal'))) officialUrl = u;
    });

    // Dates detection
    let appStart = '';
    let lastDate = '';
    let examDate = '';
    Object.entries(dates).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!appStart && (kl.includes('start') || kl.includes('begin'))) appStart = v;
      if (!lastDate && (kl.includes('last') || kl.includes('end') || kl.includes('closing'))) lastDate = v;
      if (!examDate && kl.includes('exam')) examDate = v;
    });

    // Fees detection
    let feeGen = '';
    let feeSc = '';
    Object.entries(fees).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!feeGen && (kl.includes('gen') || kl.includes('obc') || kl.includes('ebc') || kl.includes('ews'))) feeGen = v;
      if (!feeSc && (kl.includes('sc') || kl.includes('st'))) feeSc = v;
    });

    // Age detection
    let minAge = '';
    let maxAge = '';
    Object.entries(age).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!minAge && kl.includes('min')) minAge = v;
      if (!maxAge && kl.includes('max')) maxAge = v;
    });

    // Generate standardized Career Diary Rich HTML Content for Visual Preview
    const contentHtml = `
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th colspan="2" style="background-color: #ff0080; color: #fff; text-align: center; font-weight: bold; padding: 10px; font-size: 1.15rem;">
              ${org} : ${title}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 45%;">Organization Name</td>
            <td style="border: 1px solid #000; padding: 8px 12px;"><strong>${org}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Total Vacancies</td>
            <td style="border: 1px solid #000; padding: 8px 12px; color: #008000; font-weight: bold;">${totalPosts || 'Check Official Notification'}</td>
          </tr>
          ${appStart ? `<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Application Start Date</td><td style="border: 1px solid #000; padding: 8px 12px;">${appStart}</td></tr>` : ''}
          ${lastDate ? `<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Last Date for Apply</td><td style="border: 1px solid #000; padding: 8px 12px; color: #ff0000; font-weight: bold;">${lastDate}</td></tr>` : ''}

        </tbody>
      </table>

      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th style="background-color: #008000; color: #fff; text-align: center; font-weight: bold; padding: 8px; width: 50%;">Important Dates</th>
            <th style="background-color: #008000; color: #fff; text-align: center; font-weight: bold; padding: 8px; width: 50%;">Application Fee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 10px; vertical-align: top;">
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                ${Object.entries(dates).map(([k, v]) => `<li><strong>${k} :</strong> ${v}</li>`).join('')}
              </ul>
            </td>
            <td style="border: 1px solid #000; padding: 10px; vertical-align: top;">
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                ${Object.entries(fees).map(([k, v]) => `<li><strong>${k} :</strong> ${v}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      ${Object.keys(age).length > 0 ? `
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th style="background-color: #0056b3; color: #fff; text-align: center; font-weight: bold; padding: 8px;">Age Limit Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;">
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                ${Object.entries(age).map(([k, v]) => `<li><strong>${k} :</strong> ${v}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>` : ''}

      ${acf.vacancy_details ? `
      <div style="margin: 16px 0;">
        ${clean(acf.vacancy_details)}
      </div>` : ''}

      ${Object.keys(links).length > 0 ? `
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th colspan="2" style="background-color: #ff0080; color: #fff; text-align: center; font-weight: bold; padding: 8px;">Some Useful Important Links</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(links).map(([k, u]) => {
            const kl = k.toLowerCase();
            const ul = (u || '').toLowerCase();
            let finalUrl = u;
            if (kl.includes('career diary') || kl.includes('careerdiary') || kl.includes('sarkari result') || ul.includes('sarkariresult') || ul.includes('resultbharat') || ul.includes('rojgarresult') || ul.includes('bigbooster')) {
              if (!ul.endsWith('.pdf') && !ul.endsWith('.jpg') && !ul.endsWith('.png') && !ul.endsWith('.jpeg')) {
                finalUrl = 'https://careerdiary.in/';
              }
            }
            return `
            <tr>
              <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 60%;">${k}</td>
              <td style="border: 1px solid #000; padding: 8px 12px; text-align: center;">
                <a href="${finalUrl}" target="_blank" style="color: #0000ff; font-weight: bold;">Click Here</a>
              </td>
            </tr>
          `;}).join('')}
        </tbody>
      </table>` : ''}
    `.trim();

    return {
      title,
      organization: org,
      totalPosts,
      vacancies: totalPosts,
      description: shortText,
      content: contentHtml,
      slug: post.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      seoTitle: title,
      seoDescription: shortText.slice(0, 160),
      importantDates: dates,
      applicationFee: fees,
      ageLimit: age,
      importantLinks: links,
      applyUrl,
      notificationUrl,
      officialUrl,
      appStart,
      lastDate,
      examDate,
      feeGen,
      feeSc,
      minAge,
      maxAge,
    };
  };

  // Universal parser for any job notification HTML (Result Bharat, Sarkari Result, Rojgar Result, etc.)
  const parseUniversalJobHtml = (html, pageUrl = '') => {
    if (!html || typeof html !== 'string') return null;

    // 1. Title
    let title = '';
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) title = h1Match[1].replace(/<[^>]+>/g, '').trim();
    if (!title || title.length < 5) {
      const npMatch = html.match(/Name\s+Of\s+Post\s*:?\s*([^<\n\r]+)/i);
      if (npMatch) title = npMatch[1].trim();
    }
    if (!title) {
      const tMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (tMatch) title = tMatch[1].replace(/\|.*$/g, '').trim();
    }
    title = cleanStr(title.replace(/\s*#\w+/g, '').replace(/Name\s+of\s+Post\s*:?\s*/i, '').trim());

    // 2. Organization / Board
    let org = '';
    const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    for (const m of h2Matches) {
      const txt = m[1].replace(/<[^>]+>/g, '').trim();
      const tl = txt.toLowerCase();
      if (txt && !tl.includes('important') && !tl.includes('result') && !tl.includes('sarkari') && !tl.includes('apply') && !tl.includes('download') && !tl.includes('link') && txt.length > 3 && txt.length < 120) {
        org = txt;
        break;
      }
    }
    if (!org) {
      const orgMatch = html.match(/(?:Recruitment Board|Commission|Agency|Organisation|Organization|Department)\s*:?\s*([^\n<]+)/i);
      if (orgMatch) org = orgMatch[1].trim();
    }
    org = cleanStr(org) || 'Government Department';

    // 3. Short Information
    let shortInfo = '';
    const shortMatch = html.match(/Short\s+Information[\s\S]*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
    if (shortMatch) {
      shortInfo = shortMatch[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    } else {
      const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
      if (metaDesc) shortInfo = metaDesc[1].trim();
    }
    shortInfo = cleanStr(shortInfo);

    // 4. Vacancy / Total Posts
    const cleanBody = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const postMatch = cleanBody.match(/Total\s*:?\s*([0-9,]+|\-)\s*Post/i) || cleanBody.match(/(\d[\d,]*\s*(?:Posts?|पद|Vacanc(?:y|ies)))/i);
    const totalPosts = postMatch ? postMatch[1] || postMatch[0] : '';

    // 5. Category detection
    let category = 'LATEST_JOBS';
    const urlLower = (pageUrl || '').toLowerCase();
    const titleLower = title.toLowerCase();
    if (urlLower.includes('admit') || titleLower.includes('admit card')) category = 'ADMIT_CARD';
    else if (urlLower.includes('result') || titleLower.includes('result')) category = 'RESULT';
    else if (urlLower.includes('answer') || titleLower.includes('answer key')) category = 'ANSWER_KEY';
    else if (urlLower.includes('syllabus') || titleLower.includes('syllabus')) category = 'SYLLABUS';
    else if (urlLower.includes('admission') || titleLower.includes('admission')) category = 'ADMISSION';

    // 6. Dates, Fees, Age
    const dates = {};
    const fees = {};
    const age = {};

    // Check list items
    const liMatches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    for (const lim of liMatches) {
      const text = lim[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.includes(':')) {
        const parts = text.split(':');
        const k = cleanStr(parts[0].trim());
        const v = cleanStr(parts.slice(1).join(':').trim());
        const kl = k.toLowerCase();
        const vl = v.toLowerCase();

        if (kl.includes('age') || (kl.includes('minimum') && !kl.includes('fee')) || (kl.includes('maximum') && !kl.includes('fee')) || kl.includes('relaxation')) {
          if (v && v.length < 120 && !age[k]) age[k] = v;
        } else if (
          (kl.includes('date') || kl.includes('start') || kl.includes('begin') || kl.includes('last') || 
           kl.includes('exam') || kl.includes('admit') || kl.includes('answer') || kl.includes('result') || 
           kl.includes('correction') || kl.includes('city') || kl.includes('schedule') || kl.includes('status')) &&
          !kl.includes('fee mode') && !kl.includes('refund') && !vl.includes('/-')
        ) {
          if (v && v.length < 120 && !dates[k]) dates[k] = v;
        } else if (
          kl.includes('fee') || kl.includes('general') || kl.includes('obc') || kl.includes('sc') || 
          kl.includes('st') || kl.includes('ews') || kl.includes('ph') || kl.includes('pwd') || 
          kl.includes('female') || kl.includes('mode') || vl.includes('/-') || vl.includes('rs') || vl.includes('₹')
        ) {
          if (v && v.length < 150 && !fees[k]) fees[k] = v;
        }
      }
    }

    // Check 2-column table rows
    const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const trm of trMatches) {
      const rowHtml = trm[1];
      const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
      if (cells.length === 2 && !rowHtml.includes('<a ')) {
        const rawK = cleanStr(cells[0][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        const rawV = cleanStr(cells[1][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        const kl = rawK.toLowerCase();
        const vl = rawV.toLowerCase();
        if (rawK && rawV && rawK.length < 50 && rawV.length < 100) {
          if (kl.includes('date') || kl.includes('start') || kl.includes('last') || kl.includes('exam') || kl.includes('admit')) {
            if (!dates[rawK]) dates[rawK] = rawV;
          } else if (kl.includes('general') || kl.includes('obc') || kl.includes('sc') || kl.includes('fee') || vl.includes('/-') || vl.includes('rs')) {
            if (!fees[rawK]) fees[rawK] = rawV;
          } else if (kl.includes('age') || kl.includes('min') || kl.includes('max')) {
            if (!age[rawK]) age[rawK] = rawV;
          }
        }
      }
    }

    // 7. Important Links
    const links = {};
    for (const trm of trMatches) {
      const rowHtml = trm[1];
      const aMatch = rowHtml.match(/<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
      if (aMatch) {
        let href = aMatch[1];
        const aText = aMatch[2].replace(/<[^>]+>/g, '').trim();
        const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
        let label = cells.length >= 2 ? cells[0][1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : aText;
        label = cleanStr(label);
        const ll = label.toLowerCase();
        let hl = href.toLowerCase();
        if (
          !hl.includes('facebook') && !hl.includes('twitter') && !hl.includes('t.me') && !hl.includes('whatsapp') && !hl.includes('youtube') && !hl.includes('instagram') &&
          !ll.includes('join') && !ll.includes('telegram') && !ll.includes('whatsapp') && !ll.includes('app') &&
          (ll.includes('apply') || ll.includes('notif') || ll.includes('download') || ll.includes('official') || ll.includes('syllabus') || ll.includes('admit') || ll.includes('result') || ll.includes('answer') || ll.includes('correction') || ll.includes('login') || ll.includes('registration') || ll.includes('city') || ll.includes('career diary') || ll.includes('sarkari'))
        ) {
          if (
            ll.includes('career diary') ||
            ll.includes('careerdiary') ||
            ll.includes('sarkari result') ||
            hl.includes('sarkariresult') ||
            hl.includes('resultbharat') ||
            hl.includes('rojgarresult') ||
            hl.includes('bigbooster')
          ) {
            if (!hl.endsWith('.pdf') && !hl.endsWith('.jpg') && !hl.endsWith('.png') && !hl.endsWith('.jpeg')) {
              href = 'https://careerdiary.in/';
            }
          }
          if (label && href && !links[label]) links[label] = href;
        }
      }
    }

    // Auto-detect specific keys
    let applyUrl = '';
    let notificationUrl = '';
    let officialUrl = '';
    Object.entries(links).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!applyUrl && (kl.includes('apply online') || kl.includes('online form') || kl.includes('registration') || kl.includes('apply'))) applyUrl = v;
      if (!notificationUrl && (kl.includes('notif') || kl.includes('pdf') || kl.includes('advertisement') || kl.includes('advt') || kl.includes('bulletin'))) notificationUrl = v;
      if (!officialUrl && (kl.includes('website') || kl.includes('portal') || (kl.includes('official') && !kl.includes('notif') && !kl.includes('download')))) officialUrl = v;
    });

    let appStart = '';
    let lastDate = '';
    let examDate = '';
    Object.entries(dates).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!appStart && (kl.includes('start') || kl.includes('begin') || kl.includes('from'))) appStart = v;
      if (!lastDate && (kl.includes('last') || kl.includes('end') || kl.includes('closing') || kl.includes('submit'))) lastDate = v;
      if (!examDate && (kl.includes('exam date') || kl === 'exam' || (kl.includes('exam') && !kl.includes('city') && !kl.includes('fee')))) examDate = v;
    });

    let feeGen = '';
    let feeSc = '';
    Object.entries(fees).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!feeGen && (kl.includes('gen') || kl.includes('obc') || kl.includes('ur'))) feeGen = v;
      if (!feeSc && (kl.includes('sc') || kl.includes('st'))) feeSc = v;
    });

    let minAge = '';
    let maxAge = '';
    Object.entries(age).forEach(([k, v]) => {
      const kl = k.toLowerCase();
      if (!minAge && kl.includes('min')) minAge = v;
      if (!maxAge && kl.includes('max')) maxAge = v;
    });

    // Standardized Career Diary table content
    const contentHtml = `
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th colspan="2" style="background-color: #ff0080; color: #fff; text-align: center; font-weight: bold; padding: 10px; font-size: 1.15rem;">
              ${org} : ${title}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 45%;">Organization Name</td>
            <td style="border: 1px solid #000; padding: 8px 12px;"><strong>${org}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Total Vacancies</td>
            <td style="border: 1px solid #000; padding: 8px 12px; color: #008000; font-weight: bold;">${totalPosts || 'Check Official Notification'}</td>
          </tr>
          ${appStart ? `<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Application Start Date</td><td style="border: 1px solid #000; padding: 8px 12px;">${appStart}</td></tr>` : ''}
          ${lastDate ? `<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Last Date for Apply</td><td style="border: 1px solid #000; padding: 8px 12px; color: #ff0000; font-weight: bold;">${lastDate}</td></tr>` : ''}
          ${applyUrl ? `<tr><td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Apply Online Direct Link</td><td style="border: 1px solid #000; padding: 8px 12px;"><a href="${applyUrl}" target="_blank" style="color: #0000ff; font-weight: bold;">Click Here</a></td></tr>` : ''}
        </tbody>
      </table>

      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th style="background-color: #008000; color: #fff; text-align: center; font-weight: bold; padding: 8px; width: 50%;">Important Dates</th>
            <th style="background-color: #008000; color: #fff; text-align: center; font-weight: bold; padding: 8px; width: 50%;">Application Fee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 10px; vertical-align: top;">
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                ${Object.entries(dates).map(([k, v]) => `<li><strong>${k} :</strong> ${v}</li>`).join('')}
              </ul>
            </td>
            <td style="border: 1px solid #000; padding: 10px; vertical-align: top;">
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                ${Object.entries(fees).map(([k, v]) => `<li><strong>${k} :</strong> ${v}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      ${Object.keys(age).length > 0 ? `
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th style="background-color: #0056b3; color: #fff; text-align: center; font-weight: bold; padding: 8px;">Age Limit Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 10px;">
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                ${Object.entries(age).map(([k, v]) => `<li><strong>${k} :</strong> ${v}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>` : ''}

      ${Object.keys(links).length > 0 ? `
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000;">
        <thead>
          <tr>
            <th colspan="2" style="background-color: #ff0080; color: #fff; text-align: center; font-weight: bold; padding: 8px;">Some Useful Important Links</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(links).map(([k, u]) => {
            let finalUrl = u;
            const kl = k.toLowerCase();
            const ul = (u || '').toLowerCase();
            if (
              kl.includes('career diary') ||
              kl.includes('careerdiary') ||
              kl.includes('sarkari result') ||
              ul.includes('sarkariresult') ||
              ul.includes('resultbharat') ||
              ul.includes('rojgarresult') ||
              ul.includes('bigbooster')
            ) {
              if (!ul.endsWith('.pdf') && !ul.endsWith('.jpg') && !ul.endsWith('.png') && !ul.endsWith('.jpeg')) {
                finalUrl = 'https://careerdiary.in/';
              }
            }
            return `
            <tr>
              <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 60%;">${k}</td>
              <td style="border: 1px solid #000; padding: 8px 12px; text-align: center;">
                <a href="${finalUrl}" target="_blank" style="color: #0000ff; font-weight: bold;">Click Here</a>
              </td>
            </tr>
          `;}).join('')}
        </tbody>
      </table>` : ''}
    `.trim();

    return {
      title,
      organization: org,
      category,
      totalPosts,
      vacancies: totalPosts,
      description: shortInfo,
      content: contentHtml,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      seoTitle: title,
      seoDescription: shortInfo.slice(0, 160),
      importantDates: dates,
      applicationFee: fees,
      ageLimit: age,
      importantLinks: links,
      applyUrl,
      notificationUrl,
      officialUrl,
      appStart,
      lastDate,
      examDate,
      feeGen,
      feeSc,
      minAge,
      maxAge,
    };
  };

  const executeImport = (raw, sourceUrl = '') => {
    if (!raw) return false;

    // Check if raw is already an object or WordPress post
    let p = null;
    let text = typeof raw === 'string' ? raw.trim() : '';

    if (typeof raw === 'object') {
      p = Array.isArray(raw) ? raw[0] : (raw.data || raw);
    } else if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
      try {
        const parsed = JSON.parse(text);
        p = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch (e) {
        p = null;
      }
    } else if (text.includes(':') && !text.startsWith('<')) {
      if (
        text.includes('"importantLinks"') ||
        text.includes('"important_links"') ||
        text.includes('"title"') ||
        text.includes('"content"') ||
        text.includes('"acf"')
      ) {
        try {
          const parsed = JSON.parse(`{ ${text} }`);
          p = parsed;
        } catch (e) {
          // continue
        }
      }
    }

    // 1. If it's a WordPress ACF Post
    if (p && (p.acf || p.long_post_title || (p.data && p.data.acf))) {
      const wpData = p.acf ? p : (p.data?.acf ? p.data : null);
      if (wpData) {
        const wpParsed = parseWordPressPost(wpData);
        if (wpParsed) {
          setForm(prev => ({
            ...prev,
            title: wpParsed.title || prev.title,
            organization: wpParsed.organization || prev.organization,
            totalPosts: wpParsed.totalPosts || prev.totalPosts,
            vacancies: wpParsed.vacancies || prev.vacancies,
            description: wpParsed.description || prev.description,
            content: wpParsed.content || prev.content,
            slug: wpParsed.slug || prev.slug,
            seoTitle: wpParsed.seoTitle || prev.seoTitle,
            seoDescription: wpParsed.seoDescription || prev.seoDescription,
            importantDates: { ...(prev.importantDates || {}), ...wpParsed.importantDates },
            applicationFee: { ...(prev.applicationFee || {}), ...wpParsed.applicationFee },
            ageLimit: { ...(prev.ageLimit || {}), ...wpParsed.ageLimit },
            importantLinks: { ...(prev.importantLinks || {}), ...wpParsed.importantLinks },
            applyUrl: wpParsed.applyUrl || prev.applyUrl,
            notificationUrl: wpParsed.notificationUrl || prev.notificationUrl,
            officialUrl: wpParsed.officialUrl || prev.officialUrl,
            appStart: wpParsed.appStart || prev.appStart,
            lastDate: wpParsed.lastDate || prev.lastDate,
            examDate: wpParsed.examDate || prev.examDate,
            feeGen: wpParsed.feeGen || prev.feeGen,
            feeSc: wpParsed.feeSc || prev.feeSc,
            minAge: wpParsed.minAge || prev.minAge,
            maxAge: wpParsed.maxAge || prev.maxAge,
          }));

          setShowMetadata(true);
          if (visualEditorRef.current && wpParsed.content) {
            visualEditorRef.current.innerHTML = wpParsed.content;
          }
          setImportUrl('');
          const checkSlug = wpParsed.slug || (wpParsed.title ? wpParsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '');
          const checkTitle = (wpParsed.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const existing = jobs.find(j => 
            (checkSlug && j.id && j.id.toLowerCase() === checkSlug.toLowerCase()) ||
            (wpParsed.title && j.title && j.title.trim().toLowerCase() === wpParsed.title.trim().toLowerCase()) ||
            (checkTitle && j.title && (j.title || '').toLowerCase().replace(/[^a-z0-9]/g, '') === checkTitle)
          );
          if (existing) {
            setEditingJobId(existing.id);
            showToast(`ℹ️ Post exists in database ("${existing.title}"). Publishing will UPDATE it without creating duplicates.`, 'info');
          } else {
            setEditingJobId(null);
            showToast(`✅ Post data, organization, dates, and ${Object.keys(wpParsed.importantLinks).length} links imported successfully!`, 'success');
          }
          return true;
        }
      }
    }

    // 2. Standard JSON object / snippet import
    if (p && typeof p === 'object') {
      const rawTitle = typeof p.title === 'object' && p.title ? p.title.rendered : p.title;
      const rawContent = typeof p.content === 'object' && p.content ? p.content.rendered : (p.content || p.htmlContent || p.html);
      const rawShort = typeof p.excerpt === 'object' && p.excerpt ? p.excerpt.rendered : (p.short_info || p.uniqueDescription || p.description);
      const importedTitle = cleanStr(rawTitle || p.post_title || '');
      const importedContent = cleanStr(rawContent || '');
      const importedShort = cleanStr(rawShort || '');

      // Extract Important Links
      const rawLinks = p.importantLinks || p.important_links || p.links || (p['Apply Online'] || p['Official Website'] ? p : null);
      let extractedLinks = {};
      let extractedApply = p.applyUrl || p.apply_url || '';
      let extractedNotif = p.notificationUrl || p.notification_url || '';
      let extractedOfficial = p.officialUrl || p.official_url || '';

      if (rawLinks && typeof rawLinks === 'object') {
        if (Array.isArray(rawLinks)) {
          rawLinks.forEach(item => {
            if (item && typeof item === 'object') {
              const label = cleanStr(item.label || item.key || item.name || item.title || 'Important Link');
              const url = item.url || item.link || item.href || item.value || '';
              if (label && url) extractedLinks[label] = url;
            } else if (typeof item === 'string' && item.startsWith('http')) {
              extractedLinks['Important Link'] = item;
            }
          });
        } else {
          Object.entries(rawLinks).forEach(([k, v]) => {
            const label = cleanStr(k);
            const url = typeof v === 'string' ? v : (v?.url || v?.link || '');
            if (label && url) extractedLinks[label] = url;
          });
        }

        // Auto-detect applyUrl, notificationUrl, officialUrl
        Object.entries(extractedLinks).forEach(([k, v]) => {
          const kl = k.toLowerCase();
          if (!extractedApply && (kl.includes('apply') || kl.includes('registration') || kl.includes('online form'))) {
            extractedApply = v;
          }
          if (!extractedNotif && (kl.includes('notif') || kl.includes('pdf') || kl.includes('advertisement') || kl.includes('advt') || kl.includes('brochure'))) {
            extractedNotif = v;
          }
          if (!extractedOfficial && (kl.includes('official') || kl.includes('website') || kl.includes('portal') || kl.includes('home'))) {
            extractedOfficial = v;
          }
        });
      }

      // Extract Dates
      const rawDates = p.importantDates || p.important_dates || {};
      let extractedDates = {};
      if (typeof rawDates === 'object' && !Array.isArray(rawDates)) {
        Object.entries(rawDates).forEach(([k, v]) => { if (k && v) extractedDates[cleanStr(k)] = cleanStr(v); });
      } else if (Array.isArray(rawDates)) {
        rawDates.forEach(d => { if (d.key && d.value) extractedDates[cleanStr(d.key)] = cleanStr(d.value); });
      }

      let extractedAppStart = p.appStart || p.apply_start || rawDates.applyStart || rawDates.appStart || rawDates.start || '';
      let extractedLastDate = p.lastDate || p.appLast || p.last_date || rawDates.lastDate || rawDates.appLast || rawDates.last || '';
      let extractedExamDate = p.examDate || p.exam_date || rawDates.examDate || rawDates.exam || '';

      // Extract Fees
      const rawFees = p.applicationFee || p.application_fee || {};
      let extractedFees = {};
      if (typeof rawFees === 'object' && !Array.isArray(rawFees)) {
        Object.entries(rawFees).forEach(([k, v]) => { if (k && v) extractedFees[cleanStr(k)] = cleanStr(v); });
      } else if (Array.isArray(rawFees)) {
        rawFees.forEach(f => { if (f.key && f.value) extractedFees[cleanStr(f.key)] = cleanStr(f.value); });
      }
      let extractedFeeGen = p.feeGen || p.fee_gen || rawFees.General || rawFees.general || rawFees.Gen || '';
      let extractedFeeSc = p.feeSc || p.fee_sc || rawFees['SC / ST'] || rawFees.SC || rawFees.sc || '';

      // Extract Age Limits
      const rawAge = p.ageLimit || p.age_limit || {};
      let extractedAge = {};
      if (typeof rawAge === 'object' && !Array.isArray(rawAge)) {
        Object.entries(rawAge).forEach(([k, v]) => { if (k && v) extractedAge[cleanStr(k)] = cleanStr(v); });
      } else if (Array.isArray(rawAge)) {
        rawAge.forEach(a => { if (a.key && a.value) extractedAge[cleanStr(a.key)] = cleanStr(a.value); });
      }
      let extractedMinAge = p.minAge || p.min_age || rawAge.min || rawAge.minimum || '';
      let extractedMaxAge = p.maxAge || p.max_age || rawAge.max || rawAge.maximum || '';

      setForm(prev => ({
        ...prev,
        title: importedTitle || prev.title,
        category: p.category ? p.category.toUpperCase() : (p.category_id || prev.category),
        totalPosts: p.total_post || p.totalPosts || p.vacancies || prev.totalPosts,
        vacancies: p.total_post || p.totalPosts || p.vacancies || prev.vacancies,
        description: importedShort || prev.description,
        content: importedContent || prev.content,
        seoTitle: cleanStr(p.seo_title || importedTitle || prev.seoTitle),
        seoKeywords: p.seo_keywords || prev.seoKeywords,
        seoDescription: cleanStr(p.seo_description || importedShort || prev.seoDescription),
        organization: cleanStr(p.organization || prev.organization),
        slug: p.slug || (importedTitle ? importedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : prev.slug),
        applyUrl: extractedApply || prev.applyUrl,
        notificationUrl: extractedNotif || prev.notificationUrl,
        officialUrl: extractedOfficial || prev.officialUrl,
        appStart: extractedAppStart || prev.appStart,
        lastDate: extractedLastDate || prev.lastDate,
        examDate: extractedExamDate || prev.examDate,
        feeGen: extractedFeeGen || prev.feeGen,
        feeSc: extractedFeeSc || prev.feeSc,
        minAge: extractedMinAge || prev.minAge,
        maxAge: extractedMaxAge || prev.maxAge,
        importantLinks: {
          ...(prev.importantLinks || {}),
          ...extractedLinks
        },
        importantDates: {
          ...(prev.importantDates || {}),
          ...extractedDates
        },
        applicationFee: {
          ...(prev.applicationFee || {}),
          ...extractedFees
        },
        ageLimit: {
          ...(prev.ageLimit || {}),
          ...extractedAge
        }
      }));

      setShowMetadata(true);
      if (visualEditorRef.current && importedContent) {
        visualEditorRef.current.innerHTML = importedContent;
        
      }
      setImportUrl('');
      const linkCount = Object.keys(extractedLinks).length;
      const checkSlug2 = p.slug || (importedTitle ? importedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '');
      const checkTitle2 = (importedTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const existing2 = jobs.find(j => 
        (checkSlug2 && j.id && j.id.toLowerCase() === checkSlug2.toLowerCase()) ||
        (importedTitle && j.title && j.title.trim().toLowerCase() === importedTitle.trim().toLowerCase()) ||
        (checkTitle2 && j.title && (j.title || '').toLowerCase().replace(/[^a-z0-9]/g, '') === checkTitle2)
      );
      if (existing2) {
        setEditingJobId(existing2.id);
        showToast(`ℹ️ Post exists in database ("${existing2.title}"). Publishing will UPDATE it without creating duplicates.`, 'info');
      } else {
        setEditingJobId(null);
        showToast(`✅ Post data and ${linkCount > 0 ? `${linkCount} important links` : 'tables'} imported successfully!`, 'success');
      }
      return true;
    }

    // 3. Universal HTML code import (Result Bharat, Sarkari Result, Rojgar Result, Bigbooster, etc.)
    if (text.includes('<') && text.includes('>')) {
      try {
        const parsed = parseUniversalJobHtml(text, sourceUrl || importUrl);
        if (parsed && (parsed.title || parsed.content)) {
          setForm(prev => ({
            ...prev,
            title: parsed.title || prev.title,
            organization: parsed.organization || prev.organization,
            category: parsed.category || prev.category,
            totalPosts: parsed.totalPosts || prev.totalPosts,
            vacancies: parsed.vacancies || prev.vacancies,
            description: parsed.description || prev.description,
            content: parsed.content || prev.content,
            slug: parsed.slug || prev.slug,
            seoTitle: parsed.seoTitle || prev.seoTitle,
            seoDescription: parsed.seoDescription || prev.seoDescription,
            importantDates: { ...(prev.importantDates || {}), ...parsed.importantDates },
            applicationFee: { ...(prev.applicationFee || {}), ...parsed.applicationFee },
            ageLimit: { ...(prev.ageLimit || {}), ...parsed.ageLimit },
            importantLinks: { ...(prev.importantLinks || {}), ...parsed.importantLinks },
            applyUrl: parsed.applyUrl || prev.applyUrl,
            notificationUrl: parsed.notificationUrl || prev.notificationUrl,
            officialUrl: parsed.officialUrl || prev.officialUrl,
            appStart: parsed.appStart || prev.appStart,
            lastDate: parsed.lastDate || prev.lastDate,
            examDate: parsed.examDate || prev.examDate,
            feeGen: parsed.feeGen || prev.feeGen,
            feeSc: parsed.feeSc || prev.feeSc,
            minAge: parsed.minAge || prev.minAge,
            maxAge: parsed.maxAge || prev.maxAge,
          }));

          setShowMetadata(true);

          if (visualEditorRef.current && parsed.content) {
            visualEditorRef.current.innerHTML = parsed.content;
          }
          setImportUrl('');
          const linksCount = Object.keys(parsed.importantLinks).length;
          const datesCount = Object.keys(parsed.importantDates).length;
          const checkSlug3 = parsed.slug || (parsed.title ? parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '');
          const checkTitle3 = (parsed.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const existing3 = jobs.find(j => 
            (checkSlug3 && j.id && j.id.toLowerCase() === checkSlug3.toLowerCase()) ||
            (parsed.title && j.title && j.title.trim().toLowerCase() === parsed.title.trim().toLowerCase()) ||
            (checkTitle3 && j.title && (j.title || '').toLowerCase().replace(/[^a-z0-9]/g, '') === checkTitle3)
          );
          if (existing3) {
            setEditingJobId(existing3.id);
            showToast(`ℹ️ Post exists in database ("${existing3.title}"). Publishing will UPDATE it without creating duplicates.`, 'info');
          } else {
            setEditingJobId(null);
            showToast(`✅ Imported: ${parsed.organization || 'Organization'}, ${datesCount} Dates & ${linksCount} Links!`, 'success');
          }
          return true;
        }
      } catch (err) {
        console.warn('Universal HTML parse error:', err);
      }
    }

    return false;
  };

  const handleImportData = async () => {
    if (!importUrl.trim()) {
      showToast('Please paste a URL, JSON snippet, or HTML to import.', 'info');
      return;
    }
    const raw = importUrl.trim();

    if (executeImport(raw)) return;

    // 4. If user pasted a URL
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      showToast('⏳ Fetching post data from URL...', 'info');

      // Step 1: If user directly entered a WordPress REST API endpoint
      if (raw.includes('/wp-json/wp/v2/posts')) {
        try {
          const corsProxy = `https://proxy.cors.sh/${raw}`;
          const ctrl = new AbortController();
          const to = setTimeout(() => ctrl.abort(), 6000);
          const res = await fetch(corsProxy, { signal: ctrl.signal });
          clearTimeout(to);
          if (res.ok) {
            const data = await res.json();
            const post = Array.isArray(data) ? data[0] : data;
            if (executeImport(post, raw)) return;
          }
        } catch (e) {
          console.warn('Direct WP endpoint fetch failed:', e);
        }
      }

      // Step 2: If URL has a slug segment, try fetching WordPress REST API endpoint via proxy.cors.sh
      try {
        const targetObj = new URL(raw);
        const segments = targetObj.pathname.split('/').filter(Boolean);
        const lastSeg = segments[segments.length - 1];
        if (lastSeg && !lastSeg.includes('.') && !lastSeg.startsWith('wp-')) {
          const wpUrl = `https://proxy.cors.sh/${targetObj.origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(lastSeg)}`;
          const ctrl = new AbortController();
          const to = setTimeout(() => ctrl.abort(), 5000);
          const res = await fetch(wpUrl, { signal: ctrl.signal });
          clearTimeout(to);
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                if (executeImport(data[0], raw)) return;
              } else if (data && !Array.isArray(data) && (data.acf || data.title)) {
                if (executeImport(data, raw)) return;
              }
            }
          }
        }
      } catch (e) {
        console.warn('WP REST API check failed:', e);
      }

      // Step 3: Universal fetch of the target URL via proxy.cors.sh (Works for Result Bharat, Sarkari Result, etc.)
      try {
        const corsProxy = `https://proxy.cors.sh/${raw}`;
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 7000);
        const res = await fetch(corsProxy, { signal: ctrl.signal });
        clearTimeout(to);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (executeImport(data, raw)) return;
          } else {
            const htmlText = await res.text();
            if (executeImport(htmlText, raw)) return;
          }
        }
      } catch (e) {
        console.warn('proxy.cors.sh universal fetch failed:', e);
      }

      // Step 4: Fetch via /api/proxy (local dev Vite proxy or serverless function)
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(raw)}&_t=${Date.now()}`;
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(proxyUrl, { signal: ctrl.signal });
        clearTimeout(timeoutId);

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const result = await res.json();
          if (result && result.success) {
            if (result.type === 'wordpress_acf' || result.type === 'json') {
              if (executeImport(result.data, raw)) return;
            } else if (result.type === 'html') {
              if (executeImport(result.html, raw)) return;
            }
          }
        }
      } catch (e) {
        console.warn('Local/Live /api/proxy fetch error:', e);
      }

      // Step 5: Direct fetch if allowed by remote server CORS
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 3000);
        const res = await fetch(raw, { signal: ctrl.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (executeImport(data, raw)) return;
          } else {
            const htmlText = await res.text();
            if (executeImport(htmlText, raw)) return;
          }
        }
      } catch (e) {
        console.warn('Direct fetch blocked by CORS:', e);
      }

      // Step 6: Fallback to in-app dialog if all automatic fetches failed
      showToast('⚠️ Direct URL fetch was blocked. Paste HTML or JSON below to import instantly:', 'info');
      setInsertModal({
        isOpen: true,
        type: 'import',
        title: 'Paste & Import Post Content',
        label: 'External URL fetch was restricted by CORS. Paste the post HTML or JSON snippet below to auto-fill all fields:',
        placeholder: 'Paste post HTML table code or JSON snippet here...',
        value: '',
      });
      return;
    }

    showToast('💡 Tip: Paste a URL, JSON snippet, or HTML table code to auto-import fields', 'info');
  };

  const handlePublish = async () => {
    if (!form.title.trim()) {
      showToast('Post Title is required!', 'error');
      return;
    }

    const baseSlug = form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const normalizeStr = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanFormTitle = normalizeStr(form.title);

    // Look for existing job to update instead of creating duplicate:
    // 1) Explicitly editing an existing post (editingJobId)
    // 2) Slug / ID matches an existing job (case-insensitive)
    // 3) Exact title matches an existing job (case-insensitive)
    // 4) Normalized clean title matches an existing job (ignoring punctuation/spaces)
    const existingJob = jobs.find(j => 
      (editingJobId && j.id === editingJobId) ||
      (baseSlug && j.id && j.id.toLowerCase() === baseSlug.toLowerCase()) ||
      (form.title && j.title && j.title.trim().toLowerCase() === form.title.trim().toLowerCase()) ||
      (cleanFormTitle && j.title && normalizeStr(j.title) === cleanFormTitle)
    );

    const isUpdate = Boolean(existingJob);
    const finalSlug = existingJob ? existingJob.id : baseSlug;

    const newJob = {
      ...(existingJob || {}),
      id: finalSlug,
      title: form.title.trim(),
      status: 'Published',
      category: form.category || (existingJob ? existingJob.category : 'LATEST JOB'),
      organization: form.organization.trim() || (existingJob ? existingJob.organization : 'Career Diary Alert'),
      vacancies: form.totalPosts.trim() || form.vacancies.trim() || (existingJob ? existingJob.vacancies : 'Various'),
      totalPosts: form.totalPosts.trim() || form.vacancies.trim() || (existingJob ? existingJob.totalPosts : 'Various'),
      displayOrder: Number(form.displayOrder) || (existingJob?.displayOrder ?? 0),
      featured: Boolean(form.featured),
      lastDate: form.lastDate.trim() || (existingJob?.lastDate ?? ''),
      appLast: form.lastDate.trim() || (existingJob?.appLast ?? ''),
      appStart: form.appStart.trim() || (existingJob?.appStart ?? ''),
      badge: form.badge || (existingJob?.badge ?? 'New!'),
      bannerColor: form.bannerColor || (existingJob?.bannerColor ?? 'pink'),
      description: form.description.trim() || (existingJob?.description ?? ''),
      uniqueDescription: form.description.trim() || (existingJob?.uniqueDescription ?? ''),
      shortInfo: form.description.trim() || (existingJob?.shortInfo ?? ''),
      content: form.content.trim() || (existingJob?.content ?? ''),
      htmlContent: form.content.trim() || (existingJob?.htmlContent ?? ''),
      seoTitle: form.seoTitle.trim() || form.title.trim(),
      seoKeywords: form.seoKeywords.trim() || (existingJob?.seoKeywords ?? ''),
      seoDescription: form.seoDescription.trim() || form.description.trim() || (existingJob?.seoDescription ?? ''),
      applyUrl: form.applyUrl.trim() || (existingJob?.applyUrl ?? ''),
      notificationUrl: form.notificationUrl.trim() || (existingJob?.notificationUrl ?? ''),
      officialUrl: form.officialUrl.trim() || (existingJob?.officialUrl ?? ''),
      state: form.state.trim() || (existingJob?.state ?? 'All India'),
      feeGen: form.feeGen.trim() || (existingJob?.feeGen ?? '₹100'),
      feeSc: form.feeSc.trim() || (existingJob?.feeSc ?? '₹0'),
      minAge: form.minAge.trim() || (existingJob?.minAge ?? '18 Years'),
      maxAge: form.maxAge.trim() || (existingJob?.maxAge ?? '37 Years'),
      qualification: form.qualification.trim() || (existingJob?.qualification ?? 'As per notification'),
      importantDates: {
        ...(existingJob?.importantDates || {}),
        ...(form.importantDates || {}),
        ...(form.appStart ? { applyStart: form.appStart.trim() } : {}),
        ...(form.lastDate ? { lastDate: form.lastDate.trim() } : {}),
        ...(form.examDate ? { examDate: form.examDate.trim() } : {}),
      },
      important_dates: {
        ...(existingJob?.important_dates || {}),
        ...(form.importantDates || {}),
        ...(form.appStart ? { applyStart: form.appStart.trim() } : {}),
        ...(form.lastDate ? { lastDate: form.lastDate.trim() } : {}),
        ...(form.examDate ? { examDate: form.examDate.trim() } : {}),
      },
      applicationFee: {
        ...(existingJob?.applicationFee || {}),
        ...(form.applicationFee || {}),
        ...(form.feeGen ? { General: form.feeGen.trim() } : {}),
        ...(form.feeSc ? { 'SC / ST': form.feeSc.trim() } : {}),
      },
      application_fee: {
        ...(existingJob?.application_fee || {}),
        ...(form.applicationFee || {}),
        ...(form.feeGen ? { General: form.feeGen.trim() } : {}),
        ...(form.feeSc ? { 'SC / ST': form.feeSc.trim() } : {}),
      },
      ageLimit: {
        ...(existingJob?.ageLimit || {}),
        ...(form.ageLimit || {}),
        ...(form.minAge ? { 'Minimum Age': form.minAge.trim() } : {}),
        ...(form.maxAge ? { 'Maximum Age': form.maxAge.trim() } : {}),
      },
      age_limits: {
        ...(existingJob?.age_limits || {}),
        ...(form.ageLimit || {}),
        ...(form.minAge ? { 'Minimum Age': form.minAge.trim() } : {}),
        ...(form.maxAge ? { 'Maximum Age': form.maxAge.trim() } : {}),
      },
      importantLinks: {
        ...(existingJob?.importantLinks || {}),
        ...(form.importantLinks || {}),
        ...(form.applyUrl ? { 'Apply Online': form.applyUrl.trim() } : {}),
        ...(form.notificationUrl ? { 'Download Official Notification PDF': form.notificationUrl.trim() } : {}),
        ...(form.officialUrl ? { 'Official Website': form.officialUrl.trim() } : {}),
        'Join Telegram Channel': 'https://t.me/careerdiary',
        'Join WhatsApp Channel': 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u'
      },
      important_links: {
        ...(existingJob?.important_links || {}),
        ...(form.importantLinks || {}),
        ...(form.applyUrl ? { 'Apply Online': form.applyUrl.trim() } : {}),
        ...(form.notificationUrl ? { 'Download Official Notification PDF': form.notificationUrl.trim() } : {}),
        ...(form.officialUrl ? { 'Official Website': form.officialUrl.trim() } : {}),
        'Join Telegram Channel': 'https://t.me/careerdiary',
        'Join WhatsApp Channel': 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u'
      },
      postDate: existingJob?.postDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      updatedAt: new Date().toISOString(),
    };

    const res = await onAddJob(newJob);
    if (res && res.success === false) {
      showToast(`⚠️ Note: Post is saved locally, but Firestore sync error: ${res.error?.message || res.error}`, 'info');
    } else if (isUpdate) {
      showToast(`🔄 Post "${newJob.title}" updated successfully!`, 'success');
    } else {
      showToast('🎉 Post published successfully! It is now LIVE on Career Diary.', 'success');
    }
    setEditingJobId(null);
    setForm({ ...EMPTY_FORM });
    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = '';
    }
    setActiveSection('dashboard');
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) {
      showToast('⚠️ Please enter a Post Title before saving as draft!', 'error');
      return;
    }

    const editorHtml = visualEditorRef.current ? visualEditorRef.current.innerHTML : form.content;
    const isUpdate = Boolean(editingJobId);

    const baseSlug = form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const normalizeStr = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanFormTitle = normalizeStr(form.title);

    const existingJob = jobs.find(j => 
      (editingJobId && j.id === editingJobId) ||
      (baseSlug && j.id && j.id.toLowerCase() === baseSlug.toLowerCase()) ||
      (form.title && j.title && j.title.trim().toLowerCase() === form.title.trim().toLowerCase()) ||
      (cleanFormTitle && j.title && normalizeStr(j.title) === cleanFormTitle)
    );

    const finalSlug = existingJob ? existingJob.id : (baseSlug || `draft-${Date.now()}`);

    const draftJob = {
      ...(existingJob || {}),
      id: finalSlug,
      title: form.title.trim(),
      status: 'Draft',
      category: form.category || (existingJob ? existingJob.category : 'LATEST JOB'),
      organization: form.organization.trim() || (existingJob ? existingJob.organization : 'Career Diary Alert'),
      vacancies: form.totalPosts.trim() || form.vacancies.trim() || (existingJob ? existingJob.vacancies : 'Various'),
      totalPosts: form.totalPosts.trim() || form.vacancies.trim() || (existingJob ? existingJob.totalPosts : 'Various'),
      displayOrder: Number(form.displayOrder) || (existingJob?.displayOrder ?? 0),
      featured: Boolean(form.featured),
      lastDate: form.lastDate.trim() || (existingJob?.lastDate ?? ''),
      appLast: form.lastDate.trim() || (existingJob?.appLast ?? ''),
      appStart: form.appStart.trim() || (existingJob?.appStart ?? ''),
      badge: form.badge || (existingJob?.badge ?? 'Draft'),
      bannerColor: form.bannerColor || (existingJob?.bannerColor ?? 'pink'),
      description: form.description.trim() || (existingJob?.description ?? ''),
      uniqueDescription: form.description.trim() || (existingJob?.uniqueDescription ?? ''),
      shortInfo: form.description.trim() || (existingJob?.shortInfo ?? ''),
      content: editorHtml || form.content.trim() || '',
      htmlContent: editorHtml || form.content.trim() || '',
      seoTitle: form.seoTitle.trim() || form.title.trim(),
      seoKeywords: form.seoKeywords.trim() || (existingJob?.seoKeywords ?? ''),
      seoDescription: form.seoDescription.trim() || form.description.trim() || (existingJob?.seoDescription ?? ''),
      applyUrl: form.applyUrl.trim() || (existingJob?.applyUrl ?? ''),
      notificationUrl: form.notificationUrl.trim() || (existingJob?.notificationUrl ?? ''),
      officialUrl: form.officialUrl.trim() || (existingJob?.officialUrl ?? ''),
      state: form.state.trim() || (existingJob?.state ?? 'All India'),
      feeGen: form.feeGen.trim() || (existingJob?.feeGen ?? '₹100'),
      feeSc: form.feeSc.trim() || (existingJob?.feeSc ?? '₹0'),
      minAge: form.minAge.trim() || (existingJob?.minAge ?? '18 Years'),
      maxAge: form.maxAge.trim() || (existingJob?.maxAge ?? '37 Years'),
      qualification: form.qualification.trim() || (existingJob?.qualification ?? 'As per notification'),
      importantDates: {
        ...(existingJob?.importantDates || {}),
        ...(form.importantDates || {}),
        ...(form.appStart ? { applyStart: form.appStart.trim() } : {}),
        ...(form.lastDate ? { lastDate: form.lastDate.trim() } : {}),
        ...(form.examDate ? { examDate: form.examDate.trim() } : {}),
      },
      important_dates: {
        ...(existingJob?.important_dates || {}),
        ...(form.importantDates || {}),
        ...(form.appStart ? { applyStart: form.appStart.trim() } : {}),
        ...(form.lastDate ? { lastDate: form.lastDate.trim() } : {}),
        ...(form.examDate ? { examDate: form.examDate.trim() } : {}),
      },
      applicationFee: {
        ...(existingJob?.applicationFee || {}),
        ...(form.applicationFee || {}),
        ...(form.feeGen ? { General: form.feeGen.trim() } : {}),
        ...(form.feeSc ? { 'SC / ST': form.feeSc.trim() } : {}),
      },
      application_fee: {
        ...(existingJob?.application_fee || {}),
        ...(form.applicationFee || {}),
        ...(form.feeGen ? { General: form.feeGen.trim() } : {}),
        ...(form.feeSc ? { 'SC / ST': form.feeSc.trim() } : {}),
      },
      ageLimit: {
        ...(existingJob?.ageLimit || {}),
        ...(form.ageLimit || {}),
        ...(form.minAge ? { 'Minimum Age': form.minAge.trim() } : {}),
        ...(form.maxAge ? { 'Maximum Age': form.maxAge.trim() } : {}),
      },
      age_limits: {
        ...(existingJob?.age_limits || {}),
        ...(form.ageLimit || {}),
        ...(form.minAge ? { 'Minimum Age': form.minAge.trim() } : {}),
        ...(form.maxAge ? { 'Maximum Age': form.maxAge.trim() } : {}),
      },
      importantLinks: {
        ...(existingJob?.importantLinks || {}),
        ...(form.importantLinks || {}),
        ...(form.applyUrl ? { 'Apply Online': form.applyUrl.trim() } : {}),
        ...(form.notificationUrl ? { 'Download Official Notification PDF': form.notificationUrl.trim() } : {}),
        ...(form.officialUrl ? { 'Official Website': form.officialUrl.trim() } : {}),
        'Join Telegram Channel': 'https://t.me/careerdiary',
        'Join WhatsApp Channel': 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u'
      },
      important_links: {
        ...(existingJob?.important_links || {}),
        ...(form.importantLinks || {}),
        ...(form.applyUrl ? { 'Apply Online': form.applyUrl.trim() } : {}),
        ...(form.notificationUrl ? { 'Download Official Notification PDF': form.notificationUrl.trim() } : {}),
        ...(form.officialUrl ? { 'Official Website': form.officialUrl.trim() } : {}),
        'Join Telegram Channel': 'https://t.me/careerdiary',
        'Join WhatsApp Channel': 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u'
      },
      postDate: existingJob?.postDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      updatedAt: new Date().toISOString(),
    };

    const res = await onAddJob(draftJob);
    if (res && res.success === false) {
      showToast(`⚠️ Note: Draft saved locally, but Firestore warning: ${res.error?.message || res.error}`, 'info');
    } else {
      showToast('💾 Post saved as Draft! It will remain hidden from visitors until published.', 'success');
    }
    setEditingJobId(null);
    setForm({ ...EMPTY_FORM });
    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = '';
    }
    setActiveSection('dashboard');
  };

  // ── Sidebar Nav Items ────────────────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'breaking-news', label: 'Breaking News', icon: Megaphone },
    { id: 'new-post', label: 'New Post', icon: PlusSquare },
  ];

  // ── Render Sections ──────────────────────────────────────
  const renderDashboard = () => (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Duplicate warning & one-click cleanup banner */}
      {duplicateGroups.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '0.88rem', fontWeight: 600 }}>
            <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
            <span>Found {duplicateGroups.length} duplicate post group(s) in your list. Click to clean duplicates.</span>
          </div>
          <button onClick={handleCleanDuplicates} style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            Clean Duplicates (Keep 1 Copy)
          </button>
        </div>
      )}

      {/* Main White Card matching screenshot */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        border: '1px solid #f1f5f9',
        padding: '28px 32px'
      }}>
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Post Dashboard
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
              Career Diary Content Management Panel
            </p>
          </div>
          <button
            onClick={handleStartNewPost}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 22px',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
          >
            <Plus size={18} strokeWidth={2.5} /> Create Post
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Status Tabs (All, Published, Drafts) */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            {[
              { id: 'all', label: `All Posts (${jobs.length})` },
              { id: 'published', label: `Published (${publishedCount})` },
              { id: 'draft', label: `Drafts (${draftCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  background: statusFilter === tab.id ? '#ffffff' : 'transparent',
                  color: statusFilter === tab.id ? '#0f172a' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  fontWeight: statusFilter === tab.id ? 700 : 600,
                  cursor: 'pointer',
                  boxShadow: statusFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Category filter */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', minWidth: '220px', maxWidth: '320px', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search posts by title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#1e293b'
                }}
              />
            </div>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.86rem',
                outline: 'none',
                background: '#f8fafc',
                color: '#1e293b',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Table matching the screenshot */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TITLE</th>
                <th style={{ padding: '12px 14px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>ORDER</th>
                <th style={{ padding: '12px 14px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>CATEGORY</th>
                <th style={{ padding: '12px 14px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>DATE</th>
                <th style={{ padding: '12px 14px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>No posts found</p>
                    <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>Try clearing your search or filter, or create a new post.</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => {
                  const isDraft = job.status === 'Draft' || job.status === 'draft';
                  return (
                    <tr
                      key={job.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* TITLE */}
                      <td style={{ padding: '14px 14px', maxWidth: '440px' }}>
                        <span
                          onClick={() => handleEditJob(job)}
                          style={{
                            color: '#2563eb',
                            fontWeight: 600,
                            fontSize: '0.92rem',
                            cursor: 'pointer',
                            lineHeight: 1.45,
                            display: 'inline',
                          }}
                          title="Click to edit post"
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {job.title}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td style={{ padding: '14px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 12px',
                          borderRadius: '9999px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          background: isDraft ? '#fef3c7' : '#dcfce7',
                          color: isDraft ? '#b45309' : '#15803d',
                        }}>
                          {isDraft ? 'Draft' : 'Published'}
                        </span>
                      </td>

                      {/* ORDER */}
                      <td style={{ padding: '14px 14px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>
                        {job.displayOrder ?? 0}
                      </td>

                      {/* CATEGORY */}
                      <td style={{ padding: '14px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 12px',
                          borderRadius: '9999px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          background: '#eff6ff',
                          color: '#2563eb',
                        }}>
                          {formatCategory(job.category)}
                        </span>
                      </td>

                      {/* DATE */}
                      <td style={{ padding: '14px 14px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                        {formatDate(job)}
                      </td>

                      {/* ACTIONS */}
                      <td style={{ padding: '14px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicateJob(job)}
                            title="Duplicate as Draft"
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: '#eff6ff', border: '1px solid #c7d2fe',
                              color: '#4f46e5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.15s'
                            }}
                          >
                            <Copy size={15} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEditJob(job)}
                            title="Edit Post"
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: '#fef3c7', border: '1px solid #fde68a',
                              color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.15s'
                            }}
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* View Live */}
                          <button
                            onClick={() => window.open('/' + job.id, '_blank')}
                            title="View Live Post"
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: '#e0f2fe', border: '1px solid #bae6fd',
                              color: '#0284c7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.15s'
                            }}
                          >
                            <ExternalLink size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
                                onDeleteJob(job.id);
                                showToast(`🗑️ Deleted "${job.title}"`, 'info');
                              }
                            }}
                            title="Delete Post"
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: '#fee2e2', border: '1px solid #fecaca',
                              color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.15s'
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── Categories Management Section (Matching Screenshots 1 & 3) ──
  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      subtitle: cat.subtitle || '',
      slug: cat.slug || '',
      order: cat.order ?? 0,
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || ''
    });
    setShowCategoryForm(true);
  };

  const handleSaveCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }
    const slugValue = categoryForm.slug.trim().startsWith('/')
      ? categoryForm.slug.trim()
      : '/' + (categoryForm.slug.trim() || categoryForm.name.toLowerCase().trim().replace(/\s+/g, '-'));

    let updated;
    if (editingCategory) {
      updated = localCategories.map(c => c.id === editingCategory.id ? {
        ...c,
        ...categoryForm,
        slug: slugValue,
        order: Number(categoryForm.order) || 0
      } : c);
      showToast(`Category "${categoryForm.name}" updated!`, 'success');
    } else {
      const newCat = {
        id: 'cat_' + Date.now(),
        ...categoryForm,
        slug: slugValue,
        order: Number(categoryForm.order) || (localCategories.length + 1)
      };
      updated = [...localCategories, newCat];
      showToast(`Category "${categoryForm.name}" created!`, 'success');
    }
    setLocalCategories(updated);
    if (onSaveCategories) onSaveCategories(updated);
    try {
      localStorage.setItem('career_diary_categories', JSON.stringify(updated));
    } catch (err) {}
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', subtitle: '', slug: '', order: 0, seoTitle: '', seoDescription: '' });
  };

  const handleDeleteCategory = (catId, catName) => {
    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      const updated = localCategories.filter(c => c.id !== catId);
      setLocalCategories(updated);
      if (onSaveCategories) onSaveCategories(updated);
      try {
        localStorage.setItem('career_diary_categories', JSON.stringify(updated));
      } catch (err) {}
      showToast(`Category "${catName}" deleted`, 'info');
    }
  };

  const renderCategories = () => {
    const sortedCategories = [...localCategories].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header matching Screenshot 1 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Manage Categories
            </h1>
          </div>
          <button
            onClick={() => {
              if (showCategoryForm && !editingCategory) {
                setShowCategoryForm(false);
              } else {
                setEditingCategory(null);
                setCategoryForm({
                  name: '',
                  subtitle: '',
                  slug: '',
                  order: localCategories.length + 1,
                  seoTitle: '',
                  seoDescription: ''
                });
                setShowCategoryForm(true);
              }
            }}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 22px',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} /> New Category
          </button>
        </div>

        {/* Add/Edit Category Form Card (Matching Screenshot 3) */}
        {showCategoryForm && (
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
            border: '1px solid #cbd5e1',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSaveCategorySubmit}>
              {/* Row 1: Name, Slug, Order */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '14px', marginBottom: '14px' }}>
                <input
                  type="text"
                  placeholder="Name"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    setCategoryForm(prev => ({
                      ...prev,
                      name: nameVal,
                      slug: prev.slug || ('/' + nameVal.toLowerCase().trim().replace(/\s+/g, '-'))
                    }));
                  }}
                  required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                />
                <input
                  type="text"
                  placeholder="Slug (e.g. /results)"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                />
                <input
                  type="number"
                  placeholder="0"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, order: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}
                />
              </div>

              {/* Row 2: Subtitle / Tagline */}
              <div style={{ marginBottom: '14px' }}>
                <input
                  type="text"
                  placeholder="Subtitle / Tagline (e.g. Latest Exam Results 2026 - Check Merit Lists)"
                  value={categoryForm.subtitle}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                />
              </div>

              {/* Row 3: SEO Title */}
              <div style={{ marginBottom: '14px' }}>
                <input
                  type="text"
                  placeholder="SEO Title"
                  value={categoryForm.seoTitle}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                />
              </div>

              {/* Row 4: SEO Description */}
              <div style={{ marginBottom: '18px' }}>
                <textarea
                  placeholder="SEO Description"
                  rows={3}
                  value={categoryForm.seoDescription}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, seoDescription: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '9px 22px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Save Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '9px 20px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Table Card (Matching Screenshot 1) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '38%' }}>
                  Name
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '42%' }}>
                  Slug
                </th>
                <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '10%', textAlign: 'center' }}>
                  Order
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '10%', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((cat, idx) => (
                <tr key={cat.id || idx} style={{ borderBottom: idx === sortedCategories.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                      {cat.name}
                    </div>
                    {cat.subtitle && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginTop: '3px', lineHeight: 1.4 }}>
                        {cat.subtitle}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                      {cat.slug}
                    </div>
                    {(cat.seoDescription || cat.seoTitle) && (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px', lineHeight: 1.4, maxWidth: '480px' }}>
                        {cat.seoDescription || cat.seoTitle}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 16px', textAlign: 'center', verticalAlign: 'top', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                    {cat.order ?? idx + 1}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', verticalAlign: 'top' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleEditCategory(cat)}
                        title="Edit Category"
                        style={{
                          width: '32px', height: '32px', borderRadius: '6px',
                          background: '#eff6ff', border: '1px solid #bfdbfe',
                          color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        title="Delete Category"
                        style={{
                          width: '32px', height: '32px', borderRadius: '6px',
                          background: '#fee2e2', border: '1px solid #fecaca',
                          color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── New Post Form (Matching bigbooster create-post visual editor) ──
  const renderNewPost = () => (
    <div>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              {editingJobId ? 'Edit / Update Post' : 'Create New Post'}
            </h2>
            {editingJobId && (
              <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                Updating Existing Post (No Duplicates)
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
            {editingJobId ? `Editing existing post (${editingJobId}) — changes will update in-place without creating duplicates` : 'Visual Editing Mode: Edit directly in the preview pane'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => { setEditingJobId(null); setForm({ ...EMPTY_FORM }); setActiveSection('dashboard'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSaveDraft} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <Save size={14} /> Save Draft
          </button>
          <button onClick={handlePublish} style={{ background: editingJobId ? '#2563eb' : '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', boxShadow: editingJobId ? '0 2px 6px rgba(37, 99, 235, 0.3)' : '0 2px 6px rgba(16, 185, 129, 0.3)' }}>
            <UploadCloud size={16} /> {editingJobId ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </div>

      {/* Quick Import Bar */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Quick Import:</span>
        <input
          type="text"
          placeholder="Paste sarkariresult.com.cm, bigbooster or post URL here..."
          value={importUrl}
          onChange={e => setImportUrl(e.target.value)}
          style={{ flex: 1, minWidth: '240px', padding: '8px 14px', border: '1px solid #93c5fd', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
        />
        <button
          onClick={handleImportData}
          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
          <Download size={14} /> Import Data
        </button>
      </div>

      {/* Two-Column Form + Live Visual Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: isFullscreenPreview ? '1fr' : 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>

        {/* LEFT COLUMN: HTML Source & Metadata */}
        {!isFullscreenPreview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Box 1: HTML Source & Core Fields */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#4f46e5', fontWeight: 700, fontSize: '1.05rem' }}>
                <FileCode size={20} />
                <span>⟨/⟩ HTML Source</span>
              </div>

              {/* Row 1: Category + Total Posts + Display Order */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>CATEGORY</label>
                  <select
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', background: '#fff' }}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>TOTAL POSTS</label>
                  <input
                    type="text"
                    placeholder="e.g. 985 Posts"
                    value={form.totalPosts}
                    onChange={e => { set('totalPosts', e.target.value); set('vacancies', e.target.value); }}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>DISPLAY ORDER</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={e => set('displayOrder', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* Organization / Board */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>ORGANIZATION / BOARD *</label>
                <input
                  type="text"
                  placeholder="e.g. Jharkhand Staff Selection Commission (JSSC)"
                  value={form.organization}
                  onChange={e => set('organization', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 600 }}
                />
              </div>

              {/* Title */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Post Title"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.92rem', fontWeight: 600 }}
                />
              </div>

              {/* Slug Auto-Generated */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>SLUG (AUTO-GENERATED)</label>
                <input
                  type="text"
                  value={slugPreview}
                  onChange={e => set('slug', e.target.value)}
                  placeholder="e.g. upsc-geo-scientist-recruitment-2027"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.88rem', background: '#f8fafc', color: '#475569' }}
                />
              </div>

              {/* Featured Checkbox */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => set('featured', e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  Featured in Top Cards
                </label>
              </div>

              {/* Short Information */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>SHORT INFORMATION</label>
                <textarea
                  rows={3}
                  placeholder="Brief overview of the recruitment notification..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical' }}
                />
              </div>

              {/* HTML Source Code Textarea */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>HTML SOURCE CODE</label>
                <textarea
                  rows={8}
                  placeholder="Paste HTML here..."
                  value={form.content}
                  onChange={e => {
                    const val = e.target.value;
                    set('content', val);
                    if (visualEditorRef.current && !isVisualFocusedRef.current) {
                      visualEditorRef.current.innerHTML = val;
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0d1117',
                    color: '#38bdf8',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.84rem',
                    lineHeight: '1.5',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Box 2: Manage Metadata (Important Dates, Application Fee, Age Limit, Links) */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setShowMetadata(!showMetadata)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: '#f8fafc',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: '#1e293b',
                  textTransform: 'uppercase'
                }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb' }}>
                  <Layers size={18} />
                  <span>MANAGE METADATA (DATES, FEES, AGE, LINKS)</span>
                </span>
                {showMetadata ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showMetadata && (
                <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Section A: Important Dates */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                        📅 IMPORTANT DATES ({Object.keys(form.importantDates || {}).length})
                      </label>
                      <button
                        type="button"
                        onClick={addDate}
                        style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Date
                      </button>
                    </div>
                    {Object.entries(form.importantDates || {}).length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                        No dates added yet. Click "+ Add Date" to create one.
                      </div>
                    ) : (
                      Object.entries(form.importantDates || {}).map(([dKey, dVal], dIdx) => (
                        <div key={dIdx} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={dKey}
                            onChange={e => updateDate(dKey, e.target.value, dVal)}
                            placeholder="Date Label (e.g. Application Start Date)"
                            style={{ width: '45%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}
                          />
                          <input
                            type="text"
                            value={dVal}
                            onChange={e => updateDate(dKey, dKey, e.target.value)}
                            placeholder="Date Value (e.g. 05 August 2026)"
                            style={{ flex: 1, padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeDate(dKey)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 9px', cursor: 'pointer', fontWeight: 'bold' }}
                            title="Remove Date"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Section B: Application Fee */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                        💳 APPLICATION FEE ({Object.keys(form.applicationFee || {}).length})
                      </label>
                      <button
                        type="button"
                        onClick={addFee}
                        style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Fee
                      </button>
                    </div>
                    {Object.entries(form.applicationFee || {}).length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                        No fee rules added yet. Click "+ Add Fee" to create one.
                      </div>
                    ) : (
                      Object.entries(form.applicationFee || {}).map(([fKey, fVal], fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={fKey}
                            onChange={e => updateFee(fKey, e.target.value, fVal)}
                            placeholder="Category (e.g. General / OBC)"
                            style={{ width: '45%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}
                          />
                          <input
                            type="text"
                            value={fVal}
                            onChange={e => updateFee(fKey, fKey, e.target.value)}
                            placeholder="Fee (e.g. ₹ 100/-)"
                            style={{ flex: 1, padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeFee(fKey)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 9px', cursor: 'pointer', fontWeight: 'bold' }}
                            title="Remove Fee"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Section C: Age Limit */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                        🎂 AGE LIMIT RULES ({Object.keys(form.ageLimit || {}).length})
                      </label>
                      <button
                        type="button"
                        onClick={addAge}
                        style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Age Rule
                      </button>
                    </div>
                    {Object.entries(form.ageLimit || {}).length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                        No age rules added yet. Click "+ Add Age Rule" to create one.
                      </div>
                    ) : (
                      Object.entries(form.ageLimit || {}).map(([aKey, aVal], aIdx) => (
                        <div key={aIdx} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={aKey}
                            onChange={e => updateAge(aKey, e.target.value, aVal)}
                            placeholder="Rule (e.g. Minimum Age)"
                            style={{ width: '45%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}
                          />
                          <input
                            type="text"
                            value={aVal}
                            onChange={e => updateAge(aKey, aKey, e.target.value)}
                            placeholder="Value (e.g. 18 Years)"
                            style={{ flex: 1, padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeAge(aKey)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 9px', cursor: 'pointer', fontWeight: 'bold' }}
                            title="Remove Age Rule"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Section D: Useful Important Links */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                        🔗 USEFUL IMPORTANT LINKS ({Object.keys(form.importantLinks || {}).length})
                      </label>
                      <button
                        type="button"
                        onClick={addCustomLink}
                        style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Custom Link
                      </button>
                    </div>

                    {Object.entries(form.importantLinks || {}).length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                        No custom links yet. Click "+ Add Custom Link" to create one.
                      </div>
                    ) : (
                      Object.entries(form.importantLinks || {}).map(([lbl, u], lIdx) => (
                        <div key={lIdx} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={lbl}
                            onChange={e => updateCustomLink(lbl, e.target.value, u)}
                            placeholder="Label (e.g. Apply Online)"
                            style={{ width: '42%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}
                          />
                          <input
                            type="url"
                            value={u}
                            onChange={e => updateCustomLink(lbl, lbl, e.target.value)}
                            placeholder="https://..."
                            style={{ flex: 1, padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomLink(lbl)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 9px', cursor: 'pointer', fontWeight: 'bold' }}
                            title="Remove Link"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Section E: Direct Quick Links */}
                  <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>
                      ⚡ DIRECT QUICK URLS
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>APPLY ONLINE LINK</label>
                      <input type="url" placeholder="https://..." value={form.applyUrl} onChange={e => set('applyUrl', e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>OFFICIAL NOTIFICATION PDF</label>
                      <input type="url" placeholder="https://..." value={form.notificationUrl} onChange={e => set('notificationUrl', e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>OFFICIAL PORTAL WEBSITE</label>
                      <input type="url" placeholder="https://..." value={form.officialUrl} onChange={e => set('officialUrl', e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.84rem' }} />
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Box 3: SEO Metadata */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#6366f1', fontWeight: 700, fontSize: '1rem' }}>
                <Globe size={18} />
                <span>SEO Metadata</span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>SEO TITLE</label>
                <input
                  type="text"
                  placeholder="SEO Title (leave empty to use Post Title)"
                  value={form.seoTitle}
                  onChange={e => set('seoTitle', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>SEO KEYWORDS</label>
                <input
                  type="text"
                  placeholder="Keywords (comma separated)"
                  value={form.seoKeywords}
                  onChange={e => set('seoKeywords', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>SEO DESCRIPTION</label>
                <textarea
                  rows={2}
                  placeholder="Meta Description (max 160 chars)"
                  value={form.seoDescription}
                  onChange={e => set('seoDescription', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem' }}
                />
              </div>
            </div>

          </div>
        )}

        {/* RIGHT COLUMN: Editable Visual Preview Pane */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>

          {/* Preview Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700, fontSize: '1rem' }}>
              <FileText size={18} />
              <span>Editable Visual Preview</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                Changes sync with source automatically
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
                title={isFullscreenPreview ? 'Exit Fullscreen' : 'Expand Fullscreen'}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {isFullscreenPreview ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* Visual Rich Text Toolbar */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {/* Undo / Redo */}
            <button type="button" onClick={() => execCmd('undo')} title="Undo" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><RotateCcw size={14} /></button>
            <button type="button" onClick={() => execCmd('redo')} title="Redo" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><RotateCw size={14} /></button>

            <span style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }} />

            {/* Paragraph / Headings */}
            <select
              onChange={e => execCmd('formatBlock', e.target.value)}
              defaultValue="p"
              style={{ padding: '4px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
            </select>

            <span style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }} />

            {/* Formatting */}
            <button type="button" onClick={() => execCmd('bold')} title="Bold" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Bold size={14} /></button>
            <button type="button" onClick={() => execCmd('italic')} title="Italic" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Italic size={14} /></button>
            <button type="button" onClick={() => execCmd('underline')} title="Underline" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Underline size={14} /></button>
            <button type="button" onClick={() => execCmd('strikeThrough')} title="Strikethrough" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Strikethrough size={14} /></button>
            <button type="button" onClick={() => execCmd('formatBlock', 'pre')} title="Code" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Code size={14} /></button>
            <button type="button" onClick={() => execCmd('subscript')} title="Subscript" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Subscript size={14} /></button>
            <button type="button" onClick={() => execCmd('superscript')} title="Superscript" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Superscript size={14} /></button>

            <span style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }} />

            {/* Alignment */}
            <button type="button" onClick={() => execCmd('justifyLeft')} title="Align Left" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><AlignLeft size={14} /></button>
            <button type="button" onClick={() => execCmd('justifyCenter')} title="Align Center" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><AlignCenter size={14} /></button>
            <button type="button" onClick={() => execCmd('justifyRight')} title="Align Right" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><AlignRight size={14} /></button>
            <button type="button" onClick={() => execCmd('justifyFull')} title="Justify" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><AlignJustify size={14} /></button>

            <span style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }} />

            {/* Text Color Controls with Quick Presets */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }} title="Text Color">
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Palette size={14} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Text:</span>
              </div>
              {[
                { color: '#000000', label: 'Black' },
                { color: '#ffffff', label: 'White', border: true },
                { color: '#ff0000', label: 'Red' },
                { color: '#008000', label: 'Green' },
                { color: '#0d47a1', label: 'Blue' },
              ].map(swatch => (
                <button
                  key={swatch.color}
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    setTextColor(swatch.color);
                    applyTextColor(swatch.color);
                  }}
                  title={`Text Color: ${swatch.label}`}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '3px',
                    background: swatch.color,
                    border: swatch.border ? '1px solid #94a3b8' : '1px solid rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                />
              ))}
              <input
                type="color"
                value={textColor}
                onMouseDown={saveSelection}
                onInput={(e) => {
                  setTextColor(e.target.value);
                  applyTextColor(e.target.value);
                }}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  applyTextColor(e.target.value);
                }}
                style={{
                  width: '20px',
                  height: '20px',
                  padding: 0,
                  border: '1px solid #94a3b8',
                  borderRadius: '3px',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                title="Custom Text Color"
              />
            </div>

            {/* Background / Highlight Color Controls with Quick Presets */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }} title="Background / Highlight Color">
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Highlighter size={14} style={{ color: '#d97706' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Bg:</span>
              </div>
              {[
                { color: '#ff0080', label: 'Pink / Magenta' },
                { color: '#008000', label: 'Green' },
                { color: '#0d47a1', label: 'Navy Blue' },
                { color: '#b91c1c', label: 'Red' },
                { color: '#fef08a', label: 'Yellow' },
                { color: '#ffffff', label: 'White / Clear', border: true },
              ].map(swatch => (
                <button
                  key={swatch.color}
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    setHighlightColor(swatch.color);
                    applyBackgroundColor(swatch.color);
                  }}
                  title={`Bg Color: ${swatch.label}`}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '3px',
                    background: swatch.color,
                    border: swatch.border ? '1px solid #94a3b8' : '1px solid rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                />
              ))}
              <input
                type="color"
                value={highlightColor}
                onMouseDown={saveSelection}
                onInput={(e) => {
                  setHighlightColor(e.target.value);
                  applyBackgroundColor(e.target.value);
                }}
                onChange={(e) => {
                  setHighlightColor(e.target.value);
                  applyBackgroundColor(e.target.value);
                }}
                style={{
                  width: '20px',
                  height: '20px',
                  padding: 0,
                  border: '1px solid #94a3b8',
                  borderRadius: '3px',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                title="Custom Background / Highlight Color"
              />
            </div>

            <span style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }} />

            {/* Lists */}
            <button type="button" onClick={() => execCmd('insertUnorderedList')} title="Bullet List" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><List size={14} /></button>
            <button type="button" onClick={() => execCmd('insertOrderedList')} title="Numbered List" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><ListOrdered size={14} /></button>

            <span style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }} />

            {/* Inserts: Link, Image, Video, Table */}
            <button type="button" onClick={handleOpenLinkModal} title="Insert Link" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Link2 size={14} /></button>
            <button type="button" onClick={() => execCmd('unlink')} title="Unlink" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Unlink size={14} /></button>
            <button type="button" onClick={handleOpenImageModal} title="Insert Image" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Image size={14} /></button>
            <button type="button" onClick={handleOpenVideoModal} title="Insert Video" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Video size={14} /></button>
            <button type="button" onClick={handleInsertTable} title="Insert Sarkari Table" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', color: '#b91c1c' }}><Table size={14} /></button>

            <span style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }} />

            {/* Quick Table Manipulation Group in Toolbar */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 4px' }} title="Table Controls (Click any table cell below to edit rows/cols)">
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '3px', padding: '0 3px' }}>
                <Table size={13} style={{ color: '#0284c7' }} /> Table:
              </span>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAddRow('above')} title="Add Row Above" style={{ padding: '3px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', fontWeight: 600, color: '#047857' }}>
                <ArrowUp size={11} /> +Row
              </button>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAddRow('below')} title="Add Row Below" style={{ padding: '3px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', fontWeight: 600, color: '#047857' }}>
                <ArrowDown size={11} /> +Row
              </button>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={handleDeleteRow} title="Delete Selected Row" style={{ padding: '3px 6px', background: '#fff', border: '1px solid #fecaca', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', fontWeight: 600, color: '#dc2626' }}>
                <Minus size={11} /> -Row
              </button>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleAddColumn('right')} title="Add Column to Right" style={{ padding: '3px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', fontWeight: 600, color: '#1d4ed8' }}>
                <ArrowRight size={11} /> +Col
              </button>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={handleDeleteColumn} title="Delete Selected Column" style={{ padding: '3px 6px', background: '#fff', border: '1px solid #fecaca', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', fontWeight: 600, color: '#dc2626' }}>
                <Minus size={11} /> -Col
              </button>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={handleDeleteTable} title="Delete entire table" style={{ padding: '3px 7px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 700, color: '#b91c1c' }}>
                <Trash2 size={11} /> Del Table
              </button>
            </div>
          </div>

          {/* Active Table Tools Ribbon above Canvas */}
          <div style={{
            background: activeTableState ? '#f0fdf4' : '#f8fafc',
            border: activeTableState ? '1px solid #86efac' : '1px solid #cbd5e1',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            padding: '8px 12px',
            fontSize: '0.8rem',
            transition: 'all 0.2s'
          }}>
            {/* Row 1: Table Structure (Row, Col, Table manipulation) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', fontWeight: 700 }}>
                <Table size={15} style={{ color: activeTableState ? '#059669' : '#64748b' }} />
                <span>Table Tools:</span>
                {activeTableState ? (
                  <span style={{ fontWeight: 600, color: '#047857', fontSize: '0.78rem' }}>
                    (Row {activeTableState.rowIndex + 1} of {activeTableState.totalRows} | Col {activeTableState.cellIndex + 1} of {activeTableState.totalCols})
                  </span>
                ) : (
                  <span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.75rem' }}>
                    Click inside any table below to edit rows, columns & colors
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>Row:</span>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleAddRow('above')}
                  title="Add Row Above"
                  style={{ padding: '4px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>
                  <ArrowUp size={12} /> + Above
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleAddRow('below')}
                  title="Add Row Below"
                  style={{ padding: '4px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>
                  <ArrowDown size={12} /> + Below
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={handleDeleteRow}
                  title="Delete Current Row"
                  style={{ padding: '4px 8px', background: '#fff', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600, color: '#dc2626' }}>
                  <Minus size={12} /> Delete Row
                </button>

                <span style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 4px' }} />

                <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>Col:</span>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleAddColumn('left')}
                  title="Add Column to Left"
                  style={{ padding: '4px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8' }}>
                  <ArrowLeft size={12} /> + Left
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleAddColumn('right')}
                  title="Add Column to Right"
                  style={{ padding: '4px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8' }}>
                  <ArrowRight size={12} /> + Right
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={handleDeleteColumn}
                  title="Delete Current Column"
                  style={{ padding: '4px 8px', background: '#fff', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600, color: '#dc2626' }}>
                  <Minus size={12} /> Delete Col
                </button>

                <span style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 4px' }} />

                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={handleDeleteTable}
                  title="Delete entire table"
                  style={{ padding: '4px 10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c' }}>
                  <Trash2 size={12} /> Delete Table
                </button>
              </div>
            </div>

            {/* Row 2: Table Colors & Header Styling Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              {/* Header Style Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Header Presets:</span>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyHeaderTheme('#ff0080', '#ffffff')}
                  title="Apply Sarkari Pink Header Theme"
                  style={{ padding: '3px 8px', background: '#ff0080', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                  Pink
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyHeaderTheme('#047857', '#ffffff')}
                  title="Apply Emerald Green Header Theme"
                  style={{ padding: '3px 8px', background: '#047857', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                  Green
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyHeaderTheme('#0d47a1', '#ffffff')}
                  title="Apply Navy Blue Header Theme"
                  style={{ padding: '3px 8px', background: '#0d47a1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                  Navy
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyHeaderTheme('#b91c1c', '#ffffff')}
                  title="Apply Red Header Theme"
                  style={{ padding: '3px 8px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                  Red
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyHeaderTheme('#1e293b', '#ffffff')}
                  title="Apply Dark Slate Header Theme"
                  style={{ padding: '3px 8px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                  Dark
                </button>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyHeaderTheme('#f1f5f9', '#0f172a')}
                  title="Apply Light Grey Header Theme"
                  style={{ padding: '3px 8px', background: '#e2e8f0', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                  Grey
                </button>
              </div>

              {/* Cell / Row Background & Text Color Pickers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Cell / Row Background Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <Highlighter size={13} style={{ color: '#d97706' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginRight: '2px' }}>Cell Bg:</span>
                  {[
                    { color: '#ff0080', label: 'Pink' },
                    { color: '#047857', label: 'Green' },
                    { color: '#0d47a1', label: 'Navy' },
                    { color: '#b91c1c', label: 'Red' },
                    { color: '#fef08a', label: 'Yellow' },
                    { color: '#ffffff', label: 'White', border: true },
                  ].map(swatch => (
                    <button
                      key={swatch.color}
                      type="button"
                      onMouseDown={e => {
                        e.preventDefault();
                        setHighlightColor(swatch.color);
                        applyBackgroundColor(swatch.color, false);
                      }}
                      title={`Cell Bg: ${swatch.label}`}
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        background: swatch.color,
                        border: swatch.border ? '1px solid #94a3b8' : '1px solid rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={highlightColor}
                    onMouseDown={saveSelection}
                    onInput={(e) => {
                      setHighlightColor(e.target.value);
                      applyBackgroundColor(e.target.value, false);
                    }}
                    onChange={(e) => {
                      setHighlightColor(e.target.value);
                      applyBackgroundColor(e.target.value, false);
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                      padding: 0,
                      border: '1px solid #94a3b8',
                      borderRadius: '3px',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                    title="Custom Cell Background Color"
                  />
                  <button
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => applyBackgroundColor(highlightColor, true)}
                    title="Apply current background color to the entire active row"
                    style={{
                      marginLeft: '4px',
                      padding: '2px 6px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}>
                    Row Bg
                  </button>
                </div>

                {/* Cell Text Color Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <Palette size={13} style={{ color: '#2563eb' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginRight: '2px' }}>Cell Text:</span>
                  {[
                    { color: '#ffffff', label: 'White', border: true },
                    { color: '#000000', label: 'Black' },
                    { color: '#dc2626', label: 'Red' },
                    { color: '#047857', label: 'Green' },
                    { color: '#0d47a1', label: 'Blue' },
                  ].map(swatch => (
                    <button
                      key={swatch.color}
                      type="button"
                      onMouseDown={e => {
                        e.preventDefault();
                        setTextColor(swatch.color);
                        applyTextColor(swatch.color);
                      }}
                      title={`Text Color: ${swatch.label}`}
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        background: swatch.color,
                        border: swatch.border ? '1px solid #94a3b8' : '1px solid rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={textColor}
                    onMouseDown={saveSelection}
                    onInput={(e) => {
                      setTextColor(e.target.value);
                      applyTextColor(e.target.value);
                    }}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      applyTextColor(e.target.value);
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                      padding: 0,
                      border: '1px solid #94a3b8',
                      borderRadius: '3px',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                    title="Custom Text Color"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Paper Canvas Preview Area */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '0 0 8px 8px',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: '24px',
            minHeight: '520px',
            overflowY: 'auto'
          }}>
            {/* Centered Red Underlined Post Title Preview */}
            <h2 style={{
              color: '#c0392b',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              textDecoration: 'underline',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              margin: '0 0 20px 0'
            }}>
              {form.title.trim() ? form.title.toUpperCase() : 'POST TITLE PREVIEW'}
            </h2>

            {/* Visual contentEditable Area */}
            <div
              ref={visualEditorRef}
              contentEditable={true}
              onFocus={() => {
                isVisualFocusedRef.current = true;
                updateActiveTableInfo();
              }}
              onBlur={() => {
                isVisualFocusedRef.current = false;
              }}
              onInput={handleVisualInput}
              onClick={updateActiveTableInfo}
              onKeyUp={updateActiveTableInfo}
              onMouseUp={updateActiveTableInfo}
              onKeyDown={handleEditorKeyDown}
              className="sr-rich-html-content"
              style={{
                minHeight: '440px',
                outline: 'none',
                lineHeight: 1.6,
                color: '#1e293b'
              }}
            />
          </div>

        </div>

      </div>
    </div>
  );

  // ── Breaking News Management Section (Matching Screenshots 2 & 4) ──
  // ── Breaking News Management Section (Matching Screenshots 2 & 4) ──
  const handleEditNews = (newsItem) => {
    setEditingNews(newsItem);
    setNewsForm({
      category: newsItem.category || 'Latest Job',
      message: newsItem.message || '',
      link: newsItem.link || '',
      expiry: newsItem.expiry || '',
      priority: newsItem.priority ?? 0,
      active: newsItem.active !== false
    });
    setShowNewsForm(true);
  };

  const handleAutoImportCategoryNews = () => {
    const published = (jobs || []).filter(j => j.status !== 'Draft' && j.status !== 'draft');
    
    // Top 2 from Result
    const resJobs = published.filter(j => (j.category || '').toUpperCase().includes('RESULT')).slice(0, 2);
    // Top 2 from Admit Card
    const admJobs = published.filter(j => (j.category || '').toUpperCase().includes('ADMIT')).slice(0, 2);
    // Top 2 from Latest Job
    const latestJobs = published.filter(j => {
      const c = (j.category || '').toUpperCase();
      return (c.includes('JOB') || c.includes('RECRUITMENT')) && !c.includes('ADMIT') && !c.includes('RESULT');
    }).slice(0, 2);
    // Top 2 from Admission
    const admissJobs = published.filter(j => (j.category || '').toUpperCase().includes('ADMISSION')).slice(0, 2);

    const imported = [
      ...resJobs.map((j, i) => ({
        id: `auto-res-${Date.now()}-${i}`,
        category: 'Result',
        message: j.title,
        link: `/${j.id}`,
        priority: 1,
        expiry: '12/31/2026, 11:59:00 PM',
        active: true
      })),
      ...admJobs.map((j, i) => ({
        id: `auto-adm-${Date.now()}-${i}`,
        category: 'Admit Card',
        message: j.title,
        link: `/${j.id}`,
        priority: 1,
        expiry: '12/31/2026, 11:59:00 PM',
        active: true
      })),
      ...latestJobs.map((j, i) => ({
        id: `auto-job-${Date.now()}-${i}`,
        category: 'Latest Job',
        message: j.title,
        link: `/${j.id}`,
        priority: 1,
        expiry: '12/31/2026, 11:59:00 PM',
        active: true
      })),
      ...admissJobs.map((j, i) => ({
        id: `auto-admiss-${Date.now()}-${i}`,
        category: 'Admission',
        message: j.title,
        link: `/${j.id}`,
        priority: 1,
        expiry: '12/31/2026, 11:59:00 PM',
        active: true
      }))
    ];

    setLocalBreakingNews(imported);
    if (onSaveBreakingNews) onSaveBreakingNews(imported);
    try {
      localStorage.setItem('career_diary_breaking_news', JSON.stringify(imported));
    } catch (err) {}
    showToast('⚡ 8 Top Posts (2 Result, 2 Admit Card, 2 Job, 2 Admission) synced to Breaking News!', 'success');
  };

  const handleSaveNewsSubmit = (e) => {
    e.preventDefault();
    if (!newsForm.message.trim()) {
      showToast('Please enter breaking news message', 'error');
      return;
    }
    let updated;
    if (editingNews) {
      updated = localBreakingNews.map(n => n.id === editingNews.id ? {
        ...n,
        ...newsForm,
        priority: Number(newsForm.priority) || 0
      } : n);
      showToast('Breaking news alert updated!', 'success');
    } else {
      const newAlert = {
        id: 'news_' + Date.now(),
        ...newsForm,
        priority: Number(newsForm.priority) || 0
      };
      updated = [newAlert, ...localBreakingNews];
      showToast('Breaking news alert created!', 'success');
    }
    setLocalBreakingNews(updated);
    if (onSaveBreakingNews) onSaveBreakingNews(updated);
    try {
      localStorage.setItem('career_diary_breaking_news', JSON.stringify(updated));
    } catch (err) {}
    setShowNewsForm(false);
    setEditingNews(null);
    setNewsForm({ category: 'Latest Job', message: '', link: '', expiry: '', priority: 0, active: true });
  };

  const handleToggleNewsStatus = (newsId) => {
    const updated = localBreakingNews.map(n => n.id === newsId ? { ...n, active: !n.active } : n);
    setLocalBreakingNews(updated);
    if (onSaveBreakingNews) onSaveBreakingNews(updated);
    try {
      localStorage.setItem('career_diary_breaking_news', JSON.stringify(updated));
    } catch (err) {}
    const changed = updated.find(n => n.id === newsId);
    showToast(`Alert is now ${changed?.active ? 'Active' : 'Inactive'}`, 'info');
  };

  const handleDeleteNews = (newsId) => {
    if (window.confirm('Are you sure you want to delete this breaking news alert?')) {
      const updated = localBreakingNews.filter(n => n.id !== newsId);
      setLocalBreakingNews(updated);
      if (onSaveBreakingNews) onSaveBreakingNews(updated);
      try {
        localStorage.setItem('career_diary_breaking_news', JSON.stringify(updated));
      } catch (err) {}
      showToast('Breaking news alert deleted', 'info');
    }
  };

  const renderBreakingNews = () => {
    const activeNewsList = localBreakingNews.filter(n => n.active !== false);

    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header matching Screenshot 2 & 4 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Megaphone size={26} style={{ color: '#dc2626' }} />
              <h1 style={{ fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Manage Breaking News
              </h1>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
              Urgent ticker alerts shown at the top of the client application
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleAutoImportCategoryNews}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '10px 18px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.15s ease'
              }}
              title="Auto-import top 2 posts each from Result, Admit Card, Job, and Admission"
            >
              <RotateCw size={15} /> Auto-Sync 2+2+2+2 Posts
            </button>
            <button
              onClick={() => {
                if (showNewsForm && !editingNews) {
                  setShowNewsForm(false);
                } else {
                  setEditingNews(null);
                  setNewsForm({
                    category: 'Latest Job',
                    message: '',
                    link: '',
                    expiry: '',
                    priority: 0,
                    active: true
                  });
                  setShowNewsForm(true);
                }
              }}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 22px',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} /> Add News Alert
            </button>
          </div>
        </div>

        {/* Live Preview Banner (Matching Screenshot 2 & 4) */}
        <div style={{
          background: '#000000',
          borderRadius: '8px',
          padding: '8px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
          <span style={{
            background: '#dc2626',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.72rem',
            padding: '3px 10px',
            borderRadius: '4px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            flexShrink: 0
          }}>
            BREAKING NEWS
          </span>
          <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeNewsList.length > 0 ? (
              activeNewsList.map((n, i) => (
                <span key={n.id || i} style={{ marginRight: '24px' }}>
                  {i === 0 ? '▶ ' : '   ✦   '}
                  {n.category && (
                    <span style={{
                      color: n.category === 'Result' ? '#4ade80' : n.category === 'Admit Card' ? '#60a5fa' : n.category === 'Admission' ? '#c084fc' : '#fbbf24',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      marginRight: '6px',
                      textTransform: 'uppercase'
                    }}>
                      [{n.category}]
                    </span>
                  )}
                  {n.message}
                </span>
              ))
            ) : (
              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No active breaking news alerts currently displayed.</span>
            )}
          </div>
        </div>

        {/* Add/Edit News Form Card (Matching Screenshot 4) */}
        {showNewsForm && (
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
            border: '1px solid #cbd5e1',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} style={{ color: '#dc2626' }} /> {editingNews ? 'Edit News Alert' : 'Add New Alert'}
            </h3>
            <form onSubmit={handleSaveNewsSubmit}>
              {/* Row 1: Category & Message */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    CATEGORY
                  </label>
                  <select
                    value={newsForm.category || 'Latest Job'}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', background: '#ffffff' }}
                  >
                    <option value="Result">Result</option>
                    <option value="Admit Card">Admit Card</option>
                    <option value="Latest Job">Latest Job</option>
                    <option value="Admission">Admission</option>
                    <option value="General">General / Alert</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    NEWS TEXT
                  </label>
                  <input
                    type="text"
                    placeholder="Enter the breaking news message..."
                    value={newsForm.message}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Row 2: Action Link & Expiry Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    ACTION LINK (OPTIONAL)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="https://... or /post-slug"
                      value={newsForm.link}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, link: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    EXPIRY DATE (OPTIONAL)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="dd/mm/yyyy, --:-- --"
                      value={newsForm.expiry}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, expiry: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Priority & Initially Active */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    PRIORITY:
                  </label>
                  <input
                    type="number"
                    value={newsForm.priority}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, priority: e.target.value }))}
                    style={{ width: '70px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.88rem', textAlign: 'center' }}
                  />
                </div>

                <div
                  onClick={() => setNewsForm(prev => ({ ...prev, active: !prev.active }))}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{
                    width: '36px',
                    height: '20px',
                    borderRadius: '10px',
                    background: newsForm.active ? '#10b981' : '#cbd5e1',
                    position: 'relative',
                    transition: 'background 0.2s ease'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      transform: newsForm.active ? 'translateX(16px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: newsForm.active ? '#047857' : '#64748b' }}>
                    {newsForm.active ? 'Initially Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '9px 22px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Save News
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewsForm(false);
                    setEditingNews(null);
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '9px 20px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Breaking News Table Card (Matching Screenshot 2 & 4) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '10%' }}>
                  STATUS
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '55%' }}>
                  NEWS MESSAGE
                </th>
                <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '10%', textAlign: 'center' }}>
                  PRIORITY
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '15%' }}>
                  EXPIRY
                </th>
                <th style={{ padding: '14px 20px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', width: '10%', textAlign: 'center' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {localBreakingNews.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    No breaking news alerts added yet. Click "+ Add News Alert" or "Auto-Sync 2+2+2+2 Posts" above.
                  </td>
                </tr>
              ) : (
                localBreakingNews.map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: idx === localBreakingNews.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    {/* Status Toggle Switch */}
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <div
                        onClick={() => handleToggleNewsStatus(item.id)}
                        title={`Click to ${item.active ? 'Deactivate' : 'Activate'}`}
                        style={{
                          width: '36px',
                          height: '20px',
                          borderRadius: '10px',
                          background: item.active ? '#10b981' : '#cbd5e1',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          position: 'absolute',
                          top: '2px',
                          left: '2px',
                          transform: item.active ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                    </td>

                    {/* News Message + Category Tag + Link */}
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        {item.category && (
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: item.category === 'Result' ? '#dcfce7' : item.category === 'Admit Card' ? '#eff6ff' : item.category === 'Admission' ? '#f5f3ff' : '#fef3c7',
                            color: item.category === 'Result' ? '#166534' : item.category === 'Admit Card' ? '#1d4ed8' : item.category === 'Admission' ? '#6b21a8' : '#b45309',
                            border: '1px solid currentColor',
                            textTransform: 'uppercase'
                          }}>
                            {item.category}
                          </span>
                        )}
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.4 }}>
                          {item.message}
                        </span>
                      </div>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#2563eb', marginTop: '2px', textDecoration: 'none' }}
                        >
                          <LinkIcon size={12} /> {item.link}
                        </a>
                      )}
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '16px 16px', textAlign: 'center', verticalAlign: 'middle', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      {item.priority ?? 0}
                    </td>

                    {/* Expiry */}
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle', fontSize: '0.82rem', color: '#64748b' }}>
                      {item.expiry || 'None'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleEditNews(item)}
                          title="Edit News Alert"
                          style={{
                            width: '32px', height: '32px', borderRadius: '6px',
                            background: '#eff6ff', border: '1px solid #bfdbfe',
                            color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          title="Delete News Alert"
                          style={{
                            width: '32px', height: '32px', borderRadius: '6px',
                            background: '#fee2e2', border: '1px solid #fecaca',
                            color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── Layout ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', background: '#f8fafc', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* Sidebar matching screenshot */}
      <div style={{
        width: sidebarOpen ? '230px' : '64px', flexShrink: 0,
        background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease', overflow: 'hidden'
      }}>
        {/* Logo / Brand matching screenshot */}
        <div style={{ padding: '24px 20px 20px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {sidebarOpen && (
            <span style={{ fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: '1.2rem', whiteSpace: 'nowrap', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Career Diary
            </span>
          )}
          {!sidebarOpen && <BookmarkCheck size={24} style={{ color: '#3b82f6', margin: '0 auto' }} />}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '10px 12px' }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => {
                  if (id === 'new-post') {
                    handleStartNewPost();
                  } else {
                    setActiveSection(id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '11px 14px',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '6px',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = '#94a3b8';
                }}
              >
                <Icon size={19} style={{ flexShrink: 0, color: isActive ? '#ffffff' : '#94a3b8' }} />
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Buttons */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', marginBottom: '4px', fontSize: '0.88rem' }}>
            <Eye size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>View Website</span>}
          </button>
          <button onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#f87171', fontSize: '0.88rem' }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px' }}>
        {activeSection === 'dashboard' && renderDashboard()}
        {(activeSection === 'categories' || activeSection === 'all-posts') && renderCategories()}
        {activeSection === 'new-post' && renderNewPost()}
        {activeSection === 'breaking-news' && renderBreakingNews()}
      </div>

      {/* Modern In-App Toast Notification (Zero browser alerts) */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 20px',
          borderRadius: '10px',
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#10b981',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.92rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          maxWidth: '480px'
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : toast.type === 'info' ? <Info size={20} /> : <CheckCircle2 size={20} />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '6px', padding: 0, opacity: 0.85 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Modern In-App Insert/Import Modal (Zero browser prompts) */}
      {insertModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 99998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setInsertModal(prev => ({ ...prev, isOpen: false }));
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: insertModal.type === 'import' ? '600px' : '480px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {insertModal.type === 'link' && <Link2 size={18} style={{ color: '#2563eb' }} />}
                {insertModal.type === 'image' && <Image size={18} style={{ color: '#10b981' }} />}
                {insertModal.type === 'video' && <Video size={18} style={{ color: '#ef4444' }} />}
                {insertModal.type === 'import' && <Download size={18} style={{ color: '#6366f1' }} />}
                {insertModal.title}
              </h3>
              <button
                onClick={() => setInsertModal(prev => ({ ...prev, isOpen: false }))}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                {insertModal.label}
              </label>

              {insertModal.type === 'import' ? (
                <textarea
                  autoFocus
                  rows={8}
                  value={insertModal.value}
                  onChange={e => setInsertModal(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={insertModal.placeholder}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <input
                  type="text"
                  autoFocus
                  value={insertModal.value}
                  onChange={e => setInsertModal(prev => ({ ...prev, value: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleConfirmInsert();
                    if (e.key === 'Escape') setInsertModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  placeholder={insertModal.placeholder}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setInsertModal(prev => ({ ...prev, isOpen: false }))}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInsert}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}>
                {insertModal.type === 'import' ? 'Import Data' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
