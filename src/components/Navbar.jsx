import React from 'react';
import { Home, Briefcase, IdCard, CheckSquare, FileText, GraduationCap, Star } from 'lucide-react';

export default function Navbar({ currentCategory, setCurrentCategory, onNavigate }) {
  const navItems = [
    { cat: 'all', path: '/', label: 'Home', icon: Home },
    { cat: 'LATEST JOB', path: '/latest-jobs', label: 'Latest Jobs', icon: Briefcase },
    { cat: 'ADMIT CARD', path: '/admit-card', label: 'Admit Card', icon: IdCard },
    { cat: 'RESULT / ANSWER KEY', path: '/results', label: 'Results & Keys', icon: CheckSquare },
    { cat: 'SYLLABUS', path: '/syllabus', label: 'Syllabus', icon: FileText },
    { cat: 'ADMISSION', path: '/admission', label: 'Admission', icon: GraduationCap },
    { cat: 'IMPORTANT', path: '/important-links', label: 'Important Links', icon: Star },
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
