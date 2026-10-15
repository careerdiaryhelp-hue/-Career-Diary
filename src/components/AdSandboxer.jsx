'use client';

import { useEffect } from 'react';

/**
 * AdSandboxer
 * Automatically sandboxes dynamically inserted ad iframes to block unauthorized
 * top-level page redirects (auto-redirect malicious ads) while allowing legitimate
 * ad rendering, scripts, same-origin calls, forms, and new tab popups on user clicks.
 */
export default function AdSandboxer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sanitizeIframe = (node) => {
      if (!node || node.nodeName !== 'IFRAME') return;
      
      try {
        const currentSandbox = node.getAttribute('sandbox');
        if (currentSandbox !== null) {
          const newSandbox = currentSandbox
            .replace(/allow-top-navigation-by-user-activation/gi, '')
            .replace(/allow-top-navigation/gi, '')
            .trim();
          if (newSandbox !== currentSandbox) {
            node.setAttribute('sandbox', newSandbox);
          }
        } else {
          node.setAttribute(
            'sandbox',
            'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms'
          );
        }
      } catch (_) {}
    };

    // Sanitize any existing iframes already rendered in the DOM
    try {
      document.querySelectorAll('iframe').forEach(sanitizeIframe);
    } catch (_) {}

    // MutationObserver to sanitize dynamically injected ad iframes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IFRAME') {
            sanitizeIframe(node);
          } else if (node.querySelectorAll) {
            // Also check for nested iframes inside wrapper divs
            node.querySelectorAll('iframe').forEach(sanitizeIframe);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
