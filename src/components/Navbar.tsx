'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Briefcase,
  IdCard,
  CheckSquare,
  Key,
  FileText,
  GraduationCap,
  BookOpen,
  Newspaper,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';

export default function Navbar({ currentCategory, setCurrentCategory, onNavigate }: any = {}) {
  const [pathname, setPathname] = useState('');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  const updateDropdownPos = () => {
    if (moreBtnRef.current) {
      const rect = moreBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
  };

  const toggleMore = () => {
    if (!isMoreOpen) {
      updateDropdownPos();
    }
    setIsMoreOpen((prev) => !prev);
  };

  // Close dropdown on outside click or scroll/resize
  useEffect(() => {
    if (!isMoreOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        moreBtnRef.current &&
        !moreBtnRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsMoreOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updateDropdownPos();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isMoreOpen]);

  const navItems = [
    { cat: 'all', path: '/', label: 'Home', icon: Home },
    { cat: 'LATEST JOB', path: '/latest-jobs', label: 'Latest Jobs', icon: Briefcase },
    { cat: 'ADMIT CARD', path: '/admit-card', label: 'Admit Card', icon: IdCard },
    { cat: 'RESULT', path: '/results', label: 'Result', icon: CheckSquare },
    { cat: 'ANSWER KEY', path: '/answer-key', label: 'Answer Key', icon: Key },
    { cat: 'SYLLABUS', path: '/syllabus', label: 'Syllabus', icon: FileText },
    { cat: 'ADMISSION', path: '/admission', label: 'Admission', icon: GraduationCap },
  ];

  const moreItems = [
    { cat: 'TEST_SERIES', path: '/test-series', label: 'Test Series', icon: BookOpen, badge: 'NEW' },
    { cat: 'CURRENT_AFFAIRS', path: '/current-affairs', label: 'Current Affairs', icon: Newspaper, badge: 'HOT' },
  ];

  const isItemActive = (item: { cat: string; path: string }) => {
    if (currentCategory) {
      if (item.cat === 'TEST_SERIES' && (currentCategory === 'TEST_SERIES' || currentCategory === 'STUDY_QUIZ')) {
        return true;
      }
      return currentCategory === item.cat;
    }
    if (item.path === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname.startsWith(item.path);
  };

  const isMoreActive = moreItems.some((item) => isItemActive(item));

  const handleNavigate = (e: React.MouseEvent, path: string, cat: string) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      setIsMoreOpen(false);
      if (onNavigate) {
        onNavigate(path);
      } else if (setCurrentCategory) {
        setCurrentCategory(cat);
      } else {
        window.location.href = path;
      }
    }
  };

  return (
    <nav className="nav-bar" aria-label="Main Navigation">
      <div className="nav-container">
        <ul className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <li key={item.cat} className={active ? 'active' : ''} style={{ flexShrink: 0 }}>
                <a
                  href={item.path}
                  style={{ flexShrink: 0 }}
                  onClick={(e) => handleNavigate(e, item.path, item.cat)}
                >
                  <Icon size={15} className="nav-icon" />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}

          {/* More Dropdown Tab */}
          <li className={isMoreActive ? 'active more-nav-tab' : 'more-nav-tab'} style={{ flexShrink: 0, position: 'relative' }}>
            <button
              ref={moreBtnRef}
              type="button"
              onClick={toggleMore}
              aria-expanded={isMoreOpen}
              className={`nav-more-toggle-btn ${isMoreActive ? 'active' : ''}`}
              style={{
                background: isMoreActive ? 'rgba(255, 255, 255, 0.12)' : isMoreOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: isMoreActive ? '3px solid var(--primary-color, #c2185b)' : '3px solid transparent',
                color: isMoreActive || isMoreOpen ? '#ffffff' : '#cbd5e1',
                padding: '11px 11px',
                fontSize: '0.85rem',
                fontWeight: isMoreActive ? 700 : 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0',
                transition: 'all 0.18s ease',
                flexShrink: 0
              }}
            >
              <MoreHorizontal size={15} className="nav-icon" />
              <span>More</span>
              <ChevronDown
                size={13}
                style={{
                  transform: isMoreOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  opacity: 0.8
                }}
              />
            </button>
          </li>
        </ul>
      </div>

      {/* Floating Dropdown Menu (Position Fixed, Outside of clipping contexts) */}
      {isMoreOpen && dropdownPos && (
        <div
          ref={dropdownRef}
          className="nav-more-dropdown-panel"
          style={{
            position: 'fixed',
            top: `${dropdownPos.top}px`,
            right: `${dropdownPos.right}px`,
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '10px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.55), 0 4px 12px rgba(0, 0, 0, 0.3)',
            minWidth: '210px',
            zIndex: 999999,
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            backdropFilter: 'blur(12px)',
            animation: 'navDropdownFadeIn 0.16s ease-out'
          }}
        >
          {moreItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <a
                key={item.cat}
                href={item.path}
                onClick={(e) => handleNavigate(e, item.path, item.cat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  color: active ? '#ffffff' : '#cbd5e1',
                  backgroundColor: active ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  fontWeight: active ? 700 : 600,
                  fontSize: '0.86rem',
                  textDecoration: 'none',
                  borderLeft: active ? '3px solid var(--primary-color, #c2185b)' : '3px solid transparent',
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="nav-item-badge" style={{ marginLeft: 0 }}>
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      )}
    </nav>
  );
}
