'use client';

import { useEffect } from 'react';
import { attachAdClickTracker } from '../utils/adShield';

/**
 * Checks if a given DOM element is a "Discover More" / related-search chip / recommended ad
 * injected by Google AdSense auto-ads or responsive format fallbacks.
 * Returns true if it should be killed.
 */
function isDiscoverMoreChip(el: Element): boolean {
  if (!el) return false;

  // Check text content: if the element text is literally "Discover more" or starts with "Discover more"
  const rawText = (el.textContent || '').trim().toLowerCase();
  const strippedText = rawText.replace(/advertisement/gi, '').trim();
  if (
    strippedText === 'discover more' ||
    strippedText.startsWith('discover more') ||
    strippedText.startsWith('searches related') ||
    strippedText.startsWith('related search') ||
    strippedText.startsWith('aur padhe') ||
    strippedText.startsWith('aur jaanein')
  ) {
    return true;
  }

  // Check data-ad-format
  const format = el.getAttribute('data-ad-format');
  if (format === 'related_search' || format === 'relatedsearch' || format === 'autorelaxed') return true;

  // Check aria-label
  const label = (el.getAttribute('aria-label') || '').toLowerCase();
  if (
    label.includes('discover more') ||
    label.includes('related search') ||
    label.includes('searches related') ||
    label.includes('recommended') ||
    label.includes('recommendation') ||
    label.includes('aur padhe') ||
    label.includes('aur jaanein') ||
    label.includes('suggested')
  ) return true;

  // Check data attributes
  if (
    el.hasAttribute('data-ad-intent') ||
    el.hasAttribute('data-text-ad') ||
    el.hasAttribute('data-matched-content-ui-type')
  ) return true;

  // Check class names
  const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
  if (
    cls.includes('related_search') ||
    cls.includes('relatedsearch') ||
    cls.includes('rscontainer') ||
    cls.includes('related-search') ||
    cls.includes('google-anno-sc') ||
    cls.includes('ad-intent')
  ) return true;

  // Check inner content for related search containers
  const inner = el.querySelector?.(
    '.rscontainer, .related-search-container, [data-ad-format="related_search"], [data-ad-format="autorelaxed"], [data-matched-content-ui-type], [role="listbox"], [data-ad-intent], [aria-label*="Discover more" i], [aria-label*="Related search" i]'
  );
  if (inner) return true;

  return false;
}

/**
 * Immediately hides and collapses stray auto-placed chips outside user content.
 * NEVER hides user's own .adsense-banner-wrapper units!
 */
function killChip(el: HTMLElement) {
  try {
    // PROTECT user's intended in-page ads: NEVER kill .adsense-banner-wrapper!
    if (el.closest && el.closest('.adsense-banner-wrapper')) {
      return;
    }

    // Only collapse stray google-auto-placed floating search intent chips
    const autoPlaced = el.closest ? (el.closest('.google-auto-placed') as HTMLElement | null) : null;
    if (autoPlaced) {
      autoPlaced.style.setProperty('display', 'none', 'important');
      autoPlaced.style.setProperty('height', '0', 'important');
      autoPlaced.style.setProperty('max-height', '0', 'important');
      autoPlaced.style.setProperty('min-height', '0', 'important');
      autoPlaced.style.setProperty('margin', '0', 'important');
      autoPlaced.style.setProperty('padding', '0', 'important');
      autoPlaced.style.setProperty('overflow', 'hidden', 'important');
      autoPlaced.style.setProperty('visibility', 'hidden', 'important');
    }

    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('height', '0', 'important');
    el.style.setProperty('max-height', '0', 'important');
    el.style.setProperty('min-height', '0', 'important');
    el.style.setProperty('margin', '0', 'important');
    el.style.setProperty('padding', '0', 'important');
    el.style.setProperty('opacity', '0', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
  } catch (_) {}
}

/**
 * Scans the DOM for stray Google Auto-Ads search intent chips (never touches user's in-page ads).
 */
function sweepExistingChips() {
  const candidateSelectors = [
    '.google-auto-placed[data-ad-format="related_search"]',
    '.google-auto-placed[data-ad-format="relatedsearch"]',
    '.google-auto-placed[data-ad-intent]',
    '.google-auto-placed .rscontainer',
    '.google-auto-placed .related-search-container'
  ];

  candidateSelectors.forEach((sel) => {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.closest('.adsense-banner-wrapper') && isDiscoverMoreChip(el)) {
          killChip(el as HTMLElement);
        }
      });
    } catch (_) {}
  });
}

export default function WebAdScripts() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    attachAdClickTracker();

    // Initial sweep for any chips already in the DOM
    sweepExistingChips();

    // MutationObserver: watch for newly injected "Discover More" / recommended chips
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check added nodes
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node as HTMLElement;

          // Ignore any nodes inside user in-page ad banners
          if (el.closest && el.closest('.adsense-banner-wrapper')) continue;

          // Direct match on stray auto-placed chips
          if (isDiscoverMoreChip(el)) {
            killChip(el);
            continue;
          }

          // Descendant match on stray auto-placed chips
          el.querySelectorAll?.(
            '.google-auto-placed[data-ad-format="related_search"], .google-auto-placed[data-ad-intent], .google-auto-placed .rscontainer'
          ).forEach((child) => {
            if (!child.closest('.adsense-banner-wrapper') && isDiscoverMoreChip(child)) {
              killChip(child as HTMLElement);
            }
          });
        }

        // Check attribute changes on existing elements
        if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
          const target = mutation.target;
          if (!target.closest('.adsense-banner-wrapper') && isDiscoverMoreChip(target)) {
            killChip(target);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-ad-format', 'aria-label', 'data-ad-intent', 'class', 'data-matched-content-ui-type'],
    });

    // Periodic safety sweep every 3 seconds for first 30 seconds
    // (covers late injections after page idle)
    let sweepCount = 0;
    const sweepInterval = setInterval(() => {
      sweepExistingChips();
      sweepCount++;
      if (sweepCount >= 10) clearInterval(sweepInterval);
    }, 3000);

    return () => {
      observer.disconnect();
      clearInterval(sweepInterval);
    };
  }, []);

  return null;
}
