import type { CalendarEvent } from '../types/calendar';
import { parseGregorianDateString } from './gregorianDate';
import {
  convertGregorianToEthiopian,
  getEthiopianMonthDays,
} from './ethiopianDate';
import { differenceInCalendarDays, isSameDay, getDaysInMonth } from 'date-fns';

/**
 * Determines whether a recurring (or one-off) event occurs on a target date.
 *
 * Day/week based repeats (daily, weekly, biweekly) are calendar-agnostic.
 * Monthly / quarterly / yearly repeats follow the calendar the event was
 * created in (`recurrenceCalendar`), so an Ethiopian event repeats on the
 * Ethiopian month/day and a Gregorian one on the Gregorian month/day.
 */
export function eventOccursOn(event: CalendarEvent, date: Date): boolean {
  const anchor = parseGregorianDateString(event.gregorianDate);
  const recurrence = event.recurrence ?? 'none';

  if (recurrence === 'none') {
    return isSameDay(anchor, date);
  }

  const dayDiff = differenceInCalendarDays(date, anchor);
  if (dayDiff < 0) return false; // never before the anchor

  switch (recurrence) {
    case 'daily':
      return true;
    case 'weekly':
      return dayDiff % 7 === 0;
    case 'biweekly':
      return dayDiff % 14 === 0;
    case 'monthly':
    case 'quarterly':
    case 'yearly':
      return matchesCalendarRecurrence(event, anchor, date, recurrence);
    default:
      return false;
  }
}

function matchesCalendarRecurrence(
  event: CalendarEvent,
  anchor: Date,
  date: Date,
  recurrence: 'monthly' | 'quarterly' | 'yearly'
): boolean {
  if (event.recurrenceCalendar === 'ethiopian') {
    const a = convertGregorianToEthiopian(anchor);
    const t = convertGregorianToEthiopian(date);
    const monthDays = getEthiopianMonthDays(t.year, t.month);
    const dayMatches =
      t.day === a.day || (a.day > monthDays && t.day === monthDays);
    if (!dayMatches) return false;

    if (recurrence === 'yearly') return t.month === a.month;
    const monthDiff = (t.year - a.year) * 13 + (t.month - a.month);
    return recurrence === 'monthly' ? true : monthDiff % 3 === 0;
  }

  // Gregorian basis (default)
  const anchorDay = anchor.getDate();
  const monthDays = getDaysInMonth(date);
  const dayMatches =
    date.getDate() === anchorDay ||
    (anchorDay > monthDays && date.getDate() === monthDays);
  if (!dayMatches) return false;

  if (recurrence === 'yearly') return date.getMonth() === anchor.getMonth();
  const monthDiff =
    (date.getFullYear() - anchor.getFullYear()) * 12 +
    (date.getMonth() - anchor.getMonth());
  return recurrence === 'monthly' ? true : monthDiff % 3 === 0;
}

/** Filters events to those occurring on the given date (expanding recurrences). */
export function eventsForDate(
  events: CalendarEvent[],
  date: Date
): CalendarEvent[] {
  return events.filter((e) => eventOccursOn(e, date));
}
