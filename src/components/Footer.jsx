import React from 'react';
import { BookmarkCheck, Send, PhoneCall, Globe, Share2, Lock, ShieldCheck } from 'lucide-react';

export default function Footer({ onCategorySelect, onSearchSelect, isAdmin, onOpenAdminModal, onLogoutAdmin, onStaticPage }) {
  return (
    <footer className="main-footer">
      <div className="container footer-content">
        <div className="footer-col brand-col">
          <div className="brand-logo footer-logo">
            <BookmarkCheck className="w-6 h-6 inline mr-2 text-primary" />
            <span>CAREER DIARY</span>
          </div>
          <p className="footer-desc">
            Career Diary (careerdiary.in / careerdiary.blogspot.com) is India's most trusted portal for competitive exams, Indian Govt jobs recruitment updates, admit cards, answer keys, and syllabus notifications.
          </p>
          <div className="social-links">
            <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="social-icon" title="Telegram Channel"><Send className="w-4 h-4" /></a>
            <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp Channel"><PhoneCall className="w-4 h-4" /></a>
            <a href="https://careerdiary.in" className="social-icon" title="Website"><Globe className="w-4 h-4" /></a>
            <a href="#" className="social-icon" title="Share"><Share2 className="w-4 h-4" /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Categories</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onCategorySelect('LATEST JOB'); }}>Latest Jobs 2025-2026</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onCategorySelect('ADMIT CARD'); }}>Hall Ticket & Admit Cards</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onCategorySelect('RESULT / ANSWER KEY'); }}>Results & Answer Key</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onCategorySelect('SYLLABUS'); }}>Exam Pattern & Syllabus</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onCategorySelect('ADMISSION'); }}>Admission Notifications</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Popular Exam Alerts</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onSearchSelect('SSC'); }}>SSC CGL / CHSL / MTS</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onSearchSelect('Railway'); }}>RRB NTPC & Group D</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onSearchSelect('Bihar'); }}>Bihar Police & BSSC</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onSearchSelect('BPSC'); }}>BPSC TRE 4.0 & 71st CCE</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onSearchSelect('Bank'); }}>IBPS / SBI PO & Clerk</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Subscribe Alerts</h4>
          <p>Get instant Job Alerts sent to your inbox!</p>
          <div className="subscribe-form">
            <input type="email" placeholder="Enter your email address..." />
            <button className="btn btn-primary" onClick={() => alert('Subscribed to Career Diary Job Alerts!')}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2025-2026 <strong>Career Diary Help</strong>. All Rights Reserved. Not affiliated with any official government organization.</p>
          <div className="footer-bottom-links">
            <a href="#" onClick={(e) => { e.preventDefault(); onStaticPage('privacy'); }}>Privacy Policy</a> | 
            <a href="#" onClick={(e) => { e.preventDefault(); onStaticPage('terms'); }}>Terms &amp; Conditions</a> | 
            <a href="#" onClick={(e) => { e.preventDefault(); onStaticPage('contact'); }}>Contact Us</a> | 
            {isAdmin ? (
              <a href="#" onClick={(e) => { e.preventDefault(); onLogoutAdmin(); }} style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                <ShieldCheck className="w-3 h-3 inline mr-1" /> Admin (Exit)
              </a>
            ) : (
              <a href="#" onClick={(e) => { e.preventDefault(); onOpenAdminModal(); }} style={{ opacity: 0.7 }}>
                <Lock className="w-3 h-3 inline mr-1" /> Admin Login
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
