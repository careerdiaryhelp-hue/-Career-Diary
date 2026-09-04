import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Layers, Megaphone, PlusSquare, FilePlus, Trash2, Search,
  LogOut, Eye, BookmarkCheck, ChevronRight, X, Save, UploadCloud,
  Download, BarChart3, FileText, IdCard, CheckSquare, GraduationCap, Bookmark, Briefcase,
  RotateCcw, RotateCw, Bold, Italic, Underline, Strikethrough, Code, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link2, Unlink,
  Image, Video, Table, Maximize2, Minimize2, FileCode, Globe,
  ChevronDown, ChevronUp, Palette, Highlighter, CheckCircle2, AlertCircle, Info
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'Select Category' },
  { value: 'LATEST JOB', label: 'Latest Job', icon: Briefcase },
  { value: 'ADMIT CARD', label: 'Admit Card', icon: IdCard },
  { value: 'RESULT', label: 'Result', icon: CheckSquare },
  { value: 'ANSWER KEY', label: 'Answer Key', icon: CheckSquare },
  { value: 'SYLLABUS', label: 'Syllabus', icon: FileText },
  { value: 'ADMISSION', label: 'Admission', icon: GraduationCap },
  { value: 'CERTIFICATE VERIFICATION', label: 'Certificate Verification', icon: BookmarkCheck },
  { value: 'IMPORTANT', label: 'Important', icon: Bookmark },
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

