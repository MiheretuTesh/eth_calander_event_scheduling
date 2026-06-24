import type { FixedHoliday } from '../types/calendar';

/**
 * International / global Gregorian holidays.
 * Shown only when the calendar is in Gregorian view mode.
 */
export const GREGORIAN_HOLIDAYS: FixedHoliday[] = [
  // January
  { name: 'New Year\'s Day', month: 1, day: 1 },
  { name: 'Martin Luther King Jr. Day (approx)', month: 1, day: 20 },

  // February
  { name: 'Valentine\'s Day', month: 2, day: 14 },

  // March
  { name: 'International Women\'s Day', month: 3, day: 8 },

  // April
  { name: 'Earth Day', month: 4, day: 22 },

  // May
  { name: 'International Workers\' Day', month: 5, day: 1 },
  { name: 'Mother\'s Day (approx)', month: 5, day: 11 },

  // June
  { name: 'World Environment Day', month: 6, day: 5 },
  { name: 'Father\'s Day (approx)', month: 6, day: 15 },

  // July
  { name: 'Independence Day (US)', month: 7, day: 4 },

  // September
  { name: 'International Peace Day', month: 9, day: 21 },

  // October
  { name: 'World Teachers\' Day', month: 10, day: 5 },
  { name: 'United Nations Day', month: 10, day: 24 },

  // November
  { name: 'Thanksgiving (US, approx)', month: 11, day: 27 },

  // December
  { name: 'World AIDS Day', month: 12, day: 1 },
  { name: 'Human Rights Day', month: 12, day: 10 },
  { name: 'Christmas Day', month: 12, day: 25 },
  { name: 'New Year\'s Eve', month: 12, day: 31 },
];
