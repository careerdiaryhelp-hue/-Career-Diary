'use client';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { canServeAds, isLocalDev } from '../utils/adShield';

export default function AdSenseBanner({
  slot = '1202522135',
  format = 'auto',
  layout = null,
  layoutKey = null,
  responsive = 'true',
  style = {},
  insStyle = {},
  minHeight = '250px',
  label = 'ADVERTISEMENT'
}: {
  slot?: string;
  format?: string;
  layout?: string | null;
  layoutKey?: string | null;
  responsive?: string;
  style?: React.CSSProperties;
  insStyle?: React.CSSProperties;
  minHeight?: string;
  label?: string | null;
}) {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;
  const adRef = useRef<HTMLModElement | null>(null);
  const [adStatus, setAdStatus] = useState<'loading' | 'filled' | 'unfilled'>('loading');

  useEffect(() => {
    if (isAdmin || !canServeAds()) return;

    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;
    let safetyTimer: NodeJS.Timeout | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    const el = adRef.current;
    if (!el) return;

    const checkStatus = () => {
      if (!isMounted || !el) return;
      const status = el.getAttribute('data-ad-status');
      const googleStatus = el.getAttribute('data-adsbygoogle-status');
      const hasIframe = Boolean(el.querySelector('iframe'));

      if (status === 'filled' || hasIframe) {
        setAdStatus('filled');
      } else if (status === 'unfilled' || (googleStatus === 'done' && !hasIframe)) {
        setAdStatus('unfilled');
      }
    };

    // MutationObserver to watch Google AdSense iframe injection or unfilled status
    const observer = new MutationObserver(() => {
      checkStatus();
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'],
      childList: true,
      subtree: true,
    });

    // Check status periodically for fast response
    pollInterval = setInterval(() => {
      checkStatus();
    }, 300);

    // If Google has not filled within 3.5s, auto-collapse completely so no empty white space remains
    safetyTimer = setTimeout(() => {
      if (!isMounted || !el) return;
      const hasIframe = Boolean(el.querySelector('iframe'));
      const status = el.getAttribute('data-ad-status');
      if (!hasIframe && status !== 'filled') {
        setAdStatus('unfilled');
      }
    }, 3500);

    let retryCount = 0;
    const tryPush = () => {
      if (!isMounted || !adRef.current) return;
      if (el.getAttribute('data-adsbygoogle-status')) {
        checkStatus();
        return;
      }
      if (el.dataset.adPushDone) return;

      const currentWidth = el.offsetWidth || (el.parentElement && el.parentElement.offsetWidth) || 0;
      if (currentWidth === 0 && retryCount < 4) {
        retryCount++;
        timer = setTimeout(tryPush, 150);
        return;
      }

      try {
        el.dataset.adPushDone = 'true';
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        // Safe catch
      }
    };

    // Push ad request smoothly once component mounts
    timer = setTimeout(tryPush, 80);

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (pollInterval) clearInterval(pollInterval);
      observer.disconnect();
    };
  }, [slot, layout, layoutKey, isAdmin, pathname]);

  // Hide wrapper completely on admin routes or if unfilled
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  if (adStatus === 'unfilled') {
    return null;
  }

  const effectiveMinHeight = layout ? 'auto' : minHeight;

  return (
    <div
      className="adsense-banner-wrapper"
      data-ad-status={adStatus}
      suppressHydrationWarning
      style={{
        margin: '16px auto',
        textAlign: 'center',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        display: 'block',
        minHeight: adStatus === 'filled' ? effectiveMinHeight : 'auto',
        ...style
      }}
    >
      {/* Label only appears when ad is confirmed filled, never over empty space */}
      {label && adStatus === 'filled' && (
        <div
          className="ad-label"
          style={{
            fontSize: '0.65rem',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '4px',
            fontWeight: 600
          }}
        >
          {label}
        </div>
      )}
      {isLocalDev() ? (
        <div
          style={{
            minHeight: effectiveMinHeight,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            border: '1.5px dashed #93c5fd',
            borderRadius: '8px',
            padding: '12px',
            color: '#1e3a8a',
            fontSize: '0.8rem',
            textAlign: 'center',
            boxSizing: 'border-box',
            ...insStyle
          }}
        >
          <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: '2px' }}>
            📢 Google AdSense Ad ({format || 'auto'})
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Slot: {slot} • Live ad serves on careerdiary.in
          </div>
        </div>
      ) : (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: layout ? 'block' : ((format === 'vertical' || (responsive === 'false' && !layout)) ? 'inline-block' : 'block'),
            width: (!layout && responsive === 'false') ? (insStyle.width || '300px') : '100%',
            minHeight: adStatus === 'filled' ? effectiveMinHeight : 'auto',
            ...(layout ? { textAlign: 'center' } : {}),
            ...insStyle
          }}
          data-ad-client="ca-pub-2108299943580613"
          data-ad-slot={slot}
          {...(format ? { 'data-ad-format': format } : {})}
          {...(layout ? { 'data-ad-layout': layout } : {})}
          {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
          {...(!layout && responsive !== 'false' ? { 'data-full-width-responsive': responsive } : {})}
          suppressHydrationWarning
        />
      )}
    </div>
  );
}

