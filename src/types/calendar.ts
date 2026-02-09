/** Represents a date in the Ethiopian calendar */
export interface EthiopianDate {
  year: number;
  month: number; // 1-13
  day: number; // 1-30 (1-5 or 1-6 for Pagume)
}

/** A calendar event stored by the user */
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  gregorianDate: string; // "YYYY-MM-DD"
  ethiopianDate: string; // "YYYY-MM-DD" (Ethiopian)
  createdAt: string; // ISO datetime
}

/** A holiday definition */
export interface Holiday {
  name: string;
  month: number;
  day: number;
  type: 'ethiopian' | 'gregorian';
}

/** Resolved holiday for a specific Gregorian date */
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
}
