import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageCircle, Share2 } from 'lucide-react';

export default function ContactUsPage({ onBack }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Open mailto link as fallback
    const mailtoLink = `mailto:careerdiaryhelp@gmail.com?subject=${encodeURIComponent(formData.subject || 'Contact Us - Career Diary')}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    window.open(mailtoLink);
    setSubmitted(true);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={onBack} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      <div className="sr-detail-container">
        <h1 className="sr-main-title">Contact Us</h1>
        <div className="sr-post-date">We typically reply within 24-48 hours</div>
        <p className="sr-short-info">
          Have questions, suggestions, or found an error in our data? Feel free to reach out to the <strong>Career Diary</strong> team. We'd love to hear from you!
        </p>

        {/* Contact Info Table */}
        <table className="sr-table" style={{ marginBottom: '24px' }}>
          <tbody>
            <tr>
              <td className="sr-table-subheading" colSpan={2}>Get In Touch</td>
            </tr>
            <tr>
              <td style={{ width: '50%', verticalAlign: 'top' }}>
                <ul className="sr-list">
                  <li>
                    <Mail style={{ display: 'inline', marginRight: '6px', color: '#ff0080' }} size={16} />
                    <strong>Email:</strong><br />
                    <a href="mailto:careerdiaryhelp@gmail.com" style={{ color: '#0000ff' }}>careerdiaryhelp@gmail.com</a>
                  </li>
                  <li>
                    <MapPin style={{ display: 'inline', marginRight: '6px', color: '#ff0080' }} size={16} />
                    <strong>Location:</strong><br />
                    Bihar, India
                  </li>
                </ul>
              </td>
              <td style={{ verticalAlign: 'top' }}>
                <ul className="sr-list">
                  <li>
                    <Send style={{ display: 'inline', marginRight: '6px', color: '#0088cc' }} size={16} />
                    <strong>Telegram Channel:</strong><br />
                    <a href="https://t.me/careerdiary" target="_blank" rel="noopener noreferrer" style={{ color: '#0000ff' }}>t.me/careerdiary</a>
                  </li>
                  <li>
                    <MessageCircle style={{ display: 'inline', marginRight: '6px', color: '#25d366' }} size={16} />
                    <strong>WhatsApp Channel:</strong><br />
                    <a href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u" target="_blank" rel="noopener noreferrer" style={{ color: '#0000ff' }}>Join WhatsApp</a>
                  </li>
                  <li>
                    <Share2 style={{ display: 'inline', marginRight: '6px', color: '#1877f2' }} size={16} />
                    <strong>Facebook Page:</strong><br />
                    <a href="https://www.facebook.com/Careerdiary1?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" style={{ color: '#0000ff' }}>facebook.com/Careerdiary1</a>
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Contact Form */}
        <table className="sr-table">
          <tbody>
            <tr>
              <td className="sr-table-heading">Send Us a Message</td>
            </tr>
            <tr>
              <td>
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#008000' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
                    <strong style={{ fontSize: '1.2rem' }}>Message Sent Successfully!</strong>
                    <p style={{ marginTop: '10px', color: '#555' }}>Your email client has been opened. We'll reply to you within 24–48 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="btn btn-outline btn-sm" style={{ marginTop: '16px' }}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
                    <div className="form-row" style={{ marginBottom: '14px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Your Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Subject *</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. Error in Result Data, Content Suggestion..."
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Your Message *</label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Write your message here..."
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <button type="submit" className="btn btn-primary" style={{ minWidth: '160px' }}>
                        <Send className="w-4 h-4 inline mr-2" /> Send Message
                      </button>
                    </div>
                  </form>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Note */}
        <div style={{ backgroundColor: '#fffde7', border: '1px solid #f9a825', padding: '12px 16px', borderRadius: '6px', marginTop: '10px', fontSize: '0.9rem' }}>
          📌 <strong>Note:</strong> Career Diary is an independent educational portal. We are not affiliated with any government body. For official information, always visit the respective recruitment board's official website.
        </div>
      </div>
    </div>
  );
}
