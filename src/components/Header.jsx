import React from 'react';
import { BookmarkCheck, Search, X, PlusCircle, LogOut } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  isAdmin,
  onOpenPostModal,
  onLogoutAdmin,
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
          {/* Post Job Update Button - ONLY VISIBLE TO ADMIN */}
          {isAdmin ? (
            <>
              <button className="btn btn-primary" onClick={onOpenPostModal} title="Admin: Post New Job Update">
                <PlusCircle className="w-4 h-4" /> Post Job Update
              </button>
              <button className="btn btn-sm btn-outline" onClick={onLogoutAdmin} title="Exit Admin Mode">
                <LogOut className="w-4 h-4" /> Exit Admin
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
