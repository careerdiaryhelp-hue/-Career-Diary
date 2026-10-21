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
 * adShield: Protects against invalid ad execution
 */
export function canServeAds() {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname || '';
  // Always serve on production domain careerdiary.in
  if (host.includes('careerdiary.in')) {
    return true;
  }
  // Allow real ads in all non-local preview environments
  return !isLocalDev();
}

export function attachAdClickTracker() {
  // Safe no-op to prevent false-positive lockouts on touch devices
}
