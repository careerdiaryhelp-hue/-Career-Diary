'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function AdSenseScript() {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('admin-active');
      if (typeof window !== 'undefined') {
        try {
          window.google_ad_client = null;
          (window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 1;
        } catch (_) {}
      }
    } else {
      document.body.classList.remove('admin-active');
    }
  }, [isAdmin]);

  // NEVER inject or execute Google AdSense script on admin routes
  if (isAdmin) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2108299943580613"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
