'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isLocalDev } from '../utils/adShield';

let slotCounter = 0;

interface GamBannerProps {
  adUnitPath?: string;
  sizes?: (number[] | [number, number])[];
  divId?: string;
  label?: string | null;
  minHeight?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function GamBanner({
  adUnitPath = '/23374332010/carrierdiarybanner',
  sizes = [[320, 50], [320, 100], [300, 250]],
  divId,
  label = 'ADVERTISEMENT',
  minHeight = '50px',
  style = {},
  className = '',
}: GamBannerProps) {
  const [elementId] = useState<string>(() => {
    if (divId) return divId;
    const count = slotCounter++;
    return count === 0 ? 'div-gpt-ad-1795660391012-0' : `div-gpt-ad-1795660391012-${count}`;
  });

  const [gamStatus, setGamStatus] = useState<'loading' | 'filled' | 'empty'>('loading');
  const slotRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Local dev preview
    if (isLocalDev()) {
      setGamStatus('filled');
      return;
    }

    // Ensure GPT library script is injected
    if (!document.querySelector('script[src*="securepubads.g.doubleclick.net/tag/js/gpt.js"]')) {
      const gptScript = document.createElement('script');
      gptScript.async = true;
      gptScript.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
      gptScript.crossOrigin = 'anonymous';
      document.head.appendChild(gptScript);
    }

    window.googletag = window.googletag || { cmd: [] };
    const { googletag } = window;

    let destroyed = false;

    googletag.cmd.push(() => {
      if (destroyed) return;

      try {
        // Enable GPT pubads services if not already enabled
        if (!window.__gamServicesEnabled) {
          googletag.pubads().enableSingleRequest();
          googletag.pubads().collapseEmptyDivs();
          googletag.enableServices();
          window.__gamServicesEnabled = true;
        }
      } catch (_) {
        try {
          googletag.enableServices();
          window.__gamServicesEnabled = true;
        } catch (e) {}
      }

      const targetEl = document.getElementById(elementId);
      if (!targetEl) return;

      try {
        const slot = googletag.defineSlot(adUnitPath, sizes, elementId);
        if (slot) {
          slot.addService(googletag.pubads());
          slotRef.current = slot;

          const listener = (event: any) => {
            if (event.slot === slot) {
              if (event.isEmpty) {
                setGamStatus('empty');
              } else {
                setGamStatus('filled');
              }
            }
          };

          googletag.pubads().addEventListener('slotRenderEnded', listener);

          // Display ad slot
          googletag.display(elementId);

          // In single request / dynamic mode, refresh the new slot to ensure request is dispatched
          if (window.__gamServicesEnabled) {
            googletag.pubads().refresh([slot]);
          }
        }
      } catch (err) {
        console.warn('GAM slot define error:', err);
      }
    });

    return () => {
      destroyed = true;
      if (slotRef.current) {
        googletag.cmd.push(() => {
          try {
            googletag.destroySlots([slotRef.current]);
          } catch (_) {}
          slotRef.current = null;
        });
      }
    };
  }, [adUnitPath, sizes, elementId]);

  if (gamStatus === 'empty') {
    return null;
  }

  return (
    <div
      className={`gam-ad-wrapper ${className}`}
      data-gam-status={gamStatus}
      style={{
        margin: '16px auto',
        textAlign: 'center',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: gamStatus === 'filled' ? minHeight : 'auto',
        ...style,
      }}
    >
      {label && gamStatus === 'filled' && (
        <div
          className="ad-label"
          style={{
            fontSize: '0.65rem',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '4px',
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      )}

      {isLocalDev() ? (
        <div
          style={{
            minHeight: minHeight || '50px',
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0fdf4',
            border: '1.5px dashed #86efac',
            borderRadius: '8px',
            padding: '12px',
            color: '#166534',
            fontSize: '0.8rem',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ fontWeight: 700, color: '#15803d', marginBottom: '2px' }}>
            🎯 GAM Ad (Fallback Unit)
          </div>
          <div style={{ fontSize: '0.72rem', color: '#4b5563' }}>
            Unit: {adUnitPath} • [320x50, 320x100, 300x250]
          </div>
        </div>
      ) : (
        <div
          id={elementId}
          style={{
            minWidth: '300px',
            minHeight: '50px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        />
      )}
    </div>
  );
}
