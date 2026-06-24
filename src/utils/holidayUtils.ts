import type { ManagedHoliday, ResolvedHoliday, ViewMode } from '../types/calendar';
import {
  convertGregorianToEthiopian,
  getEthiopianEasterGregorian,
} from './ethiopianDate';
import { addDays, isSameDay } from 'date-fns';

/**
 * Returns holidays for a given date filtered by the active view mode and the
 * user's editable holiday list (only enabled entries are considered).
 *
 * - **Gregorian mode**: Gregorian fixed holidays only.
 * - **Ethiopian mode**: Ethiopian fixed (by EC date), Ethiopian holidays
 *   observed by GC date, and moveable holidays computed from Ethiopian Easter.
 */
export function getHolidaysForDate(
  date: Date,
  viewMode: ViewMode,
  holidays: ManagedHoliday[]
): ResolvedHoliday[] {
  const resolved: ResolvedHoliday[] = [];
  const enabled = holidays.filter((h) => h.enabled);

  const gMonth = date.getMonth() + 1;
  const gDay = date.getDate();

  if (viewMode === 'gregorian') {
    for (const h of enabled) {
      if (h.kind === 'gregorian-fixed' && h.month === gMonth && h.day === gDay) {
        resolved.push({ name: h.name, type: 'gregorian' });
      }
    }
    return resolved;
  }

  // ── Ethiopian mode ──
  const eth = convertGregorianToEthiopian(date);
  const easterGregorian = getEthiopianEasterGregorian(eth.year);

  for (const h of enabled) {
    if (h.kind === 'ethiopian-fixed') {
      if (h.month === eth.month && h.day === eth.day) {
        resolved.push({ name: h.name, type: 'ethiopian' });
      }
    } else if (h.kind === 'ethiopian-gc') {
      if (h.month === gMonth && h.day === gDay) {
        resolved.push({ name: h.name, type: 'ethiopian' });
      }
    } else if (h.kind === 'ethiopian-moveable') {
      const holidayDate = addDays(easterGregorian, h.offsetFromEaster ?? 0);
      if (isSameDay(date, holidayDate)) {
        resolved.push({ name: h.name, type: 'ethiopian' });
      }
    }
  }

  return resolved;
}

/**
 * Check if a given date has any holidays for the current view mode.
 */
export function hasHoliday(
  date: Date,
  viewMode: ViewMode,
  holidays: ManagedHoliday[]
): boolean {
  return getHolidaysForDate(date, viewMode, holidays).length > 0;
}
