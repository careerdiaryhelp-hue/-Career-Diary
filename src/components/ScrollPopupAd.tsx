'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { canServeAds, isLocalDev } from '../utils/adShield';

export default function ScrollPopupAd() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const insRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  // Trigger popup when user scrolls down >= 250px or after 5s of reading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already closed by the user in this session
    try {
      if (sessionStorage.getItem('careerdiary_scroll_popup_closed') === 'true') {
        return;
      }
    } catch (_) {}

    const triggerPopup = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;
      setIsOpen(true);
      window.removeEventListener('scroll', handleScroll);
    };

    const handleScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrolled >= 250) {
        triggerPopup();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Fallback timer: also show after 6 seconds of engagement if user has not scrolled yet
    const fallbackTimer = setTimeout(() => {
      triggerPopup();
    }, 6000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  // Push AdSense ad unit as soon as popup is mounted and visible
  useEffect(() => {
    if (!isOpen || !insRef.current) return;
    if (typeof window === 'undefined' || !canServeAds()) return;

    const el = insRef.current;
    if (el.dataset.adPushDone) return;

    // Push after modal animation renders so offset dimensions are confirmed
    const pushTimer = setTimeout(() => {
      try {
        el.dataset.adPushDone = 'true';
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (_) {}
    }, 200);

    // If AdSense explicitly reports unfilled after auction, auto-close smoothly
    const observer = new MutationObserver(() => {
      if (el.getAttribute('data-ad-status') === 'unfilled') {
        setTimeout(() => {
          if (el.getAttribute('data-ad-status') === 'unfilled') {
            setIsOpen(false);
          }
        }, 3000);
      }
    });

    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });

    return () => {
      clearTimeout(pushTimer);
      observer.disconnect();
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('careerdiary_scroll_popup_closed', 'true');
    } catch (_) {}
  };

  // Disabled on admin pages or if not opened
  if (!isOpen || (pathname && pathname.startsWith('/admin'))) {
    return null;
  }

  const isLocal = isLocalDev();

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
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '340px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
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
            Advertisement
          </span>
          <button
            onClick={handleClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#334155',
              fontWeight: 700,
              fontSize: '12px',
            }}
            aria-label="Close"
          >
            <X size={15} /> Close
          </button>
        </div>

        {/* Ad Unit Container */}
        <div
          style={{
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '260px',
            backgroundColor: '#ffffff',
          }}
        >
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
                Slot: <span style={{ fontWeight: 700 }}>7544533819</span> (300x250)
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                Live AdSense ad serves on careerdiary.in
              </div>
            </div>
          ) : (
            <ins
              ref={insRef}
              className="adsbygoogle"
              style={{
                display: 'inline-block',
                width: '300px',
                height: '250px',
              }}
              data-ad-client="ca-pub-2108299943580613"
              data-ad-slot="7544533819"
              data-ad-format="rectangle"
              data-full-width-responsive="false"
            />
          )}
        </div>
      </div>
    </div>
  );
}
