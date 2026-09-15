import React, { useEffect, useRef } from 'react';

export default function AdSenseBanner({ slot, format = 'auto', responsive = 'true', style = {}, label = 'ADVERTISEMENT' }) {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center', width: '100%', boxSizing: 'border-box', overflow: 'hidden', ...style }}>
      {label && (
        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 600 }}>
          {label}
        </div>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px', width: '100%' }}
        data-ad-client="ca-pub-2108299943580613"
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
