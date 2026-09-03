import React from 'react';
import { Home, Briefcase, IdCard, CheckSquare, FileText, GraduationCap, Star } from 'lucide-react';

export default function Navbar({ currentCategory, setCurrentCategory }) {
  const navItems = [
    { cat: 'all', label: 'Home', icon: Home },
    { cat: 'LATEST JOB', label: 'Latest Jobs', icon: Briefcase },
    { cat: 'ADMIT CARD', label: 'Admit Card', icon: IdCard },
    { cat: 'RESULT / ANSWER KEY', label: 'Results & Keys', icon: CheckSquare },
    { cat: 'SYLLABUS', label: 'Syllabus', icon: FileText },
    { cat: 'ADMISSION', label: 'Admission', icon: GraduationCap },
    { cat: 'IMPORTANT', label: 'Important Links', icon: Star },
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
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentCategory(item.cat);
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
