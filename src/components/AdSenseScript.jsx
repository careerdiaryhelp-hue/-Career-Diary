'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

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
      return;
    }

    document.body.classList.remove('admin-active');

    // Dynamically inject AdSense script without next/script to eliminate data-nscript attribute warning
    const scriptSrc = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2108299943580613';
    if (!document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.id = 'adsense-init-script';
      script.async = true;
      script.src = scriptSrc;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, [isAdmin]);

  return null;
}

