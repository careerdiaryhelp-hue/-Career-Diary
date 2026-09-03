import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Tag, Megaphone, FilePlus, Trash2, Search,
  LogOut, Eye, BookmarkCheck, ChevronRight, X, Save, UploadCloud,
  Download, BarChart3, FileText, IdCard, CheckSquare, GraduationCap, Bookmark, Briefcase
} from 'lucide-react';

const CATEGORIES = [
  { value: 'LATEST JOB', label: 'Latest Job', icon: Briefcase },
  { value: 'ADMIT CARD', label: 'Admit Card', icon: IdCard },
  { value: 'RESULT / ANSWER KEY', label: 'Result / Key', icon: CheckSquare },
  { value: 'SYLLABUS', label: 'Syllabus', icon: FileText },
  { value: 'ADMISSION', label: 'Admission', icon: GraduationCap },
  { value: 'IMPORTANT', label: 'Important', icon: Bookmark },
];

const EMPTY_FORM = {
  title: '',
  category: 'LATEST JOB',
  organization: '',
  vacancies: '',
  lastDate: '',
  appStart: '',
  badge: 'New!',
  bannerColor: 'pink',
  description: '',
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

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

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

  const handlePublish = () => {
    if (!form.title.trim()) { alert('Title is required!'); return; }
    const slug = form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newJob = {
      id: slug + '-' + Date.now(),
      title: form.title.trim(),
      category: form.category,
      organization: form.organization.trim() || 'Career Diary Alert',
      vacancies: form.vacancies.trim() || 'Various',
      lastDate: form.lastDate.trim() || '',
      appLast: form.lastDate.trim() || '',
      appStart: form.appStart.trim() || '',
      badge: form.badge,
      bannerColor: form.bannerColor,
      description: form.description.trim(),
      uniqueDescription: form.description.trim(),
      applyUrl: form.applyUrl.trim() || '',
      officialUrl: form.officialUrl.trim() || '',
      state: form.state.trim() || 'All India',
      feeGen: form.feeGen.trim() || '₹100',
      feeSc: form.feeSc.trim() || '₹0',
      minAge: form.minAge.trim() || '18 Years',
      maxAge: form.maxAge.trim() || '37 Years',
      qualification: form.qualification.trim() || 'As per notification',
      importantLinks: {
        ...(form.applyUrl ? { 'Apply Online': form.applyUrl } : {}),
        ...(form.notificationUrl ? { 'Download Notification': form.notificationUrl } : {}),
        ...(form.officialUrl ? { 'Official Website': form.officialUrl } : {}),
      },
      postDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    };
    onAddJob(newJob);
    setForm({ ...EMPTY_FORM });
    setActiveSection('all-posts');
    alert('✅ Post published successfully!');
  };

  const handleSaveDraft = () => {
    alert('Draft saved locally. Click Publish to make it live.');
  };

  // ── Sidebar ──────────────────────────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all-posts', label: 'All Posts', icon: Tag },
    { id: 'breaking-news', label: 'Breaking News', icon: Megaphone },
    { id: 'new-post', label: 'New Post', icon: FilePlus },
  ];

  const slugPreview = form.title
    ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : '';

  // ── Render sections ──────────────────────────────────────
  const renderDashboard = () => (
    <div>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: '24px', color: '#1e293b' }}>
        Dashboard Overview
      </h2>

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
            {jobs.slice(0, 10).map(j => (
              <tr key={j.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 16px', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', maxWidth: '300px' }}>{j.title}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {j.category}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: '0.83rem', color: '#64748b' }}>{j.appLast || j.lastDate || '—'}</td>
                <td style={{ padding: '10px 16px' }}>
                  <button onClick={() => { if (confirm('Delete this post?')) onDeleteJob(j.id); }}
                    style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={14} />
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
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px', color: '#1e293b' }}>All Posts</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Search posts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', background: '#fff', cursor: 'pointer' }}>
          <option value="all">All Categories ({jobs.length})</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label} ({jobs.filter(j => (j.category || '').toUpperCase() === c.value).length})</option>
          ))}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Post Title', 'Category', 'Last Date', 'Delete'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No posts found.</td></tr>
            ) : filteredJobs.map(j => (
              <tr key={j.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.4 }}>{j.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{j.organization || ''}</div>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {j.category}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: '0.83rem', color: '#64748b' }}>{j.appLast || j.lastDate || '—'}</td>
                <td style={{ padding: '10px 16px' }}>
                  <button onClick={() => { if (confirm(`Delete "${j.title}"?`)) onDeleteJob(j.id); }}
                    style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
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

  const renderNewPost = () => (
    <div>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Create New Post</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>Fill in the details and publish to Career Diary</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setActiveSection('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSaveDraft} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
            <Save size={14} /> Save Draft
          </button>
          <button onClick={handlePublish} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
            <UploadCloud size={14} /> Publish Post
          </button>
        </div>
      </div>

      {/* Quick Import */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '14px 18px', marginBottom: '18px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Quick Import:</span>
        <input type="text" placeholder="Paste job portal / official notification URL here..." value={importUrl} onChange={e => setImportUrl(e.target.value)}
          style={{ flex: 1, minWidth: '240px', padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
        <button onClick={() => { if (importUrl) { alert('Auto-import coming soon! Fill the form manually.'); setImportUrl(''); } }}
          style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <Download size={14} /> Import Data
        </button>
      </div>

      {/* Two-Column Form + Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', alignItems: 'start' }}>

        {/* Left: Form Fields */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⟨/⟩ Post Details
          </h3>

          {/* Category + Badge row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>CATEGORY</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>STATUS BADGE</label>
              <select value={form.badge} onChange={e => set('badge', e.target.value)}>
                <option value="New!">New!</option>
                <option value="Out">Out</option>
                <option value="START">START</option>
                <option value="Link Active">Link Active</option>
                <option value="Last Date">Last Date</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>TITLE *</label>
            <input type="text" required placeholder="Full Post Title e.g. SSC CGL Recruitment 2026 Online Form Apply"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          {/* Slug */}
          <div className="form-group">
            <label>SLUG (AUTO-GENERATED)</label>
            <input type="text" readOnly value={slugPreview} style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }} />
          </div>

          {/* Organization */}
          <div className="form-group">
            <label>ORGANIZATION</label>
            <input type="text" placeholder="e.g. Staff Selection Commission (SSC)" value={form.organization} onChange={e => set('organization', e.target.value)} />
          </div>

          {/* Vacancies + Last Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>TOTAL POSTS</label>
              <input type="text" placeholder="e.g. 17,727 Posts" value={form.vacancies} onChange={e => set('vacancies', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>LAST DATE</label>
              <input type="text" placeholder="e.g. 25 September 2026" value={form.lastDate} onChange={e => set('lastDate', e.target.value)} />
            </div>
          </div>

          {/* Short Info */}
          <div className="form-group">
            <label>SHORT INFORMATION</label>
            <textarea rows={3} placeholder="Brief overview of the recruitment notification..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Links */}
          <div className="form-group">
            <label>APPLY ONLINE LINK</label>
            <input type="url" placeholder="https://..." value={form.applyUrl} onChange={e => set('applyUrl', e.target.value)} />
          </div>
          <div className="form-group">
            <label>NOTIFICATION PDF LINK</label>
            <input type="url" placeholder="https://..." value={form.notificationUrl} onChange={e => set('notificationUrl', e.target.value)} />
          </div>
          <div className="form-group">
            <label>OFFICIAL WEBSITE</label>
            <input type="url" placeholder="https://..." value={form.officialUrl} onChange={e => set('officialUrl', e.target.value)} />
          </div>

          {/* Fees */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>FEE (General/OBC)</label>
              <input type="text" placeholder="e.g. ₹100" value={form.feeGen} onChange={e => set('feeGen', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>FEE (SC/ST/PwD)</label>
              <input type="text" placeholder="e.g. ₹0" value={form.feeSc} onChange={e => set('feeSc', e.target.value)} />
            </div>
          </div>

          {/* Age */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>MIN AGE</label>
              <input type="text" placeholder="18 Years" value={form.minAge} onChange={e => set('minAge', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>MAX AGE</label>
              <input type="text" placeholder="37 Years" value={form.maxAge} onChange={e => set('maxAge', e.target.value)} />
            </div>
          </div>

          {/* Qualification */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>EDUCATIONAL QUALIFICATION</label>
            <textarea rows={2} placeholder="e.g. Graduate in any stream from recognized university..." value={form.qualification} onChange={e => set('qualification', e.target.value)} />
          </div>
        </div>

        {/* Right: Live Preview */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '20px', position: 'sticky', top: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={16} style={{ color: '#0ea5e9' }} /> Live Preview
          </h3>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', minHeight: '300px', background: '#fafafa' }}>
            {form.title ? (
              <>
                <div style={{ color: '#ff0080', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px', lineHeight: 1.3 }}>
                  {form.title}
                </div>
                {form.organization && (
                  <div style={{ color: '#008000', fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px' }}>
                    🏛️ {form.organization}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>{form.category}</span>
                  <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>{form.badge}</span>
                  {form.vacancies && <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>{form.vacancies}</span>}
                </div>
                {form.description && (
                  <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.6, marginBottom: '10px' }}>{form.description}</p>
                )}
                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '10px', fontSize: '0.82rem', color: '#64748b' }}>
                  {form.lastDate && <div>📅 Last Date: <strong style={{ color: '#ef4444' }}>{form.lastDate}</strong></div>}
                  {form.feeGen && <div>💰 Fee: <strong>{form.feeGen}</strong> (Gen/OBC)</div>}
                  {form.minAge && <div>👤 Age: <strong>{form.minAge} – {form.maxAge}</strong></div>}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#94a3b8' }}>
                <Eye size={40} style={{ marginBottom: '10px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.9rem' }}>Preview will appear here as you type...</p>
              </div>
            )}
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
