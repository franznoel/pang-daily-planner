'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { firebaseConfig } from '@/lib/firebase-config';
import { analyticsEnabled, trackPageView } from '@/lib/google-analytics';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const measurementId = firebaseConfig.measurementId;

  useEffect(() => {
    if (!pathname || !analyticsEnabled(process.env.NODE_ENV, window.location.hostname, measurementId)) return;
    trackPageView(measurementId, pathname);
  }, [pathname, measurementId]);

  return null;
}
