'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { canServeAds, isLocalDev } from '../utils/adShield';

export default function ScrollPopupAd() {
  const pathname = usePathname();
  const [isTriggered, setIsTriggered] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [adKey, setAdKey] = useState(0);
  const insRef = useRef<HTMLModElement | null>(null);
  const hasTriggeredRef = useRef(false);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const isLocal = isLocalDev();

  // Cleanup pending retry timers on unmount or route change
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [pathname]);

  // Trigger popup loading when user scrolls (or 5s fallback on page read)
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
      setIsTriggered(true);
      setIsAdLoaded(false);
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

      // When user scrolls down >= 100px, start loading promptly (within 400ms)
      if (scrolled >= 100) {
        if (!scrollTriggerTimer) {
          scrollTriggerTimer = setTimeout(() => {
            triggerPopup();
          }, 400);
        }
      } else if (scrolled >= 20) {
        // As soon as user starts scrolling (>20px), start loading in 1.2s
        if (!scrollTriggerTimer) {
          scrollTriggerTimer = setTimeout(() => {
            triggerPopup();
          }, 1200);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Fallback timer: start loading within 5s even if user scrolls very lightly
    fallbackTimer = setTimeout(() => {
      triggerPopup();
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTriggerTimer) clearTimeout(scrollTriggerTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  // Handle ESC key to close modal when it is visible
  useEffect(() => {
    if (!isAdLoaded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdLoaded]);

  // Ad loading and verification:
  // The popup modal stays 100% invisible (opacity: 0, pointer-events: none)
  // until the ad is confirmed filled with an actual creative/iframe!
  useEffect(() => {
    if (!isTriggered) return;

    if (isLocal) {
      // In local dev, display preview after short delay
      const t = setTimeout(() => {
        setIsAdLoaded(true);
      }, 200);
      return () => clearTimeout(t);
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

    const handleUnfilledRetry = () => {
      if (isDisposed) return;
      setIsAdLoaded(false);
      // Popup remains completely invisible to user (no empty white box shown)
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        retryTimerRef.current = setTimeout(() => {
          if (!isDisposed) {
            setAdKey((prev) => prev + 1);
          }
        }, 3000); // Retry loading in background
      } else {
        // Max retries reached, silently unmount without ever showing empty box
        setIsTriggered(false);
      }
    };

    let safetyTimer: NodeJS.Timeout | null = null;

    // Observe data-ad-status and child iframe injection
    const observer = new MutationObserver(() => {
      if (isDisposed) return;
      const status = el.getAttribute('data-ad-status');
      if (status === 'filled') {
        setIsAdLoaded(true);
        retryCountRef.current = 0;
        if (safetyTimer) clearTimeout(safetyTimer);
      } else if (status === 'unfilled') {
        handleUnfilledRetry();
      } else if (checkFilled()) {
        setIsAdLoaded(true);
        retryCountRef.current = 0;
        if (safetyTimer) clearTimeout(safetyTimer);
      }
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
      childList: true,
      subtree: true,
    });

    // Also poll every 250ms for up to 5s in case mutation is not caught
    const pollTimer = setInterval(() => {
      if (isDisposed) {
        clearInterval(pollTimer);
        return;
      }
      const status = el.getAttribute('data-ad-status');
      if (status === 'filled' || checkFilled()) {
        setIsAdLoaded(true);
        retryCountRef.current = 0;
        clearInterval(pollTimer);
        if (safetyTimer) clearTimeout(safetyTimer);
      } else if (status === 'unfilled') {
        clearInterval(pollTimer);
        handleUnfilledRetry();
      }
    }, 250);

    // Push to AdSense queue
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
    }, 100);

    // Safety fallback: if Google fails to respond within 5s, quietly cancel (never show blank box)
    safetyTimer = setTimeout(() => {
      if (isDisposed) return;
      clearInterval(pollTimer);
      if (!checkFilled()) {
        handleUnfilledRetry();
      }
    }, 5000);

    return () => {
      isDisposed = true;
      clearTimeout(pushTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
      clearInterval(pollTimer);
      observer.disconnect();
    };
  }, [isTriggered, adKey, isLocal]);

  const handleClose = () => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryCountRef.current = MAX_RETRIES;
    setIsAdLoaded(false);
    setIsTriggered(false);
    try {
      sessionStorage.setItem('careerdiary_scroll_popup_closed', Date.now().toString());
    } catch (_) {}
  };

  // Disabled on admin pages or if trigger not active
  if (!isTriggered || (pathname && pathname.startsWith('/admin'))) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: isAdLoaded ? 999999 : -1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: isAdLoaded ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
        backdropFilter: isAdLoaded ? 'blur(3px)' : 'none',
        WebkitBackdropFilter: isAdLoaded ? 'blur(3px)' : 'none',
        opacity: isAdLoaded ? 1 : 0,
        pointerEvents: isAdLoaded ? 'auto' : 'none',
        transition: 'opacity 0.25s ease, background-color 0.25s ease',
      }}
      onClick={handleClose}
      aria-modal={isAdLoaded ? 'true' : 'false'}
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
          boxShadow: isAdLoaded ? '0 25px 50px -12px rgba(0, 0, 0, 0.45)' : 'none',
          border: isAdLoaded ? '1px solid #e2e8f0' : 'none',
          overflow: 'hidden',
          animation: isAdLoaded ? 'slideUpFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
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
              key={adKey}
              ref={insRef}
              className="adsbygoogle"
              style={{
                display: 'inline-block',
                width: '300px',
                height: '250px',
              }}
              data-ad-client="ca-pub-2108299943580613"
              data-ad-slot="1202522135"
            />
          )}
        </div>
      </div>
    </div>
  );
}
