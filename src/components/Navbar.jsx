import React from 'react';
import { Home, Briefcase, IdCard, CheckSquare, Key, FileText, GraduationCap, FileCheck, Star } from 'lucide-react';

export default function Navbar({ currentCategory, setCurrentCategory, onNavigate }) {
  const navItems = [
    { cat: 'all', path: '/', label: 'Home', icon: Home },
    { cat: 'LATEST JOB', path: '/latest-jobs', label: 'Latest Jobs', icon: Briefcase },
    { cat: 'ADMIT CARD', path: '/admit-card', label: 'Admit Card', icon: IdCard },
    { cat: 'RESULT', path: '/results', label: 'Result', icon: CheckSquare },
    { cat: 'ANSWER KEY', path: '/answer-key', label: 'Answer Key', icon: Key },
    { cat: 'SYLLABUS', path: '/syllabus', label: 'Syllabus', icon: FileText },
    { cat: 'ADMISSION', path: '/admission', label: 'Admission', icon: GraduationCap },
    { cat: 'DOCUMENTS', path: '/documents', label: 'Documents', icon: FileCheck },
    { cat: 'IMPORTANT', path: '/important', label: 'Important', icon: Star },
  ];

  return (
    <nav className="nav-bar">
      <div className="container nav-container">
        <ul className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentCategory === item.cat;
            return (
              <li key={item.cat} className={isActive ? 'active' : ''}>
                <a
                  href={item.path}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                      e.preventDefault();
                      if (onNavigate) {
                        onNavigate(item.path);
                      } else if (setCurrentCategory) {
                        setCurrentCategory(item.cat);
                      }
                    }
                  }}
                >
                  <Icon className="w-4 h-4 inline-block" /> {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
