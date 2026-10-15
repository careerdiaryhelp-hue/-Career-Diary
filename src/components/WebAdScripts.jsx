'use client';

import { useEffect } from 'react';
import { attachAdClickTracker } from '../utils/adShield';

const ADSENSE_CLIENT_ID = 'ca-pub-2108299943580613';
const GLOBAL_DISABLE_ADSENSE = false;

export default function WebAdScripts() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Initialize click shield protection
    attachAdClickTracker();

    // 3. Google AdSense safety fallback - Website only
    if (!GLOBAL_DISABLE_ADSENSE) {
      if (!document.getElementById('adsense-init-script') && !document.getElementById('adsbygoogle-script') && !document.querySelector('script[src*="adsbygoogle.js"]')) {
        const adsenseScript = document.createElement('script');
        adsenseScript.id = 'adsbygoogle-script';
        adsenseScript.async = true;
        adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
        adsenseScript.crossOrigin = 'anonymous';
        document.head.appendChild(adsenseScript);
      }
    }
  }, []);

  return null;
}
