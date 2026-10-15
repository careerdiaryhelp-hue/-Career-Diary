/**
 * adShield: Protects against Invalid Bot Traffic (IBT) and click-bombing
 */
export function canServeAds() {
  if (typeof window === 'undefined') return true;
  try {
    const clicks = parseInt(sessionStorage.getItem('ad_click_count') || '0', 10);
    if (clicks >= 6) return false; // Prevent click-bombing ban
  } catch (_) {}
  return true;
}

export function attachAdClickTracker() {
  if (typeof window === 'undefined') return;
  try {
    window.addEventListener('blur', () => {
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
        const clicks = parseInt(sessionStorage.getItem('ad_click_count') || '0', 10);
        sessionStorage.setItem('ad_click_count', String(clicks + 1));
      }
    });
  } catch (_) {}
}
