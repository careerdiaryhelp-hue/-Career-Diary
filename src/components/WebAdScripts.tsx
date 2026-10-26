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
 * Immediately hides and collapses a "Discover More" chip element and its ad wrapper.
 */
function killChip(el: HTMLElement) {
  try {
    // If inside an .adsense-banner-wrapper, collapse the entire wrapper so empty ADVERTISEMENT label is not visible
    const wrapper = el.closest ? (el.closest('.adsense-banner-wrapper, .google-auto-placed') as HTMLElement | null) : null;
    if (wrapper) {
      wrapper.style.setProperty('display', 'none', 'important');
      wrapper.style.setProperty('height', '0', 'important');
      wrapper.style.setProperty('max-height', '0', 'important');
      wrapper.style.setProperty('min-height', '0', 'important');
      wrapper.style.setProperty('margin', '0', 'important');
      wrapper.style.setProperty('padding', '0', 'important');
      wrapper.style.setProperty('overflow', 'hidden', 'important');
      wrapper.style.setProperty('visibility', 'hidden', 'important');
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
 * Scans the DOM universally for any "Discover More" / recommended chips and kills them.
 */
function sweepExistingChips() {
  const candidateSelectors = [
    '.google-auto-placed',
    '.adsense-banner-wrapper',
    '[data-ad-format="related_search"]',
    '[data-ad-format="relatedsearch"]',
    '[data-ad-format="autorelaxed"]',
    '[data-ad-intent]',
    '[data-text-ad]',
    '.rscontainer',
    '.related-search-container',
    '[aria-label*="discover more" i]',
    '[aria-label*="related search" i]',
    '[aria-label*="searches related" i]',
    '[aria-label*="recommended" i]'
  ];

  candidateSelectors.forEach((sel) => {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        if (isDiscoverMoreChip(el)) {
          killChip(el as HTMLElement);
        }
      });
    } catch (_) {}
  });

  // Universal text content sweep for rogue "Discover more" headings/elements
  try {
    const allWrappers = document.querySelectorAll('.adsense-banner-wrapper, .google-auto-placed');
    allWrappers.forEach((wrapper) => {
      const text = (wrapper.textContent || '').trim().toLowerCase().replace(/advertisement/gi, '').trim();
      if (text === 'discover more' || text.startsWith('discover more') || text.startsWith('searches related')) {
        killChip(wrapper as HTMLElement);
      }
    });
  } catch (_) {}
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

          // Direct match
          if (isDiscoverMoreChip(el)) {
            killChip(el);
            continue;
          }

          // Descendant match
          el.querySelectorAll?.(
            '.google-auto-placed, .adsense-banner-wrapper, [data-ad-format], [aria-label], [data-ad-intent], .rscontainer, .related-search-container, [data-matched-content-ui-type]'
          ).forEach((child) => {
            if (isDiscoverMoreChip(child)) {
              killChip(child as HTMLElement);
            }
          });
        }

        // Check attribute changes on existing elements
        if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
          const target = mutation.target;
          if (isDiscoverMoreChip(target)) {
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
