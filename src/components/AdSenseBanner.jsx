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
  const pushedRef = useRef(false);

  useEffect(() => {
    pushedRef.current = false;
    let timer = null;

    const tryPush = () => {
      if (pushedRef.current) return;
      if (adRef.current && adRef.current.getAttribute('data-adsbygoogle-status')) {
        pushedRef.current = true;
        return;
      }
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
        }
      } catch (e) {
        // Safe catch if AdSense is loading or already pushed
      }
    };

    tryPush();

    if (!pushedRef.current) {
      timer = setTimeout(tryPush, 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [slot, layout]);

  return (
    <div style={{ margin: '16px 0', textAlign: 'center', width: '100%', boxSizing: 'border-box', overflow: 'hidden', ...style }}>
      {label && (
        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>
          {label}
        </div>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: layout === 'in-article' ? '120px' : '90px', width: '100%' }}
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

// Dedicated helper presets with exact Slot IDs from Google AdSense account
export function DisplayAd(props) {
  return <AdSenseBanner slot="1202822135" format="auto" {...props} />;
}

export function InPostAd(props) {
  return <AdSenseBanner slot="7544533819" format="fluid" layout="in-article" {...props} />;
}

export function InFeedAd(props) {
  return <AdSenseBanner slot="2542955740" format="fluid" {...props} />;
}

export function MultiplexAd(props) {
  return <AdSenseBanner slot="3880243672" format="autorelaxed" {...props} />;
}
