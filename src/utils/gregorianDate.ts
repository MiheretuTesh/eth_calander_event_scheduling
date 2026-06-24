import {
  endOfMonth,
  getDay,
  addDays,
  isSameDay,
  format,
} from 'date-fns';
import type { GridDay } from '../types/calendar';
import {
  convertGregorianToEthiopian,
  convertEthiopianToGregorian,
  getEthiopianMonthDays,
} from './ethiopianDate';

// ─── Constants ─────────────────────────────────────────────────
export const GREGORIAN_MONTH_NAMES: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const WEEKDAY_NAMES: readonly string[] = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

// ─── Leap Year ─────────────────────────────────────────────────
/**
 * Determines if a Gregorian year is a leap year.
 *
 * Rule: Divisible by 4, except centuries not divisible by 400.
 *   - 2024: leap (div by 4)
 *   - 1900: NOT leap (century, not div by 400)
 *   - 2000: leap (century, div by 400)
 */
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// ─── Grid Generation ───────────────────────────────────────────
/**
 * Generates the calendar grid for a Gregorian month.
 * Returns 42 GridDay items (6 rows x 7 columns).
 */
export function getGregorianMonthGrid(year: number, month: number): GridDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = endOfMonth(firstOfMonth);
  const startDayOfWeek = getDay(firstOfMonth); // 0 = Sunday

  const today = new Date();
  const days: GridDay[] = [];

  // Calculate the start date (may be in previous month)
  const gridStart = addDays(firstOfMonth, -startDayOfWeek);

  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    const ethiopianDate = convertGregorianToEthiopian(date);
    const dateMonth = date.getMonth();

    days.push({
      gregorianDate: date,
      ethiopianDate,
      isCurrentMonth: dateMonth === month && date <= lastOfMonth && date >= firstOfMonth,
      isToday: isSameDay(date, today),
    });
  }

  return days;
}

/**
 * Generates the calendar grid for an Ethiopian month.
 * Returns 42 GridDay items (6 rows x 7 columns).
 */
export function getEthiopianMonthGrid(
  ethYear: number,
  ethMonth: number
): GridDay[] {
  const firstDayGregorian = convertEthiopianToGregorian({
    year: ethYear,
    month: ethMonth,
    day: 1,
  });
  const daysInMonth = getEthiopianMonthDays(ethYear, ethMonth);
  const startDayOfWeek = getDay(firstDayGregorian); // 0 = Sunday

  const today = new Date();
  const days: GridDay[] = [];

  const gridStart = addDays(firstDayGregorian, -startDayOfWeek);

  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    const ethiopianDate = convertGregorianToEthiopian(date);

    const isCurrentMonth =
      ethiopianDate.year === ethYear &&
      ethiopianDate.month === ethMonth &&
      ethiopianDate.day >= 1 &&
      ethiopianDate.day <= daysInMonth;

    days.push({
      gregorianDate: date,
      ethiopianDate,
      isCurrentMonth,
      isToday: isSameDay(date, today),
    });
  }

  return days;
}

// ─── Formatting ────────────────────────────────────────────────
/**
 * Formats a JS Date as "YYYY-MM-DD" string.
 */
export function formatGregorianDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parses a "YYYY-MM-DD" Gregorian date string to a Date.
 */
export function parseGregorianDateString(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns a human-readable Gregorian date label.
 */
export function formatGregorianDateLabel(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}

/**
 * Get the current Ethiopian year and month from the view reference date.
 */
export function getCurrentEthiopianYearMonth(referenceDate: Date): {
  year: number;
  month: number;
} {
  const eth = convertGregorianToEthiopian(referenceDate);
  return { year: eth.year, month: eth.month };
}

/**
 * Navigate to next/previous Ethiopian month.
 * Returns the Gregorian Date for the 1st of the target Ethiopian month.
 */
export function navigateEthiopianMonth(
  currentDate: Date,
  delta: number
): Date {
  const eth = convertGregorianToEthiopian(currentDate);
  let newMonth = eth.month + delta;
  let newYear = eth.year;

  while (newMonth > 13) {
    newMonth -= 13;
    newYear += 1;
  }
  while (newMonth < 1) {
    newMonth += 13;
    newYear -= 1;
  }

  return convertEthiopianToGregorian({ year: newYear, month: newMonth, day: 1 });
}

/**
 * Returns the span of Gregorian months an Ethiopian month covers, e.g.
 * "June – July 2026" or "December 2025 – January 2026". An Ethiopian month
 * (30 days) almost always straddles two Gregorian months.
 */
export function getGregorianSpanForEthiopianMonth(
  ethYear: number,
  ethMonth: number
): string {
  const days = getEthiopianMonthDays(ethYear, ethMonth);
  const first = convertEthiopianToGregorian({
    year: ethYear,
    month: ethMonth,
    day: 1,
  });
  const last = convertEthiopianToGregorian({
    year: ethYear,
    month: ethMonth,
    day: days,
  });

  const firstMonth = GREGORIAN_MONTH_NAMES[first.getMonth()];
  const lastMonth = GREGORIAN_MONTH_NAMES[last.getMonth()];
  const firstYear = first.getFullYear();
  const lastYear = last.getFullYear();

  if (firstMonth === lastMonth && firstYear === lastYear) {
    return `${firstMonth} ${firstYear}`;
  }
  if (firstYear === lastYear) {
    return `${firstMonth} – ${lastMonth} ${lastYear}`;
  }
  return `${firstMonth} ${firstYear} – ${lastMonth} ${lastYear}`;
}

/**
 * Get all months in a Gregorian year (0-11).
 */
export function getGregorianYearMonths(_year: number): number[] {
  return Array.from({ length: 12 }, (_, i) => i);
}

/**
 * Get all months in an Ethiopian year (1-13).
 */
export function getEthiopianYearMonths(): number[] {
  return Array.from({ length: 13 }, (_, i) => i + 1);
}
