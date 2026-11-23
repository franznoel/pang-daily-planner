import { expect, test, vi } from 'vitest';
import { analyticsEnabled, analyticsPath, createAnalyticsTracker, trackPageView } from '../src/lib/google-analytics';

const origin = 'https://pang-daily-planner.web.app';
const id = 'G-YSWXDLP329';

test('tracking is limited to production planner hosts with a valid measurement ID', () => {
  expect(analyticsEnabled('production', 'pang-daily-planner.web.app', id)).toBe(true);
  expect(analyticsEnabled('production', 'pang-daily-planner.firebaseapp.com', id)).toBe(true);
  expect(analyticsEnabled('development', 'pang-daily-planner.web.app', id)).toBe(false);
  expect(analyticsEnabled('production', 'localhost', id)).toBe(false);
  expect(analyticsEnabled('production', 'pang-daily-planner--pr-1.web.app', id)).toBe(false);
  expect(analyticsEnabled('production', 'pang-daily-planner.web.app', '')).toBe(false);
});

test.each([
  ['/view/private-user-id', '/view/shared-user'],
  ['/view/private-user-id/status?email=private@example.com#notes', '/view/shared-user/status'],
  ['/view/private-user-id/chat', '/view/shared-user/chat'],
  ['/?search=private text', '/'],
  ['/unknown/private-text', '/other'],
])('sanitizes %s', (path, expected) => expect(analyticsPath(path)).toBe(expected));

test('initializes once and sends one page view per route change', () => {
  const gtag = vi.fn();
  const track = createAnalyticsTracker(id, gtag, origin, 'https://example.com/private?email=secret');
  track('/'); track('/'); track('/status'); track('/status'); track('/');
  expect(gtag.mock.calls.filter(call => call[0] === 'config')).toHaveLength(1);
  expect(gtag.mock.calls.filter(call => call[0] === 'event')).toHaveLength(3);
  expect(gtag).toHaveBeenCalledWith('config', id, expect.objectContaining({ send_page_view: false, allow_google_signals: false }));
  expect(gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({ page_location: origin + '/', page_referrer: 'https://example.com' }));
  expect(gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({ page_location: origin + '/status', page_referrer: origin + '/' }));
  expect(JSON.stringify(gtag.mock.calls)).not.toContain('secret');
});

test('shared-user IDs and query values never reach event payloads or referrers', () => {
  const gtag = vi.fn();
  const track = createAnalyticsTracker(id, gtag, origin, origin + '/view/private-owner?email=private-email');
  track('/view/private-owner/status?note=private-note'); track('/');
  const calls = JSON.stringify(gtag.mock.calls);
  for (const privateValue of ['private-owner', 'private-email', 'private-note']) expect(calls).not.toContain(privateValue);
});


test('queues the standard Google tag commands before loading its async script', () => {
  const previousGtag = window.gtag;
  const previousLayer = window.dataLayer;
  window.gtag = undefined;
  window.dataLayer = [];
  const append = vi.spyOn(document.head, 'appendChild').mockImplementation(node => node);
  try {
    trackPageView(id, '/');
    const commands = window.dataLayer.map(command => Array.from(command as IArguments));
    expect(commands.map(command => command[0])).toEqual(['js', 'config', 'event']);
    expect(commands[1][1]).toBe(id);
    const script = append.mock.calls[0][0] as HTMLScriptElement;
    expect(script.async).toBe(true);
    expect(script.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${id}`);
  } finally {
    append.mockRestore();
    window.gtag = previousGtag;
    window.dataLayer = previousLayer;
  }
});
