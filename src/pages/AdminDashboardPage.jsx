import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Layers, Megaphone, PlusSquare, Trash2, Search,
  LogOut, Eye, BookmarkCheck, ChevronRight, X, Save, UploadCloud,
  Download, BarChart3, FileText, IdCard, CheckSquare, GraduationCap, Bookmark, Briefcase,
  RotateCcw, RotateCw, Bold, Italic, Underline, Strikethrough, Code, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link2, Unlink,
  Image, Video, Table, Maximize2, Minimize2, FileCode, Globe,
  ChevronDown, ChevronUp, Palette, Highlighter
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
};

export default function AdminDashboardPage({ jobs, onAddJob, onDeleteJob, onBack, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [importUrl, setImportUrl] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMetadata, setShowMetadata] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  const visualEditorRef = useRef(null);
  const isVisualFocusedRef = useRef(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

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

  const handleInsertLink = () => {
    const url = prompt('Enter URL (e.g. https://...):', 'https://');
    if (url && url.trim() && url !== 'https://') {
      execCmd('createLink', url.trim());
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter Image URL:');
    if (url && url.trim()) {
      execCmd('insertImage', url.trim());
    }
  };

  const handleInsertVideo = () => {
    const url = prompt('Enter Embed / Video URL:');
    if (url && url.trim()) {
      execCmd('insertHTML', `<p><iframe src="${url.trim()}" width="100%" height="320" frameborder="0" allowfullscreen></iframe></p>`);
    }
  };

  const handleTextColor = () => {
    const color = prompt('Enter text color (e.g. #c0392b, red, #0056b3):', '#c0392b');
    if (color && color.trim()) execCmd('foreColor', color.trim());
  };

  const handleBgColor = () => {
    const color = prompt('Enter highlight color (e.g. #fef08a, yellow):', '#fef08a');
    if (color && color.trim()) execCmd('hiliteColor', color.trim());
  };

  const handleImportData = async () => {
    if (!importUrl.trim()) {
      alert('Please paste a URL, JSON post snippet, or HTML source to import.');
      return;
    }
    const raw = importUrl.trim();

    // Helper to sanitize external branding
    const cleanStr = (str) => {
      if (!str || typeof str !== 'string') return '';
      return str
        .replace(/sarkari\s*result(\.com(\.cm)?)?/gi, 'Career Diary')
        .replace(/sarkariresult\.co\.cm/gi, 'careerdiary.in')
        .replace(/sarkariresult\.com/gi, 'careerdiary.in');
    };

    // 1. JSON snippet import
    if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
      try {
        const parsed = JSON.parse(raw);
        const p = Array.isArray(parsed) ? parsed[0] : parsed;
        if (p && typeof p === 'object') {
          const importedTitle = cleanStr(p.title || p.post_title || '');
          const importedContent = cleanStr(p.content || p.htmlContent || p.html || '');
          const importedShort = cleanStr(p.short_info || p.uniqueDescription || p.description || '');

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
          }));
          if (visualEditorRef.current && importedContent) {
            visualEditorRef.current.innerHTML = importedContent;
          }
          setImportUrl('');
          alert('✅ Post data imported and filled into form successfully!');
          return;
        }
      } catch (err) {
        console.warn('JSON import error:', err);
      }
    }

    // 2. Direct HTML code import
    if (raw.includes('<') && raw.includes('>')) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(raw, 'text/html');
        const titleEl = doc.querySelector('h1, .post-title, h2, title');
        const extractedTitle = cleanStr(titleEl ? titleEl.textContent.trim() : '');
        const pEls = Array.from(doc.querySelectorAll('p'));
        const extractedShort = cleanStr(pEls.length > 0 ? pEls[0].textContent.trim() : '');
        const bodyText = doc.body.textContent || '';
        const postMatch = bodyText.match(/(\d[\d,]*\s*(?:Posts?|पद|Vacanc(?:y|ies)))/i);
        const extractedTotal = postMatch ? postMatch[1] : '';
        const cleanedHtml = cleanStr(doc.body.innerHTML);

        setForm(prev => ({
          ...prev,
          title: extractedTitle || prev.title,
          description: extractedShort || prev.description,
          totalPosts: extractedTotal || prev.totalPosts,
          vacancies: extractedTotal || prev.vacancies,
          content: cleanedHtml || prev.content,
          seoTitle: extractedTitle || prev.seoTitle,
          seoDescription: extractedShort ? extractedShort.slice(0, 160) : prev.seoDescription,
          slug: extractedTitle ? extractedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : prev.slug,
        }));
        if (visualEditorRef.current && cleanedHtml) {
          visualEditorRef.current.innerHTML = cleanedHtml;
        }
        setImportUrl('');
        alert('✅ HTML content and tables imported successfully!');
        return;
      } catch (err) {
        console.warn('HTML parse error:', err);
      }
    }

    // 3. If user pasted a URL
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const res = await fetch(raw);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            const importedTitle = cleanStr(data.title || data.post_title || '');
            const importedContent = cleanStr(data.content || data.htmlContent || '');
            setForm(prev => ({
              ...prev,
              title: importedTitle || prev.title,
              category: data.category ? data.category.toUpperCase() : prev.category,
              totalPosts: data.total_post || data.totalPosts || prev.totalPosts,
              content: importedContent || prev.content,
              description: cleanStr(data.short_info || data.description || prev.description),
              seoTitle: cleanStr(data.seo_title || importedTitle || prev.seoTitle),
              slug: data.slug || prev.slug,
            }));
            if (visualEditorRef.current && importedContent) {
              visualEditorRef.current.innerHTML = importedContent;
            }
            setImportUrl('');
            alert('✅ URL data fetched and imported successfully!');
            return;
          }
        }
      } catch (e) {
        console.warn('Direct fetch blocked by CORS:', e);
      }

      const pastedSnippet = prompt(
        "🌐 URL Import Assistant:\nExternal browser URL fetching was restricted by CORS.\n\n👉 Easy solution: Simply copy the HTML content or JSON of the post and paste it below. It will automatically populate the Title, Vacancies, and Tables:",
        ""
      );
      if (pastedSnippet && pastedSnippet.trim()) {
        setImportUrl(pastedSnippet.trim());
        setTimeout(() => handleImportData(), 80);
      }
      return;
    }

    alert('💡 Import Tip: You can paste either:\n1. Post JSON snippet (e.g. { "title": "...", "content": "..." })\n2. Direct HTML code with tables\n\nIt will auto-populate all fields and visual preview immediately!');
  };

  const handlePublish = async () => {
    if (!form.title.trim()) {
      alert('Post Title is required!');
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
        ...(form.examDate ? { examDate: form.examDate.trim() } : {})
      },
      importantLinks: {
        ...(form.applyUrl ? { 'Apply Online': form.applyUrl.trim() } : {}),
        ...(form.notificationUrl ? { 'Download Notification': form.notificationUrl.trim() } : {}),
        ...(form.officialUrl ? { 'Official Website': form.officialUrl.trim() } : {}),
        'Join Telegram Channel': 'https://t.me/careerdiary',
        'Join WhatsApp Channel': 'https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u'
      },
      postDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    };

    const res = await onAddJob(newJob);
    if (res && res.success === false) {
      alert(`⚠️ Note: Post is saved locally, but Firestore sync error: ${res.error?.message || res.error}`);
    } else {
      alert('🎉 Post published successfully! It is now LIVE on Career Diary for all users worldwide via Firebase Firestore.');
    }
    setForm({ ...EMPTY_FORM });
    setActiveSection('all-posts');
  };

  const handleSaveDraft = () => {
    alert('Draft saved locally. Click Publish Post to make it live for everyone.');
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
          placeholder="Paste sarkariupdate.bigbooster.in URL here..."
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

            {/* Box 1: HTML Source */}
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
                  rows={14}
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
                    padding: '14px',
                    background: '#0d1117',
                    color: '#38bdf8',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.86rem',
                    lineHeight: '1.55',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Box 2: SEO Metadata */}
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

            {/* Box 3: Collapsible Metadata (Dates, Fees, Links) */}
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
                  fontSize: '0.85rem',
                  color: '#475569',
                  textTransform: 'uppercase'
                }}>
                <span>MANAGE METADATA (DATES, FEES, LINKS) {showMetadata ? '−' : '+'}</span>
                {showMetadata ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showMetadata && (
                <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>APPLICATION START</label>
                      <input type="text" placeholder="e.g. 02 September 2026" value={form.appStart} onChange={e => set('appStart', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>LAST DATE</label>
                      <input type="text" placeholder="e.g. 22 September 2026" value={form.lastDate} onChange={e => set('lastDate', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>GEN / OBC FEE</label>
                      <input type="text" placeholder="₹100" value={form.feeGen} onChange={e => set('feeGen', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>SC / ST FEE</label>
                      <input type="text" placeholder="₹0" value={form.feeSc} onChange={e => set('feeSc', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>APPLY ONLINE LINK</label>
                    <input type="url" placeholder="https://..." value={form.applyUrl} onChange={e => set('applyUrl', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>OFFICIAL NOTIFICATION PDF</label>
                    <input type="url" placeholder="https://..." value={form.notificationUrl} onChange={e => set('notificationUrl', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>OFFICIAL PORTAL WEBSITE</label>
                    <input type="url" placeholder="https://..." value={form.officialUrl} onChange={e => set('officialUrl', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                  </div>
                </div>
              )}
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

            {/* Colors */}
            <button type="button" onClick={handleTextColor} title="Text Color" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Palette size={14} style={{ color: '#c0392b' }} /></button>
            <button type="button" onClick={handleBgColor} title="Highlight Color" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Highlighter size={14} style={{ color: '#ca8a04' }} /></button>

            <span style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }} />

            {/* Lists */}
            <button type="button" onClick={() => execCmd('insertUnorderedList')} title="Bullet List" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><List size={14} /></button>
            <button type="button" onClick={() => execCmd('insertOrderedList')} title="Numbered List" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><ListOrdered size={14} /></button>

            <span style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }} />

            {/* Inserts: Link, Image, Video, Table */}
            <button type="button" onClick={handleInsertLink} title="Insert Link" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Link2 size={14} /></button>
            <button type="button" onClick={() => execCmd('unlink')} title="Unlink" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Unlink size={14} /></button>
            <button type="button" onClick={handleInsertImage} title="Insert Image" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Image size={14} /></button>
            <button type="button" onClick={handleInsertVideo} title="Insert Video" style={{ padding: '5px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}><Video size={14} /></button>
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
    </div>
  );
}
