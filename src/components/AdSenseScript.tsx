'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AdSenseScript() {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('admin-active');
      return;
    }

    document.body.classList.remove('admin-active');

    if (typeof window !== 'undefined') {
      try {
        window.google_ad_client = 'ca-pub-2108299943580613';
        if (window.adsbygoogle && (window.adsbygoogle as any).pauseAdRequests) {
          delete (window.adsbygoogle as any).pauseAdRequests;
        }
      } catch (_) {}

      // Fallback injection if not already in head
      const scriptSrc = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2108299943580613';
      if (!document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.id = 'adsense-init-script';
        script.async = true;
        script.src = scriptSrc;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    }
  }, [isAdmin]);

  // Next.js App Router: re-scan and push unrendered ad units on route transitions
  useEffect(() => {
    if (isAdmin || typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      try {
        const unpushed = document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])');
        unpushed.forEach((ins: any) => {
          if (!ins.dataset.adPushDone) {
            ins.dataset.adPushDone = 'true';
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          }
        });
      } catch (_) {}
    }, 250);

    return () => clearTimeout(timer);
  }, [pathname, isAdmin]);

  return null;
}
