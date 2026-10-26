'use client';

import { useEffect } from 'react';
import { attachAdClickTracker } from '../utils/adShield';

/**
 * Checks if a given DOM element is a "Discover More" / related-search chip
 * injected by Google AdSense auto-ads. Returns true if it should be killed.
 */
function isDiscoverMoreChip(el: Element): boolean {
  // Check data-ad-format
  const format = el.getAttribute('data-ad-format');
  if (format === 'related_search' || format === 'relatedsearch') return true;

  // Check aria-label
  const label = (el.getAttribute('aria-label') || '').toLowerCase();
  if (
    label.includes('discover more') ||
    label.includes('related search') ||
    label.includes('searches related') ||
    label.includes('aur padhe') ||
    label.includes('aur jaanein')
  ) return true;

  // Check data attributes
  if (el.hasAttribute('data-ad-intent') || el.hasAttribute('data-text-ad')) return true;

  // Check class names
  const cls = el.className || '';
  if (typeof cls === 'string' && (
    cls.includes('related_search') ||
    cls.includes('relatedsearch') ||
    cls.includes('rscontainer')
  )) return true;

  // Check inner content for related search containers
  const inner = el.querySelector?.(
    '.rscontainer, .related-search-container, [data-ad-format="related_search"], [data-matched-content-ui-type], [role="listbox"]'
  );
  if (inner) return true;

  return false;
}

/**
 * Immediately hides and collapses a "Discover More" chip element.
 */
function killChip(el: HTMLElement) {
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
}

/**
 * Scans the DOM for existing "Discover More" chips and kills them.
 */
function sweepExistingChips() {
  document.querySelectorAll('.google-auto-placed').forEach((el) => {
    if (isDiscoverMoreChip(el)) {
      killChip(el as HTMLElement);
    }
  });
}

export default function WebAdScripts() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    attachAdClickTracker();

    // Initial sweep for any chips already in the DOM
    sweepExistingChips();

    // MutationObserver: watch for newly injected "Discover More" chips
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check added nodes
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node as HTMLElement;

          // Direct match
          if (el.classList?.contains('google-auto-placed') && isDiscoverMoreChip(el)) {
            killChip(el);
            continue;
          }

          // Children match (Google sometimes wraps in extra divs)
          el.querySelectorAll?.('.google-auto-placed').forEach((child) => {
            if (isDiscoverMoreChip(child)) {
              killChip(child as HTMLElement);
            }
          });
        }

        // Check attribute changes on existing elements
        if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
          const target = mutation.target;
          if (target.classList?.contains('google-auto-placed') && isDiscoverMoreChip(target)) {
            killChip(target);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-ad-format', 'aria-label', 'data-ad-intent', 'class'],
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
