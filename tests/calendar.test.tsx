import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { EventChangeArg, DateSelectArg } from '@fullcalendar/core';
import ScheduleSection from '../src/components/ScheduleSection';
import dayjs from 'dayjs';
import { isValidEventRange } from '../src/lib/scheduleValidation';

const calendar = vi.hoisted(() => ({ props: {} as {
  eventChange: (arg: EventChangeArg) => void;
  select: (arg: DateSelectArg) => void;
} }));
vi.mock('@fullcalendar/react', async () => {
  const React = await import('react');
  return { default: React.forwardRef(function MockCalendar(props, ref) {
    React.useLayoutEffect(() => { calendar.props = props as typeof calendar.props; });
    React.useImperativeHandle(ref, () => ({ getApi: () => ({ gotoDate: () => {} }) }));
    return null;
  }) };
});
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let host: HTMLDivElement;
const update = vi.fn();
beforeEach(async () => {
  vi.clearAllMocks();
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  await act(async () => root.render(<ScheduleSection currentDate="2026-11-23" scheduleEvents={[
    { id: '1', title: 'Focus', start: '2026-11-23T09:00:00', end: '2026-11-23T10:00:00', description: 'Keep the details' },
  ]} onEventAdd={vi.fn()} onEventUpdate={update} onEventDelete={vi.fn()} />));
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

test.each([
  ['drag', '2026-11-23T11:00:00', '2026-11-23T12:00:00'],
  ['resize', '2026-11-23T09:00:00', '2026-11-23T10:30:00'],
])('%s sends new times to the planner while preserving details', (_, start, end) => {
  const revert = vi.fn();
  act(() => calendar.props.eventChange({ event: { id: '1', start: new Date(start), end: new Date(end) }, revert } as unknown as EventChangeArg));
  expect(update).toHaveBeenCalledWith({ id: '1', title: 'Focus', start, end, description: 'Keep the details' });
  expect(revert).not.toHaveBeenCalled();
});

test('rejects invalid calendar changes', () => {
  const revert = vi.fn();
  act(() => calendar.props.eventChange({ event: { id: '1', start: new Date('2026-11-23T11:00:00'), end: new Date('2026-11-23T10:00:00') }, revert } as unknown as EventChangeArg));
  expect(revert).toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
});

test('invalid event times show an error and disable Add', () => {
  act(() => calendar.props.select({ start: new Date('2026-11-23T11:00:00'), end: new Date('2026-11-23T10:00:00'), view: { calendar: { unselect: () => {} } } } as unknown as DateSelectArg));
  expect(document.querySelector('[role="alert"]')?.textContent).toContain('end after the start');
  expect([...document.querySelectorAll('button')].find(el => el.textContent === 'Add')?.disabled).toBe(true);
});


test.each([
  ['2026-11-23T10:00:00', '2026-11-23T10:00:00'],
  ['2026-11-23T11:00:00', '2026-11-23T10:00:00'],
  ['invalid', '2026-11-23T10:00:00'],
  ['2026-11-23T22:00:00', '2026-11-24T01:00:00'],
])('rejects invalid event range %s to %s', (start, end) => {
  expect(isValidEventRange(dayjs(start), dayjs(end), '2026-11-23')).toBe(false);
});
