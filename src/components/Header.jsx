import React from 'react';
import { BookmarkCheck, Search, X, PlusCircle, Calculator, Moon, Sun } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  darkMode,
  setDarkMode,
  onOpenPostModal,
  onOpenCalcModal,
  onResetFilters
}) {
  return (
    <header className="main-header">
      <div className="container header-container">
        <div className="brand-logo" onClick={onResetFilters}>
          <div className="logo-icon">
            <BookmarkCheck className="w-7 h-7" />
          </div>
          <div className="logo-text">
            <span className="logo-title">CAREER DIARY</span>
            <span className="logo-subtitle">CAREERDIARY.BLOGSPOT.COM • GOVT JOB PORTAL</span>
          </div>
        </div>

        <div className="search-box-wrapper">
          <Search className="search-icon w-5 h-5" />
          <input
            type="text"
            placeholder="Search Jobs, Admit Cards, Syllabus, Results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={onOpenPostModal}>
            <PlusCircle className="w-4 h-4" /> Post Job Update
          </button>
          <button className="btn btn-secondary" onClick={onOpenCalcModal}>
            <Calculator className="w-4 h-4" /> Age Calculator
          </button>
          <button
            className="icon-btn"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
