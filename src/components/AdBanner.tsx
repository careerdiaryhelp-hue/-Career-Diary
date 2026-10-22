'use client';

import AdSenseBanner, {
  DisplayAd,
  InFeedAd,
  MultiplexAd,
  MultiplexAd1963,
  InArticleAd2022,
  InArticleAd1100,
  InPostAd,
  InArticleAd
} from './AdSenseBanner';

/**
 * AdBanner
 * Flexible ad banner component supporting GAM / AdSense fallback, custom slots,
 * full-width responsiveness, minimum heights, and empty callbacks.
 */
export default function AdBanner({
  adClient = 'ca-pub-2108299943580613',
  adSlot = '1202522135',
  adFormat = 'rectangle, horizontal',
  fullWidthResponsive = true,
  className = '',
  fallbackGamAdId = '',
  adUnitPath = '',
  onAdEmpty,
  enableAdSenseFallback = true,
  minHeight = '100px',
  style = {},
  label = 'ADVERTISEMENT'
}) {
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
      />
    </div>
  );
}

export {
  DisplayAd,
  InFeedAd,
  MultiplexAd,
  MultiplexAd1963,
  InArticleAd2022,
  InArticleAd1100,
  InPostAd,
  InArticleAd
};
