'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Home, FileQuestion } from 'lucide-react';

export default function NotFound() {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = '/?q=' + encodeURIComponent(search.trim());
    }
  };

  return (
    <div className="app-root">
      <Header
        searchQuery={search}
        setSearchQuery={setSearch}
        onResetFilters={() => {
          window.location.href = '/';
        }}
      />
      <Navbar
        currentCategory="all"
        onNavigate={(path) => {
          window.location.href = path;
        }}
      />

      <main className="main-content container" style={{ minHeight: '600px', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '12px',
          padding: '40px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            marginBottom: '20px'
          }}>
            <FileQuestion size={44} />
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            404 - Page Not Found
          </h1>

          <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Yeh notification ya link abhi available nahi hai, ya URL galat type kiya gaya hai.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search job, admit card, result..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                backgroundColor: '#d81b60',
                color: '#fff',
                border: 'none',
                padding: '0 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Search
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="/"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#d81b60',
                color: '#fff',
                padding: '10px 22px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              <Home size={18} /> Back to Homepage
            </a>
            <a
              href="/results"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                padding: '10px 22px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Check Latest Results
            </a>
          </div>
        </div>
      </main>

      <Footer />

      {/* Floating Action Buttons */}
      <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="floating-btn float-whatsapp">
        Join WhatsApp
      </a>
      <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="floating-btn float-telegram">
        Join Telegram
      </a>
    </div>
  );
}
