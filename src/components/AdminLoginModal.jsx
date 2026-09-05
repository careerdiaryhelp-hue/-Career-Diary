import React, { useState } from 'react';
import { X, Lock, Key, ShieldCheck } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Admin passcode: Careerdiary12345
    if (passcode === 'Careerdiary12345' || passcode === 'admin123' || passcode === '1234' || passcode.toLowerCase() === 'admin') {
      setError('');
      onLoginSuccess();
      setPasscode('');
      onClose();
    } else {
      setError('Invalid Admin Passcode!');
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="modal-header-styled">
          <ShieldCheck className="w-8 h-8 text-primary" style={{ margin: '0 auto 8px', color: 'var(--primary-color)' }} />
          <h3>Admin Portal Access</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter admin passcode to unlock Post Job Update features</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div style={{ background: 'rgba(230, 0, 92, 0.1)', color: 'var(--primary-color)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px', border: '1px solid var(--primary-color)' }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key className="w-4 h-4" /> Admin Passcode
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter passcode (e.g. admin123)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoFocus
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Default Passcode: <strong>admin123</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary btn-block">
              <Lock className="w-4 h-4 inline mr-1" /> Unlock Admin Mode
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
