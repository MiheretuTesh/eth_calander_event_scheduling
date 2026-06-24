/** Represents a date in the Ethiopian calendar */
export interface EthiopianDate {
  year: number;
  month: number; // 1-13
  day: number; // 1-30 (1-5 or 1-6 for Pagume)
}

/** How often an event repeats */
export type Recurrence =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

/** A calendar event stored by the user */
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  gregorianDate: string; // "YYYY-MM-DD"
  ethiopianDate: string; // "YYYY-MM-DD" (Ethiopian)
  createdAt: string; // ISO datetime
  recurrence?: Recurrence; // defaults to 'none' when absent
  recurrenceCalendar?: ViewMode; // which calendar monthly/yearly repeats follow
}

/** A fixed holiday (same month/day every year) */
export interface FixedHoliday {
  name: string;
  month: number;
  day: number;
}

/** A moveable holiday computed relative to Ethiopian Easter */
export interface MoveableHoliday {
  name: string;
  offsetFromEaster: number; // days from Easter Sunday (negative = before)
}

/** The category of a managed holiday — determines how it resolves to a date */
export type HolidayKind =
  | 'gregorian-fixed' // Gregorian month/day
  | 'ethiopian-fixed' // Ethiopian month/day
  | 'ethiopian-gc' // Ethiopian holiday observed on a Gregorian month/day
  | 'ethiopian-moveable'; // relative to Ethiopian Easter

/** A user-editable holiday entry stored in the calendar store */
export interface ManagedHoliday {
  id: string;
  name: string;
  kind: HolidayKind;
  enabled: boolean;
  custom?: boolean; // true when added by the user
  month?: number; // for fixed kinds
  day?: number; // for fixed kinds
  offsetFromEaster?: number; // for moveable kind
}

/** Resolved holiday for display on a specific date */
export interface ResolvedHoliday {
  name: string;
  type: 'ethiopian' | 'gregorian';
}

/** A single cell in the calendar grid */
export interface GridDay {
  gregorianDate: Date;
  ethiopianDate: EthiopianDate;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/** Calendar view mode */
export type ViewMode = 'gregorian' | 'ethiopian';

/** Form data for creating/editing events */
export interface EventFormData {
  title: string;
  description: string;
  recurrence: Recurrence;
}
