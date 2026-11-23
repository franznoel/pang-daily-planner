import type { Dayjs } from 'dayjs';

export function isValidEventRange(start: Dayjs | null, end: Dayjs | null, date: string): boolean {
  return !!start?.isValid() && !!end?.isValid()
    && end.isAfter(start)
    && start.format('YYYY-MM-DD') === date
    && end.format('YYYY-MM-DD') === date;
}
