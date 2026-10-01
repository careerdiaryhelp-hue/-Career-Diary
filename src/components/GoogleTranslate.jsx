import React, { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';

export default function GoogleTranslate() {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/i);
      return match ? match[1].toLowerCase() : 'en';
    } catch (e) {
      return 'en';
    }
  });

  useEffect(() => {
    // 1. Define global Google Translate initialization callback
    window.googleTranslateElementInit = () => {
      try {
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      } catch (err) {
        console.warn('Google Translate initialization error:', err);
      }
    };

    // 2. Add Google Translate script if not already present
    const SCRIPT_ID = 'google-translate-script';
    let script = document.getElementById(SCRIPT_ID);
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }

    // 3. Actively remove/suppress Google Translate top banner & body top offset
    const suppressBanner = () => {
      if (document.body && document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
      const bannerIframes = document.querySelectorAll(
        '.goog-te-banner-frame, iframe.goog-te-banner-frame, iframe[class*="goog-te-banner-frame"], .VIpgJd-ZVi9I-OR9QNe-OR9QNe'
      );
      bannerIframes.forEach((iframe) => {
        iframe.style.setProperty('display', 'none', 'important');
        iframe.style.setProperty('visibility', 'hidden', 'important');
        iframe.style.setProperty('height', '0px', 'important');
      });
    };

    const observer = new MutationObserver(suppressBanner);
    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class'],
    });

    suppressBanner();

    // 4. Keep currentLang synced if user changes via native Google dropdown
    const interval = setInterval(() => {
      try {
        suppressBanner();
        const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/i);
        const active = match ? match[1].toLowerCase() : 'en';
        if (active !== currentLang) {
          setCurrentLang(active);
        }
      } catch (e) {}
    }, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [currentLang]);

  const switchLanguage = (langCode) => {
    setCurrentLang(langCode);

    try {
      const hostname = window.location.hostname;
      // Set googtrans cookie for domain & root path
      if (langCode === 'en') {
        document.cookie = `googtrans=/en/en; path=/; domain=${hostname}`;
        document.cookie = `googtrans=/en/en; path=/;`;
      } else {
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${hostname}`;
        document.cookie = `googtrans=/en/${langCode}; path=/;`;
      }

      // Check if native select element is available in DOM
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      } else {
        // If script hasn't fully rendered combo yet, refresh to apply cookie
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to switch language:', err);
    }
  };

  return (
    <div className="google-translate-wrapper" title="Translate Page (English / हिन्दी)">
      <div className="gt-lang-switcher">
        <Languages size={15} className="gt-icon" />
        <button
          type="button"
          className={`gt-lang-btn ${currentLang === 'en' ? 'active' : ''}`}
          onClick={() => switchLanguage('en')}
          title="Switch to English"
        >
          English
        </button>
        <span className="gt-divider">|</span>
        <button
          type="button"
          className={`gt-lang-btn ${currentLang === 'hi' ? 'active' : ''}`}
          onClick={() => switchLanguage('hi')}
          title="हिन्दी में अनुवाद करें"
        >
          हिन्दी
        </button>
      </div>

      {/* Official Google Translate element mount point */}
      <div id="google_translate_element" className="gt-widget" />
    </div>
  );
}
