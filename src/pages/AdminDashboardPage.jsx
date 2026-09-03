import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, PlusCircle, Trash2, Edit3, Search, CheckCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage({ jobs, onAddJob, onDeleteJob, onBack, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const filtered = jobs.filter(j => {
    const matchCat = filterCat === 'all' || j.category === filterCat;
    const matchSearch = !searchTerm || j.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      {/* Back & Top Bar */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Exit Admin to Main Website
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          URL: <strong>https://careerdiary.in/admin</strong>
        </span>
      </div>

      {/* Admin Panel Header */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>
                Career Diary Admin Control Panel
              </h1>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              Manage, create, and remove job postings, admit cards, results, and admissions live.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={onAddJob}>
              <PlusCircle className="w-4 h-4 inline mr-1" /> Post New Job Update
            </button>
            <button className="btn btn-outline btn-sm" onClick={onLogout} style={{ color: 'var(--primary-color)' }}>
              Logout Admin
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search posts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className="form-control"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="all">All Categories ({jobs.length})</option>
            <option value="LATEST JOB">Latest Jobs</option>
            <option value="ADMIT CARD">Admit Cards</option>
            <option value="RESULT / ANSWER KEY">Results & Keys</option>
            <option value="SYLLABUS">Syllabus</option>
            <option value="ADMISSION">Admissions</option>
            <option value="IMPORTANT">Important</option>
          </select>
        </div>
      </div>

      {/* Table of Job Postings */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <table className="table-styled" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Post Title</th>
              <th>Category</th>
              <th>Last Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No posts found matching search.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {typeof item.id === 'string' ? item.id.substring(0, 12) + '...' : item.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.92rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.organization || 'Govt Board'}</div>
                  </td>
                  <td>
                    <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{item.category}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.appLast || item.lastDate || 'Active'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => alert(`Editing Post: ${item.title}`)}
                        title="Edit Post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                            onDeleteJob(item.id);
                          }
                        }}
                        style={{ color: '#e74c3c', borderColor: '#e74c3c' }}
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
}
