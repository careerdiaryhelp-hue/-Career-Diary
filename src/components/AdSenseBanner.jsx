import React, { useEffect, useRef } from 'react';

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
  const isPushed = useRef(false);

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168.'));

  useEffect(() => {
    if (isLocalhost) return;

    let isMounted = true;
    let timerId = null;

    const pushAd = () => {
      if (!isMounted || !adRef.current) return;

      const el = adRef.current;

      // Check if already initialized by AdSense script or pushed by us
      if (
        isPushed.current ||
        el.getAttribute('data-adsbygoogle-status') ||
        el.getAttribute('data-ad-status') ||
        el.dataset.adPushed === 'true' ||
        el.children.length > 0
      ) {
        return;
      }

      // Check if element is attached and has non-zero layout width
      if (el.offsetWidth === 0 && el.offsetHeight === 0) {
        // Element not yet visible in DOM, retry after 200ms
        timerId = setTimeout(pushAd, 200);
        return;
      }

      try {
        if (window.adsbygoogle) {
          el.dataset.adPushed = 'true';
          isPushed.current = true;
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } else {
          // Script not loaded yet, retry
          timerId = setTimeout(pushAd, 300);
        }
      } catch (err) {
        // Suppress benign AdSense push errors
      }
    };

    // Delay push slightly (100ms) so DOM layout computation completes cleanly
    timerId = setTimeout(pushAd, 100);

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [slot, layout, layoutKey, isLocalhost]);

  if (isLocalhost) {
    return (
      <div
        className="adsense-banner-wrapper localhost-preview"
        style={{
          margin: '16px 0',
          padding: '12px',
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

  return (
    <div
      className="adsense-banner-wrapper"
      style={{
        margin: '16px 0',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        minHeight: layout === 'in-article' ? '120px' : '90px',
        ...style
      }}
    >
      {label && (
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
        style={{ display: 'block', width: '100%', minHeight: layout === 'in-article' ? '120px' : '90px' }}
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


