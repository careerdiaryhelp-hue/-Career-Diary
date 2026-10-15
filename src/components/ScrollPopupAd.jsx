'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import DirectAdSense from './DirectAdSense';
import { X } from 'lucide-react';

export default function ScrollPopupAd() {
  const pathname = usePathname();
  const [scrollReady, setScrollReady] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [closed, setClosed] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Step 1: Detect user scroll (30% down the page or 350px)
  useEffect(() => {

    // Check cooldown: Don't show more than once every 15 seconds per session
    if (typeof window !== 'undefined') {
      const lastShown = sessionStorage.getItem('scroll_ad_last_shown');
      if (lastShown) {
        const diff = Date.now() - parseInt(lastShown, 10);
        if (diff < 15000) {
          setClosed(true);
          return;
        }
      }
    }

    const handleScroll = () => {
      if (hasTriggeredRef.current || closed) return;

      const scrolled = window.scrollY || document.documentElement.scrollTop;
      const total =
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) -
        window.innerHeight;

      const pct = total > 0 ? (scrolled / total) * 100 : 0;

      // Trigger when user scrolls at least 30% of page or 350px
      if (pct >= 30 || scrolled >= 350) {
        hasTriggeredRef.current = true;
        setScrollReady(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [closed, pathname]);

  const handleClose = () => {
    setClosed(true);
    setScrollReady(false);
    setAdLoaded(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scroll_ad_last_shown', Date.now().toString());
    }
  };

  // Strictly disabled in app mode, or before scroll trigger, or once closed, or on admin pages
  if (closed || !scrollReady || (pathname && pathname.startsWith('/admin'))) return null;

  return (
    <>
      {/* 
        Container stays invisible until the ad creative is CONFIRMED loaded.
        MUST stay in viewport for AdSense to fetch it!
      */}
      <div
        className={
          adLoaded
            ? 'fixed inset-0 z-[99999] flex items-center justify-center p-4'
            : 'fixed inset-0 z-[-1] flex items-center justify-center p-4 opacity-0 pointer-events-none'
        }
      >
        {adLoaded && (
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300"
            onClick={handleClose}
            aria-hidden="true"
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 99998 }}
          />
        )}

        <div
          className={`relative z-10 w-full max-w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
            adLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            position: 'relative',
            zIndex: 99999,
            width: '100%',
            maxWidth: '340px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            margin: 'auto',
            animation: adLoaded ? 'slideUpFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
          }}
        >
          {/* Header with Title and Accessible Close Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
              Advertisement
            </span>
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
              aria-label="Close advertisement"
              title="Close Ad"
            >
              <X size={18} />
            </button>
          </div>

          {/* Ad Creative Unit (300x250 Rectangle) */}
          <div
            style={{
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '250px',
              backgroundColor: '#ffffff',
            }}
          >
            <DirectAdSense
              adSlot="1202822135"
              adId="div-gpt-ad-scroll-popup"
              minWidth="300px"
              minHeight="250px"
              adFormat="rectangle"
              priority={true}
              lazy={false}
              showLabel={false}
              className="!my-0 !p-0"
              onAdStatusChange={(status) => {
                if (status === 'filled') {
                  setAdLoaded(true);
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('scroll_ad_last_shown', Date.now().toString());
                  }
                } else if (status === 'unfilled') {
                  handleClose();
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
