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
  label = 'ADVERTISEMENT'
}) {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;
  const adRef = useRef(null);
  const wrapperRef = useRef(null);
  const [adStatus, setAdStatus] = useState('loading'); // 'loading', 'filled', 'unfilled'
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLocalhost = isMounted && isLocalDev();

  useEffect(() => {
    if (isAdmin || !isMounted || !canServeAds()) return;

    let isMountedEffect = true;
    const el = adRef.current;
    if (!el) return;

    // MutationObserver to detect AdSense status changes (filled vs unfilled)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
          const status = el.getAttribute('data-ad-status');
          if (isMountedEffect) {
            setAdStatus(status || 'filled');
          }
        }
      });
    });

    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });

    let intersectionObserver = null;
    let retryCount = 0;

    // Execute AdSense push
    const tryPush = () => {
      if (!isMountedEffect || !adRef.current) return;
      if (el.getAttribute('data-adsbygoogle-status')) return;
      if (el.dataset.adPushDone) return; // Prevent multiple pushes

      // Skip push if element is genuinely hidden (display: none)
      const computedStyle = window.getComputedStyle(el);
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
        return;
      }

      // Skip push if element has width 0 (prevents TagError: No slot size for availableWidth=0)
      const currentWidth = el.offsetWidth || (wrapperRef.current && wrapperRef.current.offsetWidth) || 0;
      if (currentWidth === 0) {
        if (retryCount < 8) {
          retryCount++;
          setTimeout(tryPush, 350);
        }
        return;
      }

      try {
        el.dataset.adPushDone = 'true';
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        // Safe catch
      }
    };

    // Use IntersectionObserver to wait for the ad to be visible (or near viewport)
    if (window.IntersectionObserver) {
      intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add a small delay to ensure DOM is ready for ad injection
            setTimeout(tryPush, 200);
            intersectionObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '800px 0px' }); // Larger rootMargin for earlier loading on mobile
      
      intersectionObserver.observe(wrapperRef.current || el);
    } else {
      setTimeout(tryPush, 600);
    }

    return () => {
      isMountedEffect = false;
      observer.disconnect();
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
    };
  }, [slot, layout, layoutKey, isLocalhost, isMounted]);

  // Hide wrapper completely on admin routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className="adsense-banner-wrapper"
      suppressHydrationWarning
      style={{
        margin: '16px 0',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
        display: adStatus === 'unfilled' ? 'none' : 'block',
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
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...(layout ? { textAlign: 'center' } : {}) }}
        data-ad-client="ca-pub-2108299943580613"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
        {...(responsive !== 'false' && !layout ? { 'data-full-width-responsive': responsive } : {})}
        suppressHydrationWarning
      />
    </div>
  );
}

// Dedicated helper presets with exact Slot IDs and Formats from Google AdSense account
export function DisplayAd(props) {
  return <AdSenseBanner slot="1202522135" format="auto" responsive="true" {...props} />;
}

export function InFeedAd(props) {
  return <AdSenseBanner slot="2542955740" format="auto" responsive="true" {...props} />;
}

// Google Multiplex Ad Unit (Slot 1963114002 - Autorelaxed Grid)
export function MultiplexAd1963(props) {
  return <AdSenseBanner slot="1963114002" format="autorelaxed" {...props} />;
}

// Google Multiplex Ad Unit (Slot 3880243672 - Autorelaxed Grid)
export function MultiplexAd(props) {
  return <AdSenseBanner slot="3880243672" format="autorelaxed" {...props} />;
}

// Google In-Article Ad Unit 1 (Slot 2022998762)
export function InArticleAd2022(props) {
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

// Google In-Article Ad Unit 2 (Slot 1100799336)
export function InArticleAd1100(props) {
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

export function InPostAd(props) {
  return <InArticleAd2022 {...props} />;
}

export function InArticleAd(props) {
  return <InArticleAd1100 {...props} />;
}



