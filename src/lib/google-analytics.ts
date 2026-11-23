export type GoogleTag = (...args: unknown[]) => void;

export function analyticsPath(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0];
  if (['/', '/login', '/status', '/shared', '/chat'].includes(path)) return path;
  const shared = path.match(/^\/view\/[^/]+(\/status|\/chat)?\/?$/);
  return shared ? `/view/shared-user${shared[1] || ''}` : '/other';
}

export function analyticsEnabled(environment: string | undefined, hostname: string, measurementId: string): boolean {
  return environment === 'production'
    && ['pang-daily-planner.web.app', 'pang-daily-planner.firebaseapp.com'].includes(hostname)
    && /^G-[A-Z0-9]+$/.test(measurementId);
}

export function createAnalyticsTracker(measurementId: string, gtag: GoogleTag, origin: string, referrer: string) {
  let initialized = false;
  let lastLocation = '';
  let initialReferrer = '';
  try {
    const url = new URL(referrer);
    initialReferrer = url.origin === origin ? origin + analyticsPath(url.pathname) : url.origin;
  } catch { /* Direct visits have no referrer. */ }

  return (pathname: string) => {
    const path = analyticsPath(pathname);
    const location = origin + path;
    if (lastLocation === location) return;
    if (!initialized) {
      gtag('js', new Date());
      gtag('config', measurementId, {
        send_page_view: false,
        page_location: location,
        page_referrer: initialReferrer,
        page_title: 'Pang Daily Planner',
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      initialized = true;
    }
    gtag('event', 'page_view', {
      send_to: measurementId,
      page_title: 'Pang Daily Planner',
      page_location: location,
      page_path: path,
      page_referrer: lastLocation || initialReferrer,
    });
    lastLocation = location;
  };
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GoogleTag;
  }
}

let track: ReturnType<typeof createAnalyticsTracker> | undefined;
export function trackPageView(measurementId: string, pathname: string) {
  if (!track) {
    window.dataLayer ??= [];
    // Preserve the Google tag's standard Arguments-based command queue.
    // eslint-disable-next-line prefer-rest-params
    window.gtag ??= function () { window.dataLayer!.push(arguments); };
    track = createAnalyticsTracker(measurementId, window.gtag, window.location.origin, document.referrer);
  }
  track(pathname);
  if (!document.getElementById('google-analytics')) {
    const script = document.createElement('script');
    script.id = 'google-analytics';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onerror = () => { script.remove(); };
    document.head.appendChild(script);
  }
}
