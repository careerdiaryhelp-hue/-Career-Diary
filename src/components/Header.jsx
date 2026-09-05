import React from 'react';
import { Search, X } from 'lucide-react';
import GoogleTranslate from './GoogleTranslate';

export default function Header({
  searchQuery,
  setSearchQuery,
  onResetFilters
}) {
  return (
    <header className="main-header">
      <div className="container header-container">
        {/* Left balance spacer for centered desktop branding */}
        <div className="header-left-spacer" />

        {/* Brand Logo - Centered in middle */}
        <a
          href="/"
          className="brand-logo"
          style={{ textDecoration: 'none', cursor: 'pointer' }}
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
              e.preventDefault();
              onResetFilters();
            }
          }}
        >
          <img
            src="/image.png"
            alt="Career Diary Logo"
            className="header-logo-img"
          />
          <div className="logo-text">
            <span className="logo-title">CAREER DIARY</span>
            <span className="logo-subtitle">CAREERDIARY.IN • GOVT JOB PORTAL</span>
          </div>
        </a>

        {/* Right side: Compact Search + Language Switcher */}
        <div className="header-actions">
          <div className="search-box-wrapper">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              placeholder="Search Jobs, Results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <GoogleTranslate />
        </div>
      </div>
    </header>
  );
}
