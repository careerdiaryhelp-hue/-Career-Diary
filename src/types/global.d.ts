/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  interface Window {
    adsbygoogle?: any;
    google?: any;
    googleTranslateElementInit?: any;
    google_ad_client?: string;
    googletag?: any;
    __gamServicesEnabled?: boolean;
  }

  namespace JSX {
    interface IntrinsicElements {
      marquee: any;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        marquee: any;
      }
    }
  }
}
