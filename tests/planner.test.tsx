import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import dayjs from 'dayjs';
import { page } from 'vitest/browser';
import { useDailyPlanner, createEmptyState } from '../src/lib/useDailyPlanner';
import ScheduleSection from '../src/components/ScheduleSection';
import DailyPlannerPage from '../src/components/DailyPlannerPage';

vi.mock('../src/lib/AuthContext', () => {
  const user = { uid: 'test-user' };
  return { useAuth: () => ({ user }) };
});
vi.mock('../src/lib/dailyPlannerService', () => ({
  getDailyPlan: vi.fn(async () => null),
  getMostRecentDailyPlan: vi.fn(async () => null),
  getDatesWithPlans: vi.fn(async () => []),
  saveDailyPlan: vi.fn(async () => {}),
  extractIncompleteHabits: vi.fn(), extractIncompletePriorities: vi.fn(),
  hasIncompleteHabits: vi.fn(), hasIncompletePriorities: vi.fn(),
}));
import { saveDailyPlan, getDailyPlan } from '../src/lib/dailyPlannerService';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let planner: ReturnType<typeof useDailyPlanner>;
let root: Root;
let host: HTMLDivElement;
function Harness() {
  const value = useDailyPlanner();
  React.useLayoutEffect(() => { planner = value; });
  return null;
}
async function mount() {
  await act(async () => { root.render(<Harness />); });
  await vi.waitFor(() => expect(planner.loading).toBe(false));
}
async function settle() { await act(async () => { await Promise.resolve(); }); }
beforeEach(async () => {
  await page.viewport(390, 844);
  vi.clearAllMocks();
  vi.mocked(saveDailyPlan).mockResolvedValue(undefined);
  vi.mocked(getDailyPlan).mockResolvedValue(null);
  localStorage.clear();
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

test('backs up immediately and flushes edits when leaving before the debounce', async () => {
  await mount();
  act(() => planner.updateField('intention', 'Keep this draft'));
  expect(localStorage.getItem(`pang-draft-v1:test-user:${dayjs().format('YYYY-MM-DD')}`)).toContain('Keep this draft');
  await act(async () => root.unmount());
  expect(saveDailyPlan).toHaveBeenCalledWith('test-user', expect.objectContaining({ intention: 'Keep this draft' }));
  expect(localStorage.length).toBe(0);
});

test('serializes newer edits behind an in-flight save without losing the draft', async () => {
  await mount();
  let finish!: () => void;
  vi.mocked(saveDailyPlan).mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
  act(() => { planner.updateField('intention', 'first'); planner.retrySave(); });
  act(() => { planner.updateField('intention', 'second'); planner.retrySave(); });
  expect(saveDailyPlan).toHaveBeenCalledTimes(1);
  await act(async () => finish());
  expect(saveDailyPlan).toHaveBeenCalledTimes(2);
  expect(vi.mocked(saveDailyPlan).mock.calls[1][1].intention).toBe('second');
  expect(planner.pending).toBe(false);
  expect(localStorage.length).toBe(0);
});

test('retains failed drafts and retries when the connection returns', async () => {
  await mount();
  vi.mocked(saveDailyPlan).mockRejectedValueOnce(new Error('offline'));
  act(() => { planner.updateField('intention', 'offline edit'); planner.retrySave(); });
  await settle();
  expect(planner.saveError).toContain('Couldn’t save');
  expect(localStorage.length).toBe(1);
  await act(async () => { window.dispatchEvent(new Event('online')); });
  expect(planner.saveError).toBe(null);
  expect(localStorage.length).toBe(0);
});

test('restores an unsaved draft after reload', async () => {
  const draft = { ...createEmptyState(), intention: 'recovered' };
  localStorage.setItem(`pang-draft-v1:test-user:${dayjs().format('YYYY-MM-DD')}`, JSON.stringify(draft));
  await mount();
  expect(planner.state.intention).toBe('recovered');
  expect(saveDailyPlan).toHaveBeenCalledWith('test-user', expect.objectContaining({ intention: 'recovered' }));
});

test('failed loads cannot become blank overwrites; retry targets the requested date', async () => {
  await mount();
  vi.mocked(getDailyPlan).mockRejectedValueOnce(new Error('unavailable'));
  await act(async () => planner.changeDate(dayjs('2026-10-12')));
  expect(planner.loadError).toContain('Couldn’t load');
  expect(saveDailyPlan).not.toHaveBeenCalled();
  await act(async () => planner.retryLoad());
  expect(planner.state.date?.format('YYYY-MM-DD')).toBe('2026-10-12');
});

test('ignores stale date requests resolving after a later selection', async () => {
  await mount();
  let finish!: (value: null) => void;
  vi.mocked(getDailyPlan).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  let older!: Promise<void>;
  act(() => { older = planner.changeDate(dayjs('2026-10-10')); });
  await act(async () => planner.changeDate(dayjs('2026-10-11')));
  await act(async () => { finish(null); await older; });
  expect(planner.state.date?.format('YYYY-MM-DD')).toBe('2026-10-11');
});

test('calendar Add event opens a valid event dialog', async () => {
  await act(async () => root.render(<ScheduleSection currentDate="2026-11-23" scheduleEvents={[]} onEventAdd={vi.fn()} onEventUpdate={vi.fn()} onEventDelete={vi.fn()} />));
  const button = [...host.querySelectorAll('button')].find(el => el.textContent === 'Add event')!;
  act(() => button.click());
  expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Add Event');
  const add = [...document.querySelectorAll('button')].find(el => el.textContent === 'Add')!;
  expect(add.disabled).toBe(true);
});


test('mobile puts priorities and schedule before reflection and removes the AI button', async () => {
  await act(async () => root.render(<DailyPlannerPage />));
  await vi.waitFor(() => expect(host.textContent).toContain('Top Priorities'));
  const top = [...host.querySelectorAll('*')].find(el => el.textContent === 'Top Priorities')!;
  const schedule = [...host.querySelectorAll('*')].find(el => el.textContent === 'Schedule')!;
  const gratitude = [...host.querySelectorAll('*')].find(el => el.textContent === 'I am grateful for')!;
  expect(top.getBoundingClientRect().top).toBeLessThan(schedule.getBoundingClientRect().top);
  expect(schedule.getBoundingClientRect().top).toBeLessThan(gratitude.getBoundingClientRect().top);
  expect(host.textContent).not.toContain('Chat with AI');
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
});


test.each([1024, 1280, 1440])('desktop at %ipx shows schedule and priorities side by side', async (width) => {
  await page.viewport(width, 900);
  await act(async () => root.render(<DailyPlannerPage />));
  await vi.waitFor(() => expect(host.textContent).toContain('Top Priorities'));
  const priorities = [...host.querySelectorAll('*')].find(el => el.textContent === 'Top Priorities')!;
  const schedule = [...host.querySelectorAll('*')].find(el => el.textContent === 'Schedule')!;
  const priorityColumn = priorities.closest('.MuiGrid-root')!;
  const scheduleColumn = schedule.closest('.MuiGrid-root')!;
  const priorityBounds = priorityColumn.getBoundingClientRect();
  const scheduleBounds = scheduleColumn.getBoundingClientRect();
  expect(Math.abs(priorityBounds.top - scheduleBounds.top)).toBeLessThan(1);
  expect(scheduleBounds.right).toBeLessThanOrEqual(priorityBounds.left);
  expect(scheduleBounds.width).toBeGreaterThan(priorityBounds.width * 1.9);
  expect(priorityColumn.parentElement).toBe(scheduleColumn.parentElement);
  expect(scheduleBounds.width + priorityBounds.width).toBeGreaterThan(priorityColumn.parentElement!.getBoundingClientRect().width * 0.95);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
});
