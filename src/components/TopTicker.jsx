import React from 'react';
import { Zap, Send, PhoneCall } from 'lucide-react';

export default function TopTicker({ onSelectJob }) {
  return (
    <div className="top-bar">
      <div className="container top-bar-inner">
        <div className="ticker-label">
          <Zap className="w-3.5 h-3.5 icon-pulse" /> LATEST UPDATES
        </div>
        <div className="ticker-wrapper">
          <div className="ticker-content">
            <span>
              <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(8); }}>
                🔴 Bihar Police Constable 19838 Exam City / Admit Card 2025 OUT!
              </a>
            </span>
            <span>
              <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(1); }}>
                🔥 SSC CGL Recruitment 2025 Online Form Apply - Last Date Extended!
              </a>
            </span>
            <span>
              <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(9); }}>
                ⚡ Railway RRB NTPC UG Level Application Status 2025 Link Active
              </a>
            </span>
            <span>
              <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(2); }}>
                📌 RRB Technician Grade 1 & 3 Recruitment Notification Released
              </a>
            </span>
            <span>
              <a href="#" onClick={(e) => { e.preventDefault(); onSelectJob(3); }}>
                🎓 Bihar B.Ed Counselling 2025 Registration Started
              </a>
            </span>
          </div>
        </div>
        <div className="top-social-actions">
          <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="social-btn telegram-btn">
            <Send className="w-3.5 h-3.5" /> Telegram
          </a>
          <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="social-btn whatsapp-btn">
            <PhoneCall className="w-3.5 h-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
