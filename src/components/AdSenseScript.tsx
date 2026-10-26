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

  // Next.js App Router: individual ad components (AdSenseBanner, DirectAdSense)
  // handle their own push. No global re-scan needed here — global re-push was
  // causing double-push which triggered extra "Discover More" / related-search
  // chip injections from AdSense auto-ads.
  // Keeping this hook only as a cleanup guard for stale ad units on SPA navigation.
  useEffect(() => {
    if (isAdmin || typeof window === 'undefined') return;

    // Cleanup stale ad units from previous routes that were not unmounted
    return () => {
      try {
        document.querySelectorAll('ins.adsbygoogle[data-ad-status="unfilled"]').forEach((el: any) => {
          if (el.closest && el.closest('.adsense-banner-wrapper')) {
            const wrapper = el.closest('.adsense-banner-wrapper');
            wrapper.style.display = 'none';
            wrapper.style.height = '0';
          }
        });
      } catch (_) {}
    };
  }, [pathname, isAdmin]);

  return null;
}
