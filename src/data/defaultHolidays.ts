import type { ManagedHoliday } from '../types/calendar';
import {
  ETHIOPIAN_FIXED_HOLIDAYS,
  ETHIOPIAN_GC_HOLIDAYS,
  ETHIOPIAN_MOVEABLE_HOLIDAYS,
} from './ethiopianHolidays';
import { GREGORIAN_HOLIDAYS } from './gregorianHolidays';

/**
 * Builds the default, editable holiday list from the static seed data.
 * IDs are stable (derived from kind + name + date) so re-running this and
 * merging with persisted state stays predictable.
 */
export function buildDefaultHolidays(): ManagedHoliday[] {
  const list: ManagedHoliday[] = [];

  for (const h of GREGORIAN_HOLIDAYS) {
    list.push({
      id: `gregorian-fixed:${h.month}-${h.day}:${h.name}`,
      name: h.name,
      kind: 'gregorian-fixed',
      enabled: true,
      month: h.month,
      day: h.day,
    });
  }

  for (const h of ETHIOPIAN_FIXED_HOLIDAYS) {
    list.push({
      id: `ethiopian-fixed:${h.month}-${h.day}:${h.name}`,
      name: h.name,
      kind: 'ethiopian-fixed',
      enabled: true,
      month: h.month,
      day: h.day,
    });
  }

  for (const h of ETHIOPIAN_GC_HOLIDAYS) {
    list.push({
      id: `ethiopian-gc:${h.month}-${h.day}:${h.name}`,
      name: h.name,
      kind: 'ethiopian-gc',
      enabled: true,
      month: h.month,
      day: h.day,
    });
  }

  for (const h of ETHIOPIAN_MOVEABLE_HOLIDAYS) {
    list.push({
      id: `ethiopian-moveable:${h.offsetFromEaster}:${h.name}`,
      name: h.name,
      kind: 'ethiopian-moveable',
      enabled: true,
      offsetFromEaster: h.offsetFromEaster,
    });
  }

  return list;
}
