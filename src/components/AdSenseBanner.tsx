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
  minHeight = '90px',
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
  const [adStatus, setAdStatus] = useState('loading'); // 'loading', 'filled', 'unfilled'

  useEffect(() => {
    if (isAdmin || !canServeAds()) return;

    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;
    const el = adRef.current;
    if (!el) return;

    // MutationObserver to detect AdSense status changes (filled vs unfilled)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
          const status = el.getAttribute('data-ad-status');
          if (isMounted) {
            setAdStatus(status || 'filled');
          }
        }
      });
    });

    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });

    let retryCount = 0;
    const tryPush = () => {
      if (!isMounted || !adRef.current) return;
      if (el.getAttribute('data-adsbygoogle-status')) return;
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

    // Push ad request smoothly once component mounts and DOM calculates width
    timer = setTimeout(tryPush, 100);

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [slot, layout, layoutKey, isAdmin, pathname]);

  // Hide wrapper completely on admin routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const effectiveMinHeight = layout ? 'auto' : minHeight;

  return (
    <div
      key={pathname ? `${pathname}-${slot}` : slot}
      className="adsense-banner-wrapper"
      suppressHydrationWarning
      style={{
        margin: '16px auto',
        textAlign: 'center',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        display: adStatus === 'unfilled' ? 'none' : 'block',
        minHeight: adStatus === 'unfilled' ? 0 : effectiveMinHeight,
        ...style
      }}
    >
      {label && adStatus !== 'unfilled' && (
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
            display: (format === 'vertical' || responsive === 'false') ? 'inline-block' : 'block',
            width: responsive === 'false' ? (insStyle.width || '300px') : '100%',
            minHeight: effectiveMinHeight,
            ...(layout ? { textAlign: 'center' } : {}),
            ...insStyle
          }}
          data-ad-client="ca-pub-2108299943580613"
          data-ad-slot={slot}
          {...(format ? { 'data-ad-format': format } : {})}
          {...(layout ? { 'data-ad-layout': layout } : {})}
          {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
          {...(responsive !== 'false' && !layout ? { 'data-full-width-responsive': responsive } : { 'data-full-width-responsive': 'false' })}
          suppressHydrationWarning
        />
      )}
    </div>
  );
}

// Dedicated helper presets with exact Slot IDs and Formats from Google AdSense account
// 1. Display Ad (Slot 1202522135) - Pure Display Horizontal Banner (Blocks Search Intent chips)
export function DisplayAd(props: any) {
  return (
    <AdSenseBanner
      slot="1202522135"
      format="horizontal"
      responsive="false"
      minHeight="90px"
      label="ADVERTISEMENT"
      style={{ width: '100%', maxWidth: '728px', margin: '0 auto', ...(props.style || {}) }}
      insStyle={{ width: '100%', maxWidth: '728px', minHeight: '90px', display: 'block', ...(props.insStyle || {}) }}
      {...props}
    />
  );
}

// 2. Sidebar Ad (Slot 1202522135) - Fixed 160x600 Vertical Skyscraper (Prevents Discover More Chips in narrow sidebar)
export function SidebarAd(props: any) {
  return (
    <AdSenseBanner
      slot="1202522135"
      format="vertical"
      responsive="false"
      minHeight="600px"
      label="ADVERTISEMENT"
      style={{ width: '160px', height: '600px', margin: '0 auto', ...(props.style || {}) }}
      insStyle={{ width: '160px', height: '600px', display: 'inline-block', ...(props.insStyle || {}) }}
      {...props}
    />
  );
}

// 3. Rectangle Ad (Slot 1202522135) - Standard 300x250 Medium Rectangle (Strict Display Banner, Prevents Search Chips)
export function RectangleAd(props: any) {
  return (
    <AdSenseBanner
      slot="1202522135"
      format={null}
      responsive="false"
      minHeight="250px"
      label="ADVERTISEMENT"
      style={{ width: '300px', height: '250px', maxWidth: '100%', margin: '0 auto', ...(props.style || {}) }}
      insStyle={{ width: '300px', height: '250px', display: 'inline-block', ...(props.insStyle || {}) }}
      {...props}
    />
  );
}

// 4. Square Ad (Slot 1202522135) - 300x250 Fixed Square Display Banner (Blocks Recommended / Search Intent chips)
export function SquareAd(props: any) {
  return (
    <AdSenseBanner
      slot="1202522135"
      format={null}
      responsive="false"
      minHeight="250px"
      label="ADVERTISEMENT"
      style={{ width: '300px', height: '250px', maxWidth: '100%', margin: '0 auto', ...(props.style || {}) }}
      insStyle={{ width: '300px', height: '250px', display: 'inline-block', ...(props.insStyle || {}) }}
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
export function InArticlePo2022(props) {
  return (
    <AdSenseBanner
      slot="2022998762"
      layout="in-article"
      format="fluid"
      responsive="false"
      style={{ textAlign: 'center' }}
      {...props}
    />
  );
}

// 7. Hg In-Article Native Ad (Slot 1100799336)
export function InArticleHg1100(props) {
  return (
    <AdSenseBanner
      slot="1100799336"
      layout="in-article"
      format="fluid"
      responsive="false"
      style={{ textAlign: 'center' }}
      {...props}
    />
  );
}

// 8. InPost In-Article Native Ad (Slot 7544533819)
export function InPostAd7544(props) {
  return (
    <AdSenseBanner
      slot="7544533819"
      layout="in-article"
      format="fluid"
      responsive="false"
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