// Dedicated helper presets with exact Slot IDs and Formats from Google AdSense account
// 1. Display Ad (Slot 1202522135) - Responsive Graphic & Image Banner Ad Unit (300x250, 336x280, 728x90, Rich Media)
export function DisplayAd(props: any) {
  return (
    <AdSenseBanner
      slot="1202522135"
      format="auto"
      responsive="true"
      minHeight="250px"
      label="ADVERTISEMENT"
      style={{ width: '100%', maxWidth: '100%', margin: '20px auto', ...(props.style || {}) }}
      insStyle={{ width: '100%', minHeight: '250px', display: 'block', ...(props.insStyle || {}) }}
      {...props}
    />
  );
}

// 2. Sidebar Ad (Slot 1202522135) - Fixed 160x600 Vertical Skyscraper or Responsive Tower Banner
export function SidebarAd(props: any) {
  return (
    <AdSenseBanner
      slot="1202522135"
      format="auto"
      responsive="true"
      minHeight="600px"
      label="ADVERTISEMENT"
      style={{ width: '100%', maxWidth: '300px', margin: '0 auto', ...(props.style || {}) }}
      insStyle={{ width: '100%', minHeight: '600px', display: 'block', ...(props.insStyle || {}) }}
      {...props}
    />
  );
}

// 3. Rectangle Ad (Slot 1202522135) - Standard 300x250 Medium Rectangle Display Banner
export function RectangleAd(props: any) {
  return (
    <AdSenseBanner
      slot="1202522135"
      format="auto"
      responsive="true"
      minHeight="250px"
      label="ADVERTISEMENT"
      style={{ width: '100%', maxWidth: '336px', margin: '16px auto', ...(props.style || {}) }}
      insStyle={{ width: '100%', minHeight: '250px', display: 'block', ...(props.insStyle || {}) }}
      {...props}
    />
  );
}

// 4. Square Ad (Slot 1202522135) - 300x250 Fixed Square Display Banner
export function SquareAd(props: any) {
  return (
    <AdSenseBanner
      slot="1202522135"
      format="auto"
      responsive="true"
      minHeight="250px"
      label="ADVERTISEMENT"
      style={{ width: '100%', maxWidth: '336px', margin: '16px auto', ...(props.style || {}) }}
      insStyle={{ width: '100%', minHeight: '250px', display: 'block', ...(props.insStyle || {}) }}
      {...props}
    />
  );
}

export function DisplayBannerAd(props: any) {
  return <DisplayAd {...props} />;
}

// 2. In feed Ad (Slot 2542955740) - Standard Display Banner
export function InFeedAd(props: any) {
  return <DisplayAd slot="2542955740" {...props} />;
}

// 3. Ut Multiplex (Formerly Slot 1963114002 - Converted to Clean Display Banner)
export function MultiplexUt1963(props: any) {
  return <DisplayAd slot="1202522135" label="ADVERTISEMENT" {...props} />;
}

// 4. Mt Multiplex (Formerly Slot 5566657954 - Converted to Clean Display Banner)
export function MultiplexMt5566(props: any) {
  return <DisplayAd slot="1202522135" label="ADVERTISEMENT" {...props} />;
}

// 5. Multiplexad (Slot 3880243672 - Converted to Clean Display Banner)
export function MultiplexAd3880(props: any) {
  return <DisplayAd slot="1202522135" label="ADVERTISEMENT" {...props} />;
}

export function MultiplexAd(props: any) {
  return <DisplayAd slot="1202522135" label="ADVERTISEMENT" {...props} />;
}

// 6. Po In-Article Native Ad (Slot 2022998762)
export function InArticlePo2022(props: any) {
  return (
    <AdSenseBanner
      slot="2022998762"
      layout="in-article"
      format="fluid"
      style={{ textAlign: 'center' }}
      {...props}
    />
  );
}

// 7. Hg In-Article Native Ad (Slot 1100799336)
export function InArticleHg1100(props: any) {
  return (
    <AdSenseBanner
      slot="1100799336"
      layout="in-article"
      format="fluid"
      style={{ textAlign: 'center' }}
      {...props}
    />
  );
}

// 8. InPost In-Article Native Ad (Slot 7544533819)
export function InPostAd7544(props: any) {
  return (
    <AdSenseBanner
      slot="7544533819"
      layout="in-article"
      format="fluid"
      style={{ textAlign: 'center' }}
      {...props}
    />
  );
}

// Aliases for backward compatibility
export function InPostAd(props) {
  return <InPostAd7544 {...props} />;
}

export function InArticleAd(props) {
  return <InArticleHg1100 {...props} />;
}

export function InArticleAd1100(props) {
  return <InArticleHg1100 {...props} />;
}

export function MultiplexAd1963(props) {
  return <MultiplexUt1963 {...props} />;
}

export function InArticleAd2022(props) {
  return <InArticlePo2022 {...props} />;
}



