'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { canServeAds, isLocalDev } from '../utils/adShield';

export default function ScrollPopupAd() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const insRef = useRef<HTMLModElement | null>(null);
  const hasTriggeredRef = useRef(false);

  // Trigger popup within 5 seconds when user scrolls (or 5s fallback on page read)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname && pathname.startsWith('/admin')) return;

    // Check if test parameter is present in URL (?popup=1 or ?test_ad=1)
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get('popup') === '1' || urlParams.get('test_ad') === '1';

    // 45-second cooldown after user dismisses, so re-tests or new page views work cleanly
    if (!isTestMode) {
      try {
        const closedAt = sessionStorage.getItem('careerdiary_scroll_popup_closed');
        if (closedAt) {
          const timeSince = Date.now() - parseInt(closedAt, 10);
          if (timeSince < 45000) {
            return;
          }
        }
      } catch (_) {}
    }

    hasTriggeredRef.current = false;
    let scrollTriggerTimer: NodeJS.Timeout | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;

    const triggerPopup = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;
      setIsOpen(true);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTriggerTimer) clearTimeout(scrollTriggerTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };

    if (isTestMode) {
      triggerPopup();
      return;
    }

    const handleScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop || 0;

      // When user scrolls down >= 100px, show promptly (within 400ms)
      if (scrolled >= 100) {
        if (!scrollTriggerTimer) {
          scrollTriggerTimer = setTimeout(() => {
            triggerPopup();
          }, 400);
        }
      } else if (scrolled >= 20) {
        // As soon as user starts scrolling (>20px), guarantee popup appears in 1.2s (well under 5s)
        if (!scrollTriggerTimer) {
          scrollTriggerTimer = setTimeout(() => {
            triggerPopup();
          }, 1200);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Fallback timer: guarantee popup shows within 5 seconds even if user scrolls very lightly
    fallbackTimer = setTimeout(() => {
      triggerPopup();
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTriggerTimer) clearTimeout(scrollTriggerTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  // Handle ESC key to close modal
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
      } catch (err) {
        console.warn('AdSense scroll popup push notice:', err);
      }
    }, 250);

    return () => {
      clearTimeout(pushTimer);
    };
  }, [isOpen]);

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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
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
            aria-label="Close advertisement"
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
                Slot: <span style={{ fontWeight: 700 }}>1202522135</span> (300x250)
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
              data-ad-slot="1202522135"
              data-full-width-responsive="false"
            />
          )}
        </div>
      </div>
    </div>
  );
}
