'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Send, MessageCircle } from 'lucide-react';
import { canServeAds, isLocalDev } from '../utils/adShield';

export default function ScrollPopupAd() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adUnfilled, setAdUnfilled] = useState(false);
  const insRef = useRef<HTMLModElement | null>(null);
  const hasTriggeredRef = useRef(false);
  const isLocal = isLocalDev();

  // Trigger popup when user scrolls (or 4.5s fallback)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname && pathname.startsWith('/admin')) return;

    // Check test parameters (?popup=1 or ?test_ad=1)
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get('popup') === '1' || urlParams.get('test_ad') === '1';

    // Cooldown only if explicitly dismissed by user
    if (!isTestMode) {
      try {
        const closedAt = sessionStorage.getItem('careerdiary_scroll_popup_closed');
        if (closedAt) {
          const timeSince = Date.now() - parseInt(closedAt, 10);
          if (timeSince < 30000) {
            return;
          }
        }
      } catch (_) {}
    }

    hasTriggeredRef.current = false;
    let scrollTimer: NodeJS.Timeout | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;

    const triggerPopup = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;
      setIsOpen(true);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };

    if (isTestMode) {
      triggerPopup();
      return;
    }

    const handleScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop || 0;

      // User scrolled down >= 80px, open promptly
      if (scrolled >= 80) {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          triggerPopup();
        }, 300);
      } else if (scrolled >= 20) {
        if (!scrollTimer) {
          scrollTimer = setTimeout(() => {
            triggerPopup();
          }, 1000);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Fallback timer: ensure it opens within 4.5s
    fallbackTimer = setTimeout(() => {
      triggerPopup();
    }, 4500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle AdSense ad loading & status detection
  useEffect(() => {
    if (!isOpen) return;

    if (isLocal) {
      setAdLoaded(true);
      return;
    }

    if (typeof window === 'undefined' || !canServeAds()) return;

    const el = insRef.current;
    if (!el) return;

    let isDisposed = false;

    const checkFilled = () => {
      if (!el) return false;
      const status = el.getAttribute('data-ad-status');
      if (status === 'filled') return true;
      const iframe = el.querySelector('iframe');
      if (iframe && status !== 'unfilled') {
        return true;
      }
      return false;
    };

    // MutationObserver to watch Google AdSense filling or unfilled status
    const observer = new MutationObserver(() => {
      if (isDisposed) return;
      const status = el.getAttribute('data-ad-status');
      if (status === 'filled' || checkFilled()) {
        setAdLoaded(true);
        setAdUnfilled(false);
      } else if (status === 'unfilled') {
        setAdUnfilled(true);
      }
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'],
      childList: true,
      subtree: true,
    });

    // Push ad to AdSense
    const pushTimer = setTimeout(() => {
      if (isDisposed) return;
      try {
        if (!el.dataset.adPushDone) {
          el.dataset.adPushDone = 'true';
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.warn('AdSense scroll popup push notice:', err);
      }
    }, 150);

    // Polling verification
    const pollInterval = setInterval(() => {
      if (isDisposed) {
        clearInterval(pollInterval);
        return;
      }
      if (checkFilled()) {
        setAdLoaded(true);
        setAdUnfilled(false);
        clearInterval(pollInterval);
      } else if (el.getAttribute('data-ad-status') === 'unfilled') {
        setAdUnfilled(true);
        clearInterval(pollInterval);
      }
    }, 250);

    // If Google has no fill within 3.5s, switch cleanly to community banner (never blank)
    const fallbackTimeout = setTimeout(() => {
      if (isDisposed) return;
      clearInterval(pollInterval);
      if (!checkFilled()) {
        setAdUnfilled(true);
      }
    }, 3500);

    return () => {
      isDisposed = true;
      clearTimeout(pushTimer);
      clearTimeout(fallbackTimeout);
      clearInterval(pollInterval);
      observer.disconnect();
    };
  }, [isOpen, isLocal]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('careerdiary_scroll_popup_closed', Date.now().toString());
    } catch (_) {}
  };

  // Disabled on admin pages or if not opened
  if (!isOpen || (pathname && pathname.startsWith('/admin'))) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.25s ease-out forwards',
      }}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '340px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'slideUpFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#64748b',
            }}
          >
            {adUnfilled ? 'Special Update' : 'Advertisement'}
          </span>
          <button
            onClick={handleClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              padding: '5px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#334155',
              fontWeight: 700,
              fontSize: '12px',
              transition: 'background 0.2s',
            }}
            aria-label="Close"
          >
            <X size={15} /> Close
          </button>
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '260px',
            backgroundColor: '#ffffff',
            position: 'relative',
          }}
        >
          {/* 1. Local Dev Preview */}
          {isLocal ? (
            <div
              style={{
                width: '300px',
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #93c5fd',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                textAlign: 'center',
                padding: '16px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                Scroll Popup Ad (Preview)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Slot: <span style={{ fontWeight: 700 }}>1202522135</span> (300x250)
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                Live AdSense ad serves on careerdiary.in
              </div>
            </div>
          ) : adUnfilled ? (
            /* 2. Unfilled Fallback: Career Diary Official Updates Banner (Never a blank box!) */
            <div
              style={{
                width: '300px',
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
                borderRadius: '12px',
                padding: '18px 16px',
                boxSizing: 'border-box',
                color: '#ffffff',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#93c5fd',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                📢 Official Channel
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '6px' }}>
                सरकारी नौकरी &amp; रिजल्ट अपडेट
              </div>
              <p style={{ fontSize: '0.76rem', opacity: 0.9, lineHeight: 1.4, margin: '0 0 14px 0' }}>
                लेटेस्ट जॉब्स, एडमिट कार्ड और आंसर-की की सबसे तेज़ जानकारी सीधे अपने फोन पर पाएँ।
              </p>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <a
                  href="https://whatsapp.com/channel/0029Va4bvoj6rsQxfA1Pzx2u"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: '9px 10px',
                    backgroundColor: '#22c55e',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
                <a
                  href="https://t.me/careerdiary"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: '9px 10px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <Send size={15} /> Telegram
                </a>
              </div>
            </div>
          ) : (
            /* 3. Live Google AdSense Display */
            <>
              {/* Loading Placeholder until ad paints */}
              {!adLoaded && (
                <div
                  style={{
                    position: 'absolute',
                    width: '300px',
                    height: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    zIndex: 1,
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      border: '3px solid #e2e8f0',
                      borderTopColor: '#2563eb',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    Loading advertisement...
                  </span>
                </div>
              )}

              <ins
                ref={insRef}
                className="adsbygoogle"
                style={{
                  display: 'inline-block',
                  width: '300px',
                  height: '250px',
                  position: 'relative',
                  zIndex: 2,
                }}
                data-ad-client="ca-pub-2108299943580613"
                data-ad-slot="1202522135"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
