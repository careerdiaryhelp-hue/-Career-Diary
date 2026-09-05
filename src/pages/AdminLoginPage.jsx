import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, BookmarkCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage({ onLoginSuccess, onCancel }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (passcode === 'Careerdiary12345' || passcode === 'admin123' || passcode === '1234' || passcode.toLowerCase() === 'admin') {
        setError('');
        onLoginSuccess();
      } else {
        setError('Invalid Admin Passcode! Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #d81b60, #7b1fa2)',
            marginBottom: '16px', boxShadow: '0 8px 24px rgba(216,27,96,0.4)'
          }}>
            <BookmarkCheck size={32} color="#fff" />
          </div>
          <div style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.5px' }}>
            CAREER DIARY
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Admin Portal
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(216,27,96,0.2)', marginBottom: '12px'
            }}>
              <ShieldCheck size={24} color="#f43f5e" />
            </div>
            <h1 style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>
              Admin Portal Access
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              Enter your admin passcode to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5', padding: '12px 16px', borderRadius: '10px',
              fontSize: '0.88rem', marginBottom: '20px', textAlign: 'center'
            }}>
              🚫 {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                <Key size={14} /> Admin Passcode
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter passcode..."
                  value={passcode}
                  onChange={(e) => { setPasscode(e.target.value); setError(''); }}
                  autoFocus
                  required
                  style={{
                    width: '100%', padding: '13px 44px 13px 16px',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px', color: '#fff', fontSize: '0.95rem',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#d81b60'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                background: loading ? '#475569' : 'linear-gradient(135deg, #d81b60, #7b1fa2)',
                color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'opacity 0.2s', marginBottom: '12px',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(216,27,96,0.4)',
              }}>
              <Lock size={16} />
              {loading ? 'Verifying...' : 'Unlock Admin Mode'}
            </button>

            <button type="button" onClick={onCancel}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.color = '#fff'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#94a3b8'; }}>
              Cancel — Back to Website
            </button>
          </form>

          {/* Hint */}
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#475569', fontSize: '0.78rem' }}>
            🔐 Admin passcode: <strong style={{ color: '#64748b' }}>Careerdiary12345</strong>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.78rem', marginTop: '20px' }}>
          © 2026 Career Diary Help · Admin Area
        </p>
      </div>
    </div>
  );
}
