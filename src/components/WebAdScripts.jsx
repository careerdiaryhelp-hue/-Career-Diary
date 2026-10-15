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

    // 2. Google Ad Manager (GPT) safety fallback
    if (!document.getElementById('gpt-script') && !document.querySelector('script[src*="gpt.js"]')) {
      const gptScript = document.createElement('script');
      gptScript.id = 'gpt-script';
      gptScript.async = true;
      gptScript.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
      gptScript.crossOrigin = 'anonymous';
      document.head.appendChild(gptScript);
    }

    // 3. Google AdSense safety fallback - Website only
    if (!GLOBAL_DISABLE_ADSENSE) {
      if (!document.getElementById('adsbygoogle-script') && !document.querySelector('script[src*="adsbygoogle.js"]')) {
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