export default function AdminDashboardPage({ jobs, onAddJob, onDeleteJob, onBack, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [importUrl, setImportUrl] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#fef08a');

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

  const filteredJobs = jobs.filter(j => {
    const matchCat = filterCat === 'all' || (j.category || '').toUpperCase() === filterCat.toUpperCase();
    const matchSearch = !searchTerm || j.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

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
            <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold;">Apply Online Direct Link</td>
            <td style="border: 1px solid #000; padding: 8px 12px;"><a href="${form.applyUrl || 'https://careerdiary.in/'}" target="_blank" style="color: #0000ff; font-weight: bold;">Click Here</a></td>
          </tr>
        </tbody>
      </table><p></p>
    `;
    execCmd('insertHTML', tableHtml);
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

  // Helper to sanitize external branding
  const cleanStr = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/sarkari\s*result(?:\.com(?:\.cm)?)?/gi, 'Career Diary')
      .replace(/result\s*bharat(?:\.com)?/gi, 'Career Diary')
      .replace(/rojgar\s*result(?:\.com)?/gi, 'Career Diary')
      .replace(/bigbooster(?:\.in)?/gi, 'Career Diary')
      .replace(/sarkariresult\.co\.cm/gi, 'careerdiary.in')
      .replace(/sarkariresult\.com/gi, 'careerdiary.in')
      .replace(/resultbharat\.com/gi, 'careerdiary.in')
      .replace(/rojgarresult\.com/gi, 'careerdiary.in')
      .replace(/https?:\/\/(?:www\.)?(?:sarkariresult|resultbharat|rojgarresult)\.com[^\s"'<>]*/gi, 'https://careerdiary.in')
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
        const href = linkMatch ? linkMatch[1] : '';
        if (label && href && href.startsWith('http')) {
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
          ${Object.entries(links).map(([k, u]) => `
            <tr>
              <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 60%;">${k}</td>
              <td style="border: 1px solid #000; padding: 8px 12px; text-align: center;">
                <a href="${u}" target="_blank" style="color: #0000ff; font-weight: bold;">Click Here</a>
              </td>
            </tr>
          `).join('')}
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
        const href = aMatch[1];
        const aText = aMatch[2].replace(/<[^>]+>/g, '').trim();
        const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
        let label = cells.length >= 2 ? cells[0][1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : aText;
        label = cleanStr(label);
        const ll = label.toLowerCase();
        const hl = href.toLowerCase();
        if (
          !hl.includes('facebook') && !hl.includes('twitter') && !hl.includes('t.me') && !hl.includes('whatsapp') && !hl.includes('youtube') && !hl.includes('instagram') &&
          !ll.includes('join') && !ll.includes('telegram') && !ll.includes('whatsapp') && !ll.includes('app') && !ll.includes('career diary') &&
          (ll.includes('apply') || ll.includes('notif') || ll.includes('download') || ll.includes('official') || ll.includes('syllabus') || ll.includes('admit') || ll.includes('result') || ll.includes('answer') || ll.includes('correction') || ll.includes('login') || ll.includes('registration') || ll.includes('city'))
        ) {
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
          ${Object.entries(links).map(([k, u]) => `
            <tr>
              <td style="border: 1px solid #000; padding: 8px 12px; font-weight: bold; width: 60%;">${k}</td>
              <td style="border: 1px solid #000; padding: 8px 12px; text-align: center;">
                <a href="${u}" target="_blank" style="color: #0000ff; font-weight: bold;">Click Here</a>
              </td>
            </tr>
          `).join('')}
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
          showToast(`✅ Post data, organization, dates, and ${Object.keys(wpParsed.importantLinks).length} links imported successfully!`, 'success');
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
      showToast(`✅ Post data and ${linkCount > 0 ? `${linkCount} important links` : 'tables'} imported successfully!`, 'success');
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
          showToast(`✅ Imported: ${parsed.organization || 'Organization'}, ${datesCount} Dates & ${linksCount} Links!`, 'success');
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
    let finalSlug = baseSlug;
    if (jobs.some(j => j.id === finalSlug)) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const newJob = {
      id: finalSlug,
      title: form.title.trim(),
      category: form.category || 'LATEST JOB',
      organization: form.organization.trim() || 'Career Diary Alert',
      vacancies: form.totalPosts.trim() || form.vacancies.trim() || 'Various',
      totalPosts: form.totalPosts.trim() || form.vacancies.trim() || 'Various',
      displayOrder: Number(form.displayOrder) || 0,
      featured: Boolean(form.featured),
      lastDate: form.lastDate.trim() || '',
      appLast: form.lastDate.trim() || '',
      appStart: form.appStart.trim() || '',
      badge: form.badge || 'New!',
      bannerColor: form.bannerColor || 'pink',
      description: form.description.trim(),
      uniqueDescription: form.description.trim(),
      shortInfo: form.description.trim(),
      content: form.content.trim(),
      htmlContent: form.content.trim(),
      seoTitle: form.seoTitle.trim() || form.title.trim(),
      seoKeywords: form.seoKeywords.trim(),
      seoDescription: form.seoDescription.trim() || form.description.trim(),
      applyUrl: form.applyUrl.trim() || '',
      notificationUrl: form.notificationUrl.trim() || '',
      officialUrl: form.officialUrl.trim() || '',
      state: form.state.trim() || 'All India',
      feeGen: form.feeGen.trim() || '₹100',
      feeSc: form.feeSc.trim() || '₹0',
      minAge: form.minAge.trim() || '18 Years',
      maxAge: form.maxAge.trim() || '37 Years',
      qualification: form.qualification.trim() || 'As per notification',
      importantDates: {
        ...(form.appStart ? { applyStart: form.appStart.trim() } : {}),
        ...(form.lastDate ? { lastDate: form.lastDate.trim() } : {}),
        ...(form.examDate ? { examDate: form.examDate.trim() } : {}),
        ...(form.importantDates || {})
      },
      important_dates: {
        ...(form.appStart ? { applyStart: form.appStart.trim() } : {}),
        ...(form.lastDate ? { lastDate: form.lastDate.trim() } : {}),
        ...(form.examDate ? { examDate: form.examDate.trim() } : {}),
        ...(form.importantDates || {})
      },
      applicationFee: {
        ...(form.feeGen ? { General: form.feeGen.trim() } : {}),
        ...(form.feeSc ? { 'SC / ST': form.feeSc.trim() } : {}),
        ...(form.applicationFee || {})
      },
      application_fee: {
        ...(form.feeGen ? { General: form.feeGen.trim() } : {}),
        ...(form.feeSc ? { 'SC / ST': form.feeSc.trim() } : {}),
        ...(form.applicationFee || {})
      },
      ageLimit: {
        ...(form.minAge ? { 'Minimum Age': form.minAge.trim() } : {}),
        ...(form.maxAge ? { 'Maximum Age': form.maxAge.trim() } : {}),
        ...(form.ageLimit || {})
      },
      age_limits: {
        ...(form.minAge ? { 'Minimum Age': form.minAge.trim() } : {}),
        ...(form.maxAge ? { 'Maximum Age': form.maxAge.trim() } : {}),
        ...(form.ageLimit || {})
      },
      importantLinks: {
        ...(form.importantLinks || {}),
        ...(form.applyUrl ? { 'Apply Online': form.applyUrl.trim() } : {}),
        ...(form.notificationUrl ? { 'Download Official Notification PDF': form.notificationUrl.trim() } : {}),
        ...(form.officialUrl ? { 'Official Website': form.officialUrl.trim() } : {}),
        'Join Telegram Channel': 'https://t.me/careerdiary',
        'Join WhatsApp Channel': 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u'
      },
      important_links: {
        ...(form.importantLinks || {}),
        ...(form.applyUrl ? { 'Apply Online': form.applyUrl.trim() } : {}),
        ...(form.notificationUrl ? { 'Download Official Notification PDF': form.notificationUrl.trim() } : {}),
        ...(form.officialUrl ? { 'Official Website': form.officialUrl.trim() } : {}),
        'Join Telegram Channel': 'https://t.me/careerdiary',
        'Join WhatsApp Channel': 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u'
      },
      postDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    };

    const res = await onAddJob(newJob);
    if (res && res.success === false) {
      showToast(`⚠️ Note: Post is saved locally, but Firestore sync error: ${res.error?.message || res.error}`, 'info');
    } else {
      showToast('🎉 Post published successfully! It is now LIVE on Career Diary for all users worldwide via Firebase Firestore.', 'success');
    }
    setForm({ ...EMPTY_FORM });
    setActiveSection('all-posts');
  };

  const handleSaveDraft = () => {
    showToast('💾 Draft saved locally. Click Publish Post to make it live for everyone.', 'info');
  };

  // ── Sidebar ──────────────────────────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all-posts', label: 'Categories', icon: Layers },
    { id: 'breaking-news', label: 'Breaking News', icon: Megaphone },
    { id: 'new-post', label: '+ New Post', icon: PlusSquare },
  ];

  // ── Render sections ──────────────────────────────────────
  const renderDashboard = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
          Dashboard Overview
        </h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', color: '#065f46', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          Cloud Database: <strong>Firebase Firestore (Live Instant Sync Active)</strong>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Posts', value: stats.total, color: '#6366f1', icon: BarChart3 },
          { label: 'Latest Jobs', value: stats.jobs, color: '#0ea5e9', icon: Briefcase },
          { label: 'Admit Cards', value: stats.admitCards, color: '#f59e0b', icon: IdCard },
          { label: 'Results', value: stats.results, color: '#10b981', icon: CheckSquare },
          { label: 'Admissions', value: stats.admissions, color: '#f43f5e', icon: GraduationCap },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color, marginTop: '4px' }}>{value}</div>
              </div>
              <div style={{ background: color + '20', borderRadius: '10px', padding: '10px' }}>
                <Icon size={22} style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', margin: 0 }}>Recent Posts</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveSection('new-post')}>
            <FilePlus size={14} /> New Post
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Title', 'Category', 'Last Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.slice(0, 8).map(j => (
              <tr key={j.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', fontSize: '0.88rem', maxWidth: '380px' }}>{j.title}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {j.category || 'JOB'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#64748b' }}>{j.lastDate || 'N/A'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => onDeleteJob(j.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAllPosts = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
          Manage All Posts ({filteredJobs.length})
        </h2>
        <button className="btn btn-primary btn-sm" onClick={() => setActiveSection('new-post')}>
          <FilePlus size={14} /> New Post
        </button>
      </div>

      {/* Filter & Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text" placeholder="Search posts by title..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', outline: 'none' }}
          />
        </div>
        <select
          value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Posts Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['#', 'Title', 'Category', 'Last Date', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredJobs.slice(0, 50).map((job, idx) => (
              <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#94a3b8' }}>{idx + 1}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', maxWidth: '400px' }}>
                  <a href={`/${job.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0d47a1', textDecoration: 'none' }}>
                    {job.title}
                  </a>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {job.category || 'JOB'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#64748b' }}>{job.lastDate || job.appLast || 'N/A'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => onDeleteJob(job.id)} title="Delete post"
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── New Post Form (Matching bigbooster create-post visual editor) ──
  const renderNewPost = () => (
    <div>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Create New Post</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>Visual Editing Mode: Edit directly in the preview pane</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setActiveSection('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSaveDraft} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <Save size={14} /> Save Draft
          </button>
          <button onClick={handlePublish} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)' }}>
            <UploadCloud size={16} /> Publish Post
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

            {/* Colors (Visual Color Picker matching Bigbooster) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }} title="Text Color">
              <Palette size={15} style={{ color: '#64748b' }} />
              <input
                type="color"
                value={textColor}
                onInput={(e) => {
                  setTextColor(e.target.value);
                  execCmd('foreColor', e.target.value);
                }}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  execCmd('foreColor', e.target.value);
                }}
                style={{
                  width: '22px',
                  height: '22px',
                  padding: 0,
                  border: '1px solid #94a3b8',
                  borderRadius: '3px',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                title="Choose Text Color"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }} title="Highlight Color">
              <button
                type="button"
                onClick={() => execCmd('hiliteColor', highlightColor)}
                title="Highlight Selection"
                style={{ background: '#fef08a', border: '1px solid #eab308', borderRadius: '3px', padding: '2px 4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Highlighter size={13} style={{ color: '#854d0e' }} />
              </button>
              <input
                type="color"
                value={highlightColor}
                onInput={(e) => {
                  setHighlightColor(e.target.value);
                  execCmd('hiliteColor', e.target.value);
                }}
                onChange={(e) => {
                  setHighlightColor(e.target.value);
                  execCmd('hiliteColor', e.target.value);
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
                title="Choose Highlight Color"
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
          </div>

          {/* Paper Canvas Preview Area */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
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
              onFocus={() => { isVisualFocusedRef.current = true; }}
              onBlur={() => { isVisualFocusedRef.current = false; }}
              onInput={handleVisualInput}
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

  const renderBreakingNews = () => (
    <div>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px', color: '#1e293b' }}>Breaking News / Ticker</h2>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '24px' }}>
        <p style={{ color: '#64748b', marginBottom: '16px' }}>The ticker at the top of your website shows the latest updates. Currently showing:</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {[
            'Bihar Police Constable 19838 Exam City / Admit Card 2025 OUT!',
            'SSC CGL Recruitment 2025 Online Form Apply - Last Date Extended!',
            'Railway RRB NTPC UG Level Application Status 2025 Link Active',
            'RRB Technician Grade 1 & 3 Recruitment Notification Released',
            'Bihar B.Ed Counselling 2025 Registration Started',
          ].map((item, i) => (
            <li key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', marginBottom: '8px', fontSize: '0.9rem', color: '#1e293b', borderLeft: '4px solid #0ea5e9' }}>
              {item}
            </li>
          ))}
        </ul>
        <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#94a3b8' }}>
          💡 To update ticker items, edit <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>src/components/TopTicker.jsx</code>
        </p>
      </div>
    </div>
  );

  // ── Layout ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', background: '#f1f5f9', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '240px' : '64px', flexShrink: 0,
        background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease', overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookmarkCheck size={24} style={{ color: '#f43f5e', flexShrink: 0 }} />
          {sidebarOpen && <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.05rem', whiteSpace: 'nowrap', color: '#fff' }}>Career Diary</span>}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 10px',
                background: activeSection === id ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                color: activeSection === id ? '#fff' : '#94a3b8',
                borderLeft: activeSection === id ? '3px solid #f43f5e' : '3px solid transparent',
                transition: 'all 0.15s'
              }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{label}</span>}
              {sidebarOpen && activeSection === id && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </button>
          ))}
        </nav>

        {/* Bottom Buttons */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', marginBottom: '4px' }}>
            <Eye size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ fontSize: '0.88rem', whiteSpace: 'nowrap' }}>View Website</span>}
          </button>
          <button onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#f87171' }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ fontSize: '0.88rem', whiteSpace: 'nowrap' }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'all-posts' && renderAllPosts()}
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
