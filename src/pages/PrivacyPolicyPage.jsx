import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicyPage({ onBack }) {
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      <div className="sr-detail-container">
        <h1 className="sr-main-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield style={{ color: '#ff0080' }} /> Privacy Policy
        </h1>
        <div className="sr-post-date">Last Updated: September 2026</div>

        <p className="sr-short-info">
          Welcome to <strong>Career Diary</strong> (careerdiary.in). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you visit our website.
        </p>

        <table className="sr-table">
          <tbody>
            <tr><td className="sr-table-subheading">1. Information We Collect</td></tr>
            <tr><td>
              <ul className="sr-list">
                <li>⚫ <strong>Log Data:</strong> We automatically collect information your browser sends whenever you visit our website (IP address, browser type, pages visited, time and date of visit).</li>
                <li>⚫ <strong>Cookies:</strong> We use cookies to improve your experience. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</li>
                <li>⚫ <strong>Google Analytics:</strong> We use Google Analytics to analyze site traffic. Google may use this data in accordance with its own privacy policy.</li>
                <li>⚫ <strong>Google AdSense:</strong> We use Google AdSense to display ads. Google uses cookies to serve ads based on your prior visits to our website or other websites.</li>
              </ul>
            </td></tr>

            <tr><td className="sr-table-subheading">2. How We Use Your Information</td></tr>
            <tr><td>
              <ul className="sr-list">
                <li>⚫ To improve our website content and user experience.</li>
                <li>⚫ To understand how visitors interact with our pages.</li>
                <li>⚫ To display relevant advertisements via Google AdSense.</li>
                <li>⚫ We do <strong>not</strong> sell, trade, or share your personal information with third parties.</li>
              </ul>
            </td></tr>

            <tr><td className="sr-table-subheading">3. Third-Party Links</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                Our website may contain links to third-party websites (e.g., official government recruitment portals). We are not responsible for the privacy practices of those sites. We encourage you to read their privacy policies before submitting any personal information.
              </p>
            </td></tr>

            <tr><td className="sr-table-subheading">4. Google AdSense & Advertising</td></tr>
            <tr><td>
              <ul className="sr-list">
                <li>⚫ Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this or other websites.</li>
                <li>⚫ You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#0000ff' }}>Google Ads Settings</a>.</li>
                <li>⚫ We comply with Google's Publisher Policies and AdSense Program Policies.</li>
              </ul>
            </td></tr>

            <tr><td className="sr-table-subheading">5. Data Security</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                We value your trust and take commercially reasonable steps to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </td></tr>

            <tr><td className="sr-table-subheading">6. Children's Privacy</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                Our website does not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </td></tr>

            <tr><td className="sr-table-subheading">7. Changes to This Policy</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. Changes are effective immediately after they are posted.
              </p>
            </td></tr>

            <tr><td className="sr-table-subheading">8. Contact Us</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                If you have any questions about this Privacy Policy, please contact us at:<br />
                📧 <strong>Email:</strong> careerdiaryhelp@gmail.com<br />
                🌐 <strong>Website:</strong> https://careerdiary.in
              </p>
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
