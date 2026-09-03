import React from 'react';
import { Bell } from 'lucide-react';

export default function TopTicker({ onSelectJob }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

  return (
    <>
      <div className="last-date-bar">
        Last Date Reminder:- <a href="#">Click Here to Apply for Last Date Jobs List : {today}</a>
      </div>
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="ticker-label">
            <Bell className="w-4 h-4 icon-pulse" /> Latest Update
          </div>
          <div className="ticker-wrapper">
            <div className="ticker-content">
              <span>
                |- <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(8); }}>
                  Bihar Police Constable 19838 Exam City / Admit Card 2025 OUT!
                </a>
              </span>
              <span>
                || <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(1); }}>
                  SSC CGL Recruitment 2025 Online Form Apply - Last Date Extended!
                </a>
              </span>
              <span>
                || <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(9); }}>
                  Railway RRB NTPC UG Level Application Status 2025 Link Active
                </a>
              </span>
              <span>
                || <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(2); }}>
                  RRB Technician Grade 1 & 3 Recruitment Notification Released
                </a>
              </span>
              <span>
                || <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(3); }}>
                  Bihar B.Ed Counselling 2025 Registration Started
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
