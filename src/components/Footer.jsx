import React from 'react';
import { Send } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const handleLink = (e, path) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      if (onNavigate) {
        onNavigate(path);
      }
    }
  };

  return (
    <footer className="main-footer">
      <div className="container footer-content">
        <div className="footer-col brand-col">
          <div className="brand-logo footer-logo">
            <img src="/image.png" alt="Career Diary Logo" style={{ width: '36px', height: '36px', borderRadius: '50%', marginRight: '10px', verticalAlign: 'middle', objectFit: 'contain' }} />
            <span>CAREER DIARY</span>
          </div>
          <p className="footer-desc">
            Career Diary (careerdiary.in) is India's most trusted portal for competitive exams, Indian Govt jobs recruitment updates, admit cards, answer keys, and syllabus notifications.
          </p>
          <div className="social-links">
            {/* Telegram */}
            <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="social-icon" title="Join Telegram Channel"
              style={{ background: '#0088cc' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.426 13.35l-2.94-.918c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.194 1.006.131.707.201z"/>
              </svg>
            </a>
            {/* WhatsApp */}
            <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="social-icon" title="Join WhatsApp Channel"
              style={{ background: '#25d366' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            {/* Website */}
            <a href="https://careerdiary.in" className="social-icon" title="Visit Website"
              style={{ background: 'transparent', padding: '0', borderRadius: '50%', overflow: 'hidden' }}>
              <img src="/image.png" alt="Website" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain', display: 'block' }} />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Categories</h4>
          <ul>
            <li><a href="/latest-jobs" onClick={(e) => handleLink(e, '/latest-jobs')}>Latest Jobs 2025-2026</a></li>
            <li><a href="/admit-card" onClick={(e) => handleLink(e, '/admit-card')}>Hall Ticket &amp; Admit Cards</a></li>
            <li><a href="/results" onClick={(e) => handleLink(e, '/results')}>Results &amp; Answer Key</a></li>
            <li><a href="/syllabus" onClick={(e) => handleLink(e, '/syllabus')}>Exam Pattern &amp; Syllabus</a></li>
            <li><a href="/admission" onClick={(e) => handleLink(e, '/admission')}>Admission Notifications</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Popular Exam Alerts</h4>
          <ul>
            <li><a href="/ssc" onClick={(e) => handleLink(e, '/ssc')}>SSC CGL / CHSL / MTS</a></li>
            <li><a href="/rrb" onClick={(e) => handleLink(e, '/rrb')}>RRB NTPC &amp; Group D</a></li>
            <li><a href="/bihar-police" onClick={(e) => handleLink(e, '/bihar-police')}>Bihar Police &amp; BSSC</a></li>
            <li><a href="/bpsc" onClick={(e) => handleLink(e, '/bpsc')}>BPSC TRE 4.0 &amp; 71st CCE</a></li>
            <li><a href="/bank" onClick={(e) => handleLink(e, '/bank')}>IBPS / SBI PO &amp; Clerk</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Subscribe Alerts</h4>
          <p>Get instant Job Alerts sent to your inbox!</p>
          <div className="subscribe-form">
            <input type="email" placeholder="Enter your email address..." />
            <button className="btn btn-primary" onClick={() => alert('Subscribe to our Telegram channel for instant alerts!')}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2025-2026 <strong>Career Diary Help</strong>. All Rights Reserved. Not affiliated with any official government organization.</p>
          <div className="footer-bottom-links">
            <a href="/privacy-policy" onClick={(e) => handleLink(e, '/privacy-policy')}>Privacy Policy</a> |&nbsp;
            <a href="/terms-conditions" onClick={(e) => handleLink(e, '/terms-conditions')}>Terms &amp; Conditions</a> |&nbsp;
            <a href="/contact-us" onClick={(e) => handleLink(e, '/contact-us')}>Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
