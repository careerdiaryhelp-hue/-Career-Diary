'use client';

import AdSenseBanner, {
  DisplayAd,
  Dis2Ad,
  Ds3Ad,
  InFeedAd,
  MultiplexAd,
  MultiplexAd1963,
  InArticleAd2022,
  InArticleAd1100,
  InPostAd,
  InArticleAd,
  GamBanner
} from './AdSenseBanner';

/**
 * AdBanner
 * Flexible ad banner component supporting GAM / AdSense fallback, custom slots,
 * full-width responsiveness, minimum heights, and empty callbacks.
 */
export default function AdBanner({
  adClient = 'ca-pub-2108299943580613',
  adSlot = '1202522135',
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  fallbackGamAdId = '',
  adUnitPath = '/23374332010/carrierdiarybanner',
  onAdEmpty,
  enableGamFallback = true,
  minHeight = '100px',
  style = {},
  label = 'ADVERTISEMENT'
}: any) {
  return (
    <div
      className={`w-full flex justify-center ${className}`}
      style={{ minHeight, ...style }}
    >
      <AdSenseBanner
        slot={adSlot}
        format={adFormat}
        responsive={fullWidthResponsive ? 'true' : 'false'}
        label={label}
        enableGamFallback={enableGamFallback}
        gamAdUnitPath={adUnitPath || '/23374332010/carrierdiarybanner'}
      />
    </div>
  );
}

export {
  GamBanner,
  DisplayAd,
  Dis2Ad,
  Ds3Ad,
  InFeedAd,
  MultiplexAd,
  MultiplexAd1963,
  InArticleAd2022,
  InArticleAd1100,
  InPostAd,
  InArticleAd
};
