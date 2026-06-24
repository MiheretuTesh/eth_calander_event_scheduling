import type { EthiopianDate } from '../types/calendar';
import { toGeez } from './geez';

// ─── Constants ─────────────────────────────────────────────────
/**
 * Julian Day Number of the Ethiopian calendar epoch.
 * This corresponds to August 29, 8 AD (Julian calendar) = Meskerem 1, Year 1 AM.
 */
const ETHIOPIAN_EPOCH = 1724221;

/** Ethiopian month names (1-indexed, index 0 unused) */
export const ETHIOPIAN_MONTH_NAMES: readonly string[] = [
  '',
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yekatit',
  'Megabit',
  'Miyazia',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagume',
];

// ─── Leap Year Logic ───────────────────────────────────────────
/**
 * Determines if an Ethiopian year is a leap year.
 *
 * Rule: An Ethiopian year Y is a leap year when Y % 4 === 3.
 * In leap years, the 13th month (Pagume) has 6 days instead of 5.
 * This means the year following a leap year starts one day later
 * in the Gregorian calendar (Sept 12 instead of Sept 11).
 *
 * Examples:
 *   - 2015 EC: 2015 % 4 = 3 → leap (Pagume has 6 days)
 *   - 2019 EC: 2019 % 4 = 3 → leap
 *   - 2018 EC: 2018 % 4 = 2 → NOT leap
 */
export function isEthiopianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

/**
 * Returns the number of days in a given Ethiopian month.
 * Months 1-12 always have 30 days.
 * Month 13 (Pagume) has 5 days normally, 6 in a leap year.
 */
export function getEthiopianMonthDays(year: number, month: number): number {
  if (month >= 1 && month <= 12) return 30;
  if (month === 13) return isEthiopianLeapYear(year) ? 6 : 5;
  throw new Error(`Invalid Ethiopian month: ${month}`);
}

/**
 * Returns the total number of days in an Ethiopian year.
 */
export function getEthiopianYearDays(year: number): number {
  return isEthiopianLeapYear(year) ? 366 : 365;
}

// ─── JDN Conversion (Ethiopian) ────────────────────────────────
/**
 * Converts an Ethiopian date to Julian Day Number.
 *
 * Formula: JDN = EPOCH + (Y-1)*365 + floor(Y/4) + (M-1)*30 + D - 1
 *
 * The floor(Y/4) accounts for leap years (every 4th year starting at Y%4==3).
 * The leap day count for years 1..Y-1 where y%4==3 equals floor(Y/4).
 */
export function ethiopianToJDN(year: number, month: number, day: number): number {
  return (
    ETHIOPIAN_EPOCH +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day -
    1
  );
}

/**
 * Converts a Julian Day Number to an Ethiopian date.
 *
 * Uses the 4-year cycle (1461 days = 3*365 + 366) to decompose the offset.
 * Within each cycle, the leap year is the 3rd year (index 2).
 *
 * Cycle layout (0-indexed day counts):
 *   Year 0: days 0–364    (365 days, not leap)
 *   Year 1: days 365–729  (365 days, not leap)
 *   Year 2: days 730–1095 (366 days, LEAP — Pagume has 6 days)
 *   Year 3: days 1096–1460 (365 days, not leap)
 */
export function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = jdn - ETHIOPIAN_EPOCH;
  const n4 = Math.floor(r / 1461);
  const remainder = r % 1461;

  let yearInCycle: number;
  let dayOfYear: number;

  if (remainder < 365) {
    yearInCycle = 0;
    dayOfYear = remainder;
  } else if (remainder < 730) {
    yearInCycle = 1;
    dayOfYear = remainder - 365;
  } else if (remainder < 1096) {
    yearInCycle = 2;
    dayOfYear = remainder - 730;
  } else {
    yearInCycle = 3;
    dayOfYear = remainder - 1096;
  }

  const year = 4 * n4 + yearInCycle + 1;
  const month = Math.floor(dayOfYear / 30) + 1;
  const day = (dayOfYear % 30) + 1;

  return { year, month, day };
}

// ─── JDN Conversion (Gregorian) ────────────────────────────────
/**
 * Converts a Gregorian date to Julian Day Number.
 * Standard algorithm from astronomical computation.
 */
export function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Converts a Julian Day Number to a Gregorian date (year, month, day).
 * Standard reverse algorithm.
 */
export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return { year, month, day };
}

// ─── Public Conversion API ─────────────────────────────────────
/**
 * Converts a JavaScript Date (Gregorian) to an Ethiopian date.
 */
