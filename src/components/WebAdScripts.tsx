'use client';

import { useEffect } from 'react';
import { attachAdClickTracker } from '../utils/adShield';

export default function WebAdScripts() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    attachAdClickTracker();
  }, []);

  return null;
}
