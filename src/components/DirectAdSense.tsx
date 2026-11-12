'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { canServeAds, isLocalDev } from '../utils/adShield';

// AdSense Global Switch
const GLOBAL_DISABLE_ADSENSE = false;
const ADSENSE_CLIENT_ID = 'ca-pub-2108299943580613';

export default function DirectAdSense({
  adSlot = '1202522135',
  adId,
  width = '100%',
  minWidth = '100%',
  minHeight = '100px',
  height,
  showLabel = true,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  fullWidthResponsive = true,
  className = '',
  priority = false,
  lazy = true,
  compact = false,
  onAdStatusChange,
}: any) {
  const pathname = usePathname();
  const insRef = useRef<HTMLModElement | null>(null);
  const pushAttempted = useRef(false);
  const onAdStatusChangeRef = useRef(onAdStatusChange);
  useEffect(() => {
    onAdStatusChangeRef.current = onAdStatusChange;
  }, [onAdStatusChange]);
  const activeSlot = adSlot || '1202522135';
  const [isAdSafe, setIsAdSafe] = useState(true);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [adStatus, setAdStatus] = useState('loading');

  useEffect(() => {
    setIsAdSafe(canServeAds());
  }, []);

  useEffect(() => {
    if (isLocalDev()) {
      setIsLocalhost(true);
      setAdStatus('filled');
      onAdStatusChangeRef.current?.('filled');
    }
  }, []);

  const elementKey = `${pathname || ''}-${activeSlot}-${adId || ''}-${adFormat}`;

  const pushAd = useCallback(() => {
    if (pushAttempted.current) return;
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) return;

    pushAttempted.current = true;

    setTimeout(() => {
      if (!insRef.current) return;

      if (
        insRef.current.getAttribute('data-ad-status') ||
        insRef.current.getAttribute('data-adsbygoogle-status')
      ) {
        return;
      }

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        if (!e?.message?.includes('already have ads')) {
          console.warn('AdSense push warning:', e);
        }
      }
    }, 150);
  }, []);

  // Monitor status of ad filling — only confirm filled when AdSense sets data-ad-status="filled" and creative has real height
  useEffect(() => {
    if (isLocalhost) return;
    const currentIns = insRef.current;
    if (!currentIns) return;

    let cancelled = false;

    const checkStatus = () => {
      if (cancelled) return;
      const status = currentIns.getAttribute('data-ad-status');
      const iframe = currentIns.querySelector('iframe') as HTMLIFrameElement | null;
      const insRect = currentIns.getBoundingClientRect();
      const iframeRect = iframe ? iframe.getBoundingClientRect() : null;
      const iframeStyle = iframe ? window.getComputedStyle(iframe) : null;
      const hasVisibleAd =
        status === 'filled' &&
        Boolean(iframe) &&
        Boolean(iframeStyle) &&
        iframeStyle!.display !== 'none' &&
        iframeStyle!.visibility !== 'hidden' &&
        Boolean(iframeRect) &&
        iframeRect!.height >= 50 &&
        iframeRect!.width >= 150 &&
        insRect.height >= 50;

      if (status === 'unfilled') {
        setAdStatus('unfilled');
        onAdStatusChangeRef.current?.('unfilled');
        return;
      }

      if (hasVisibleAd) {
        setAdStatus('filled');
        onAdStatusChangeRef.current?.('filled');
      } else {
        setAdStatus((prev) => (prev === 'filled' ? 'loading' : prev));
      }
    };

    const initialCheckTimer = setTimeout(() => {
      if (!cancelled) checkStatus();
    }, 300);

    const observer = new MutationObserver(() => {
      checkStatus();
    });

    observer.observe(currentIns, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'style', 'class'],
      childList: true,
      subtree: true,
    });

    const poll = setInterval(() => {
      checkStatus();
    }, 400);

    const safetyTimer = setTimeout(() => {
      if (cancelled) return;
      const status = currentIns.getAttribute('data-ad-status');
      const iframe = currentIns.querySelector('iframe') as HTMLIFrameElement | null;
      const rect = iframe ? iframe.getBoundingClientRect() : null;
      if (status !== 'filled' || !rect || rect.height < 50) {
        setAdStatus('unfilled');
        onAdStatusChangeRef.current?.('unfilled');
      }
    }, 10000);

    return () => {
      cancelled = true;
      observer.disconnect();
      clearTimeout(initialCheckTimer);
      clearInterval(poll);
      clearTimeout(safetyTimer);
    };
  }, [isLocalhost, pathname, activeSlot]);

  useEffect(() => {
    if (isLocalhost || !isAdSafe) return;
    pushAttempted.current = false;
    pushAd();
  }, [pathname, activeSlot, isLocalhost, isAdSafe, pushAd]);

  // Safe unconditional hook execution guaranteed: check admin/disabled/IBT returns here
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;
  if (GLOBAL_DISABLE_ADSENSE || isAdmin || !isAdSafe) {
    return null;
  }

  if (adStatus === 'unfilled') {
    return null;
  }

  const resolvedContainerMinHeight = compact ? 0 : (minHeight || '100px');

  return (
    <div
      className={`adsense-container block w-full ${className}`}
      style={{
        minHeight: resolvedContainerMinHeight,
        margin: compact ? 0 : '0.75rem 0',
        display: 'block',
        textAlign: 'center',
      }}
    >
      {showLabel && adStatus === 'filled' && (
        <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', textAlign: 'center', marginBottom: '4px', fontWeight: 600 }}>
          Advertisement
        </span>
      )}

      {isLocalhost ? (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #93c5fd',
            backgroundColor: '#eff6ff',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            margin: '4px 0',
            minHeight: minHeight && minHeight !== '0px' ? minHeight : '100px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
            Google AdSense (Local Dev Preview)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.85)', padding: '4px 12px', borderRadius: '4px', border: '1px solid #dbeafe' }}>
            Slot: <span style={{ fontWeight: 700, color: '#0f172a' }}>{activeSlot}</span> | Format: <span style={{ fontWeight: 600, color: '#2563eb' }}>{adFormat}</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
            Live AdSense ads serve automatically on <span style={{ fontWeight: 600, color: '#475569' }}>careerdiary.in</span>
          </div>
        </div>
      ) : (
        <div className="w-full" style={{ minHeight: compact ? 0 : (minHeight || '100px'), display: 'block', textAlign: 'center' }}>
          <ins
            key={elementKey}
            ref={insRef}
            className="adsbygoogle"
            style={{
              display: width !== '100%' && height ? 'inline-block' : 'block',
              width,
              height: height || 'auto',
              minWidth: width === '100%' && minWidth !== '100%' && minWidth !== '0px' ? minWidth : undefined,
              minHeight: compact || height ? undefined : (minHeight || '100px'),
            }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={activeSlot}
            data-ad-format={adFormat}
            data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
            {...(adLayout ? { 'data-ad-layout': adLayout } : {})}
            {...(adLayoutKey ? { 'data-ad-layout-key': adLayoutKey } : {})}
          />
        </div>
      )}
    </div>
  );
}