export function convertGregorianToEthiopian(date: Date): EthiopianDate {
  const jdn = gregorianToJDN(
    date.getFullYear(),
    date.getMonth() + 1, // JS months are 0-indexed
    date.getDate()
  );
  return jdnToEthiopian(jdn);
}

/**
 * Converts an Ethiopian date to a JavaScript Date (Gregorian).
 */
export function convertEthiopianToGregorian(eth: EthiopianDate): Date {
  const jdn = ethiopianToJDN(eth.year, eth.month, eth.day);
  const g = jdnToGregorian(jdn);
  return new Date(g.year, g.month - 1, g.day);
}

// ─── Ethiopian Easter (Fasika) Computation ─────────────────────
/**
 * Cache for Ethiopian Easter dates (keyed by Ethiopian year).
 */
const easterCache = new Map<number, EthiopianDate>();

/**
 * Computes the Ethiopian Easter (Fasika/Tensae) date for a given Ethiopian year.
 *
 * Uses the Julian Easter (Computus) algorithm, since the Ethiopian Orthodox
 * Church follows the Alexandrian computation identical to Julian Easter.
 *
 * Steps:
 *   1. Map Ethiopian year → Gregorian year for the spring period (Y + 8)
 *   2. Compute Julian Easter using the Anonymous Gregorian Algorithm for Julian calendar
 *   3. Convert Julian date → Gregorian by adding 13 days (21st century offset)
 *   4. Convert the Gregorian date → Ethiopian date
 *
 * Verified against known Orthodox Easter dates:
 *   - 2017 EC → April 20, 2025 GC → Miyazia 12, 2017 ✓
 *   - 2018 EC → April 12, 2026 GC → Miyazia 4, 2018  ✓
 */
export function computeEthiopianEaster(ethYear: number): EthiopianDate {
  const cached = easterCache.get(ethYear);
  if (cached) return cached;

  const gregYear = ethYear + 8;

  // Julian Easter computation (Anonymous Algorithm)
  const a = gregYear % 4;
  const b = gregYear % 7;
  const c = gregYear % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const julianMonth = Math.floor((d + e + 114) / 31); // 3 = March, 4 = April
  const julianDay = ((d + e + 114) % 31) + 1;

  // Convert Julian → Gregorian by adding 13 days (valid for 1900–2099)
  const JULIAN_OFFSET = 13;
  let gregMonth = julianMonth;
  let gregDay = julianDay + JULIAN_OFFSET;

  // Days in each Gregorian month (1-indexed)
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if ((gregYear % 4 === 0 && gregYear % 100 !== 0) || gregYear % 400 === 0) {
    daysInMonth[2] = 29;
  }

  // Handle month overflow
  if (gregDay > daysInMonth[gregMonth]) {
    gregDay -= daysInMonth[gregMonth];
    gregMonth += 1;
  }

  const gregorianEaster = new Date(gregYear, gregMonth - 1, gregDay);
  const result = convertGregorianToEthiopian(gregorianEaster);

  easterCache.set(ethYear, result);
  return result;
}

/**
 * Returns the Gregorian Date for Ethiopian Easter of a given Ethiopian year.
 */
export function getEthiopianEasterGregorian(ethYear: number): Date {
  const eth = computeEthiopianEaster(ethYear);
  return convertEthiopianToGregorian(eth);
}

// ─── Formatting / Parsing ──────────────────────────────────────
/**
 * Formats an Ethiopian date as "YYYY-MM-DD" string.
 */
export function formatEthiopianDateString(eth: EthiopianDate): string {
  const y = String(eth.year).padStart(4, '0');
  const m = String(eth.month).padStart(2, '0');
  const d = String(eth.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses an Ethiopian date string "YYYY-MM-DD" into an EthiopianDate.
 */
export function parseEthiopianDateString(str: string): EthiopianDate {
  const parts = str.split('-').map(Number);
  return { year: parts[0], month: parts[1], day: parts[2] };
}

/**
 * Returns a human-readable label for an Ethiopian date, with the day and year
 * rendered in Ge'ez numerals. e.g. "Meskerem ፩, ፳፻፲፰"
 */
export function formatEthiopianDateLabel(eth: EthiopianDate): string {
  return `${ETHIOPIAN_MONTH_NAMES[eth.month]} ${toGeez(eth.day)}, ${toGeez(eth.year)}`;
}

/**
 * Gets the Ethiopian month name.
 */
export function getEthiopianMonthName(month: number): string {
  return ETHIOPIAN_MONTH_NAMES[month] || '';
}
