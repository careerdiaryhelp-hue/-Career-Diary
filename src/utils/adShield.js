export function isLocalDev() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname || '';
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('172.') ||
    host.startsWith('10.') ||
    host.endsWith('.local')
  );
}

/**
 * adShield: Protects against Invalid Bot Traffic (IBT) and click-bombing
 */
export function canServeAds() {
  if (typeof window === 'undefined') return true;
  // Never fire real AdSense requests on local development environments (causes HTTP 400 Bad Request)
  if (isLocalDev()) return false;
  try {
    const clicks = parseInt(sessionStorage.getItem('ad_click_count') || '0', 10);
    if (clicks >= 20) return false; // Prevent massive click-bombing ban
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
