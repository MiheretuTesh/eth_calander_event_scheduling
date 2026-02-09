import type { Holiday } from '../types/calendar';

/**
 * International / global Gregorian holidays.
 * Dates are in Gregorian calendar (month/day).
 */
export const GREGORIAN_HOLIDAYS: Holiday[] = [
  // January
  { name: 'New Year\'s Day', month: 1, day: 1, type: 'gregorian' },
  { name: 'Martin Luther King Jr. Day (approx)', month: 1, day: 20, type: 'gregorian' },

  // February
  { name: 'Valentine\'s Day', month: 2, day: 14, type: 'gregorian' },

  // March
  { name: 'International Women\'s Day', month: 3, day: 8, type: 'gregorian' },

  // April
  { name: 'Earth Day', month: 4, day: 22, type: 'gregorian' },

  // May
  { name: 'International Workers\' Day', month: 5, day: 1, type: 'gregorian' },
  { name: 'Mother\'s Day (approx)', month: 5, day: 11, type: 'gregorian' },

  // June
  { name: 'Father\'s Day (approx)', month: 6, day: 15, type: 'gregorian' },
  { name: 'World Environment Day', month: 6, day: 5, type: 'gregorian' },

  // July
  { name: 'Independence Day (US)', month: 7, day: 4, type: 'gregorian' },

  // September
  { name: 'International Peace Day', month: 9, day: 21, type: 'gregorian' },

  // October
  { name: 'World Teachers\' Day', month: 10, day: 5, type: 'gregorian' },
  { name: 'United Nations Day', month: 10, day: 24, type: 'gregorian' },

  // November
  { name: 'Thanksgiving (US, approx)', month: 11, day: 27, type: 'gregorian' },

  // December
  { name: 'World AIDS Day', month: 12, day: 1, type: 'gregorian' },
  { name: 'Human Rights Day', month: 12, day: 10, type: 'gregorian' },
  { name: 'Christmas Day', month: 12, day: 25, type: 'gregorian' },
  { name: 'New Year\'s Eve', month: 12, day: 31, type: 'gregorian' },
];
