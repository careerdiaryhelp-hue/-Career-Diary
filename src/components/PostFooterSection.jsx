import React from 'react';
import { InPostAd, MultiplexAd } from './AdSenseBanner';
import AutoFAQSection from './AutoFAQSection';

// Clean, high quality SVG brand icons for exact visual match
const TelegramIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0088cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const WhatsappIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e1306c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const XTwitterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0f172a">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877f2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function PostFooterSection({ job, category = 'job' }) {
  if (!job) return null;

  return (
    <div className="post-footer-master-container" style={{ marginTop: '30px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Legal Disclaimer */}
      <div style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#334155', marginBottom: '20px', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
        <strong style={{ color: '#dc2626' }}>Disclaimer:</strong> Information regarding any exam form , latest jobs,results/marks,Admit Card,Admission ,answer key are published on this website are provided just for the immediate information of the examinees and should not be considered as a legal document. While every effort has been made by Career Diary team to ensure the accuracy of the information provided which includes official links, we are not responsible for any inadvertent errors that may appear in the examination results/marks, answer key or time table/admission dates. Additionally, we disclaim any liability for any loss or damage caused by any shortcomings, defects, or inaccuracies in the information available on this website. In case of any correction is needed feel free to contact us through contact us page.
      </div>

      {/* 2. Join Us On Social Media Platforms (Pink Header 6-Grid Box) */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', backgroundColor: '#ffffff' }}>
        <div style={{ backgroundColor: '#e91e63', color: '#ffffff', textAlign: 'center', fontWeight: '700', fontSize: '1.15rem', padding: '12px 16px', letterSpacing: '0.5px' }}>
          Join Us On Social Media Platforms
        </div>

        {/* 6 Grid Table (2 Rows x 3 Cols) */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <tbody>
            <tr>
              <td style={{ width: '33.33%', border: '1px solid #e2e8f0', padding: '16px 8px' }}>
                <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#0088cc', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TelegramIcon />
                  </div>
                  Telegram Channel
                </a>
              </td>
              <td style={{ width: '33.33%', border: '1px solid #e2e8f0', padding: '16px 8px' }}>
                <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#25d366', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WhatsappIcon />
                  </div>
                  Whatsapp Channel
                </a>
              </td>
              <td style={{ width: '33.33%', border: '1px solid #e2e8f0', padding: '16px 8px' }}>
                <a href="https://instagram.com/careerdiary" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#e1306c', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InstagramIcon />
                  </div>
                  Instagram Page
                </a>
              </td>
            </tr>
            <tr>
              <td style={{ width: '33.33%', border: '1px solid #e2e8f0', padding: '16px 8px' }}>
                <a href="https://x.com/careerdiary" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <XTwitterIcon />
                  </div>
                  X (Twitter)
                </a>
              </td>
              <td style={{ width: '33.33%', border: '1px solid #e2e8f0', padding: '16px 8px' }}>
                <a href="https://facebook.com/careerdiary" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1877f2', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FacebookIcon />
                  </div>
                  Facebook page
                </a>
              </td>
              <td style={{ width: '33.33%', border: '1px solid #e2e8f0', padding: '16px 8px' }}>
                <a href="https://youtube.com/@careerdiary" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#ff0000', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <YoutubeIcon />
                  </div>
                  YouTube
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. Motivation & Self Study Guidelines */}
        <div style={{ padding: '16px', fontSize: '0.92rem', lineHeight: '1.8', color: '#1e293b', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span>👉 <strong>Go to home</strong> ..................................................................................</span>
            <a href="https://www.careerdiary.in" style={{ color: '#1d4ed8', fontWeight: '700' }}>👉 www.careerdiary.in</a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span>👉 <strong>Join telegram channel</strong>........................................................</span>
            <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', fontWeight: '700' }}>👉 Join now</a>
          </div>
          <div style={{ marginBottom: '8px' }}>
            👉 दोस्तों आप हमें ( <strong>Career Diary</strong>) को <a href="https://facebook.com/careerdiary" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', fontWeight: '700' }}>Facebook पर Follow</a> कर सकते है ! दोस्तों अगर आपको यह पोस्ट अच्छी लगी हो तो इस Facebook पर Share अवश्य करें ! कृपया कमेंट के माध्यम से बताऐं के ये पोस्ट आपको कैसी लगी आपके सुझावों का भी स्वागत रहेगा Thanks!
          </div>
          <div style={{ marginBottom: '8px' }}>
            👉 दोस्तों कोचिंग संस्थान के बिना अपने दम पर Self Studies करें और महत्वपूर्ण पुस्तकों का अध्ययन करें ।
          </div>
          <div>
            👉 किसी भी परीक्षा से संबंधित practice set प्राप्त करने के लिए............ <a href="https://careerdiary.in/" style={{ color: '#1d4ed8', fontWeight: '700' }}>Click Here</a>
          </div>
        </div>
      </div>

      {/* Decorative Emojis */}
      <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '1rem', letterSpacing: '2px', userSelect: 'none' }}>
        🍀🍀🍀 🍀🍀🍀🍀🍀🍀🍀 धन्यवाद 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀<br />
        ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
      </div>

      {/* 4. Join Our Channel Table (2 Rows) */}
      <table className="sr-table" style={{ margin: '16px 0', width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
        <tbody>
          <tr>
            <td style={{ fontWeight: 'bold', color: '#0088cc', width: '65%', padding: '12px 16px', borderBottom: '1px solid #cbd5e1' }}>
              Join Our Telegram Channel
            </td>
            <td style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #cbd5e1' }}>
              <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#0088cc', color: '#fff', fontWeight: 'bold', padding: '6px 16px', borderRadius: '4px', textDecoration: 'none' }}>
                Follow Now
              </a>
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold', color: '#25d366', padding: '12px 16px' }}>
              Join Our WhatsApp Channel
            </td>
            <td style={{ textAlign: 'center', padding: '12px 16px' }}>
              <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ backgroundColor: '#25d366', color: '#fff', fontWeight: 'bold', padding: '6px 16px', borderRadius: '4px', textDecoration: 'none' }}>
                Follow Now
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 5. InPost / InArticle Ad Banner */}
      <InPostAd label="ADVERTISEMENT" style={{ margin: '20px 0' }} />

      {/* 6. Dynamic FAQ Section */}
      <AutoFAQSection job={job} category={category} />

      {/* 7. Bottom Multiplex Ad */}
      <MultiplexAd label="RECOMMENDED FOR YOU" style={{ margin: '20px 0' }} />

    </div>
  );
}
