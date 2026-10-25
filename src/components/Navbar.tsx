'use client';
import React, { useState, useEffect } from 'react';
import { Home, Briefcase, IdCard, CheckSquare, Key, FileText, GraduationCap, BookOpen, Newspaper } from 'lucide-react';

export default function Navbar({ currentCategory, setCurrentCategory, onNavigate }: any = {}) {
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  const navItems = [
    { cat: 'all', path: '/', label: 'Home', icon: Home },
    { cat: 'LATEST JOB', path: '/latest-jobs', label: 'Latest Jobs', icon: Briefcase },
    { cat: 'ADMIT CARD', path: '/admit-card', label: 'Admit Card', icon: IdCard },
    { cat: 'RESULT', path: '/results', label: 'Result', icon: CheckSquare },
    { cat: 'ANSWER KEY', path: '/answer-key', label: 'Answer Key', icon: Key },
    { cat: 'SYLLABUS', path: '/syllabus', label: 'Syllabus', icon: FileText },
    { cat: 'ADMISSION', path: '/admission', label: 'Admission', icon: GraduationCap },
    { cat: 'CURRENT_AFFAIRS', path: '/current-affairs', label: 'Current Affairs', icon: Newspaper, badge: 'NEW' },
    { cat: 'TEST_SERIES', path: '/test-series', label: 'Test Series', icon: BookOpen },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    if (currentCategory) {
      return currentCategory === item.cat;
    }
    if (item.path === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname.startsWith(item.path);
  };

  return (
    <nav className="nav-bar" aria-label="Main Navigation">
      <div className="nav-container">
        <ul className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <li key={item.cat} className={active ? 'active' : ''}>
                <a
                  href={item.path}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                      e.preventDefault();
                      if (onNavigate) {
                        onNavigate(item.path);
                      } else if (setCurrentCategory) {
                        setCurrentCategory(item.cat);
                      } else {
                        window.location.href = item.path;
                      }
                    }
                  }}
                >
                  <Icon size={15} className="nav-icon" />
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
