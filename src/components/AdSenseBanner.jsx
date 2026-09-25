import React, { useEffect, useRef, useState } from 'react';

export default function AdSenseBanner({
  slot = '1202822135',
  format = 'auto',
  layout = null,
  layoutKey = null,
  responsive = 'true',
  style = {},
  label = 'ADVERTISEMENT'
}) {
  const adRef = useRef(null);
  const wrapperRef = useRef(null);
  const [adStatus, setAdStatus] = useState('loading'); // 'loading', 'filled', 'unfilled'

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168.'));

  useEffect(() => {
    if (isLocalhost) return;

    let isMounted = true;
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

    observer.observe(el, { attributes: true });

    let intersectionObserver = null;

    // Execute AdSense push
    const tryPush = () => {
      if (!isMounted || !adRef.current) return;
      if (el.getAttribute('data-adsbygoogle-status')) return;
      if (el.dataset.adPushDone) return; // Prevent multiple pushes

      // Prevent AdSense 400 Bad Request on hidden ad units (like desktop sidebars on mobile)
      if (el.offsetWidth === 0 && el.offsetHeight === 0) return;

      try {
        if (window.adsbygoogle) {
          el.dataset.adPushDone = 'true';
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        // Safe catch
      }
    };

    // Use IntersectionObserver to wait for the ad to be visible (or near viewport) and not display:none
    if (window.IntersectionObserver) {
      intersectionObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          tryPush();
        }
      }, { rootMargin: '300px' });
      
      // Some layouts might start as display:none then become block on resize.
      // We observe the wrapper to detect visibility changes reliably.
      intersectionObserver.observe(wrapperRef.current || el);
    } else {
      setTimeout(tryPush, 500);
    }

    return () => {
      isMounted = false;
      observer.disconnect();
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
    };
  }, [slot, layout, layoutKey, isLocalhost]);

  if (isLocalhost) {
    return (
      <div
        className="adsense-banner-wrapper localhost-preview"
        style={{
          margin: '16px 0',
          padding: '10px',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: '6px',
          color: '#64748b',
          fontSize: '0.8rem',
          ...style
        }}
      >
        📢 [AdSense Slot {slot} - Active on Production Domain]
      </div>
    );
  }

  // Hide wrapper completely if AdSense marks it as unfilled
  if (adStatus === 'unfilled') {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className="adsense-banner-wrapper"
      style={{
        margin: '16px 0',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        ...style
      }}
    >
      {label && adStatus === 'filled' && (
        <div
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
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-2108299943580613"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}

// Dedicated helper presets with exact Slot IDs and Formats from Google AdSense account
export function DisplayAd(props) {
  return <AdSenseBanner slot="1202822135" format="auto" responsive="true" {...props} />;
}

export function InFeedAd(props) {
  return <AdSenseBanner slot="2542955740" format="fluid" {...props} />;
}

export function MultiplexAd(props) {
  return <AdSenseBanner slot="3880243672" format="autorelaxed" {...props} />;
}

export function InPostAd(props) {
  return <AdSenseBanner slot="7544533819" format="fluid" layout="in-article" {...props} />;
}



