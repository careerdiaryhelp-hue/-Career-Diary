import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage({ onBack }) {
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      <div className="sr-detail-container">
        <h1 className="sr-main-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText style={{ color: '#ff0080' }} /> Terms & Conditions
        </h1>
        <div className="sr-post-date">Last Updated: September 2026</div>

        <p className="sr-short-info">
          Please read these Terms & Conditions carefully before using the <strong>Career Diary</strong> (careerdiary.in) website. By accessing or using our website, you agree to be bound by these terms.
        </p>

        <table className="sr-table">
          <tbody>
            <tr><td className="sr-table-subheading">1. Acceptance of Terms</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                By using this website, you confirm that you are at least 13 years old and agree to comply with and be legally bound by these Terms & Conditions. If you do not agree, please do not use our website.
              </p>
            </td></tr>

            <tr><td className="sr-table-subheading">2. Nature of Content & Disclaimer</td></tr>
            <tr><td>
              <ul className="sr-list">
                <li>⚫ Career Diary provides information about government job notifications, admit cards, results, and exam updates for <strong>informational purposes only</strong>.</li>
                <li>⚫ All information is sourced from official government portals, newspapers, and public sources.</li>
                <li>⚫ We are <strong>NOT affiliated</strong> with any government organization, recruitment board, or official authority.</li>
                <li>⚫ Candidates are advised to confirm all details from the official websites before taking any action.</li>
                <li>⚫ We are not responsible for any errors, omissions, or discrepancies in the information provided.</li>
              </ul>
            </td></tr>

            <tr><td className="sr-table-subheading">3. Intellectual Property</td></tr>
            <tr><td>
              <ul className="sr-list">
                <li>⚫ All content on this website, including text, graphics, and logos, is the property of Career Diary.</li>
                <li>⚫ You may not copy, reproduce, or distribute any content without our written permission.</li>
                <li>⚫ Linking to our website is permitted, but framing or scraping our content is not allowed.</li>
              </ul>
            </td></tr>

            <tr><td className="sr-table-subheading">4. Use of Website</td></tr>
            <tr><td>
              <ul className="sr-list">
                <li>⚫ You agree to use this website only for lawful purposes.</li>
                <li>⚫ You must not use this site to send spam, abuse, or conduct any fraudulent activity.</li>
                <li>⚫ We reserve the right to restrict or terminate access to users who violate these terms.</li>
              </ul>
            </td></tr>

            <tr><td className="sr-table-subheading">5. Third-Party Links</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                Our website contains links to official government portals and third-party websites. These links are provided for your convenience. We do not endorse or take responsibility for the content, privacy policies, or practices of any third-party websites.
              </p>
            </td></tr>

            <tr><td className="sr-table-subheading">6. Limitation of Liability</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                To the fullest extent permitted by law, Career Diary shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of or inability to use this website, or from any errors in the information provided.
              </p>
            </td></tr>

            <tr><td className="sr-table-subheading">7. Changes to Terms</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                We reserve the right to modify these Terms & Conditions at any time. Continued use of the website after changes are posted constitutes your acceptance of the revised terms.
              </p>
            </td></tr>

            <tr><td className="sr-table-subheading">8. Governing Law</td></tr>
            <tr><td>
              <p style={{ padding: '10px 15px' }}>
                These Terms & Conditions are governed by the laws of India. Any disputes arising from the use of this website shall be subject to the jurisdiction of courts in India.
              </p>
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
