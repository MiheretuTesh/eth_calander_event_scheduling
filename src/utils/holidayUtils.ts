import type { ResolvedHoliday } from '../types/calendar';
import { ETHIOPIAN_HOLIDAYS } from '../data/ethiopianHolidays';
import { GREGORIAN_HOLIDAYS } from '../data/gregorianHolidays';
import { convertGregorianToEthiopian } from './ethiopianDate';

/**
 * Returns all holidays that fall on a given Gregorian date.
 * Checks both Gregorian holidays (by month/day) and
 * Ethiopian holidays (by converting the date first).
 */
export function getHolidaysForDate(date: Date): ResolvedHoliday[] {
  const holidays: ResolvedHoliday[] = [];

  // Check Gregorian holidays
  const gMonth = date.getMonth() + 1; // 1-indexed
  const gDay = date.getDate();

  for (const h of GREGORIAN_HOLIDAYS) {
    if (h.month === gMonth && h.day === gDay) {
      holidays.push({ name: h.name, type: 'gregorian' });
    }
  }

  // Check Ethiopian holidays
  const eth = convertGregorianToEthiopian(date);
  for (const h of ETHIOPIAN_HOLIDAYS) {
    if (h.month === eth.month && h.day === eth.day) {
      holidays.push({ name: h.name, type: 'ethiopian' });
    }
  }

  return holidays;
}

/**
 * Check if a given date has any holidays.
 */
export function hasHoliday(date: Date): boolean {
  return getHolidaysForDate(date).length > 0;
}

/**
 * Check if a given date has an Ethiopian holiday.
 */
export function hasEthiopianHoliday(date: Date): boolean {
  return getHolidaysForDate(date).some((h) => h.type === 'ethiopian');
}

/**
 * Check if a given date has a Gregorian holiday.
 */
export function hasGregorianHoliday(date: Date): boolean {
  return getHolidaysForDate(date).some((h) => h.type === 'gregorian');
}
