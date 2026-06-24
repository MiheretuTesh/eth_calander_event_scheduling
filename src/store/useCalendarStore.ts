import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CalendarEvent,
  EthiopianDate,
  ManagedHoliday,
  Recurrence,
  ViewMode,
} from '../types/calendar';
import {
  convertGregorianToEthiopian,
  convertEthiopianToGregorian,
  formatEthiopianDateString,
  isEthiopianLeapYear,
} from '../utils/ethiopianDate';
import {
  formatGregorianDateString,
  isGregorianLeapYear,
  navigateEthiopianMonth,
} from '../utils/gregorianDate';
import { eventsForDate } from '../utils/recurrence';
import { buildDefaultHolidays } from '../data/defaultHolidays';
import { addMonths, startOfMonth } from 'date-fns';

// ─── Store State ───────────────────────────────────────────────
interface CalendarState {
  // Navigation
  viewMode: ViewMode;
  currentDate: Date; // Reference: 1st of the currently viewed month (Gregorian)
  selectedDate: Date | null;

  // Events
  events: CalendarEvent[];

  // Holidays (editable)
  holidays: ManagedHoliday[];

  // UI state
  isEventModalOpen: boolean;
  editingEvent: CalendarEvent | null;
  isImportDialogOpen: boolean;
  isHolidayDialogOpen: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  navigateMonth: (delta: number) => void;
  goToToday: () => void;
  selectDate: (date: Date | null) => void;

  addEvent: (
    title: string,
    description: string,
    date: Date,
    recurrence: Recurrence
  ) => void;
  updateEvent: (
    id: string,
    title: string,
    description: string,
    recurrence: Recurrence
  ) => void;
  deleteEvent: (id: string) => void;

  openEventModal: (event?: CalendarEvent) => void;
  closeEventModal: () => void;

  openImportDialog: () => void;
  closeImportDialog: () => void;
  importPreviousYearEvents: () => void;

  // Holiday actions
  openHolidayDialog: () => void;
  closeHolidayDialog: () => void;
  toggleHoliday: (id: string) => void;
  deleteHoliday: (id: string) => void;
  addHoliday: (holiday: Omit<ManagedHoliday, 'id' | 'enabled' | 'custom'>) => void;
  resetHolidays: () => void;

  getEventsForDate: (date: Date) => CalendarEvent[];
}

// ─── Helpers ───────────────────────────────────────────────────
function makeDateKey(date: Date): string {
  return formatGregorianDateString(date);
}

function makeEthiopianKey(eth: EthiopianDate): string {
  return formatEthiopianDateString(eth);
}

// ─── Store ─────────────────────────────────────────────────────
export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────
      viewMode: 'ethiopian',
      currentDate: (() => {
        const today = new Date();
        const eth = convertGregorianToEthiopian(today);
        return convertEthiopianToGregorian({
          year: eth.year,
          month: eth.month,
          day: 1,
        });
      })(),
      selectedDate: null,
      events: [],
      holidays: buildDefaultHolidays(),
      isEventModalOpen: false,
      editingEvent: null,
      isImportDialogOpen: false,
      isHolidayDialogOpen: false,

      // ── Navigation ─────────────────────────────────────────
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      navigateMonth: (delta) => {
        set((state) => {
          if (state.viewMode === 'gregorian') {
            return { currentDate: startOfMonth(addMonths(state.currentDate, delta)) };
          }
          // Ethiopian mode: navigate by Ethiopian months
          return { currentDate: navigateEthiopianMonth(state.currentDate, delta) };
        });
      },

      goToToday: () => {
        set((state) => {
          const today = new Date();
          if (state.viewMode === 'ethiopian') {
            // Jump to the 1st of the Ethiopian month that *today* falls in,
            // not the Gregorian month start (which lands in the prior EC month).
            const eth = convertGregorianToEthiopian(today);
            return {
              currentDate: convertEthiopianToGregorian({
                year: eth.year,
                month: eth.month,
                day: 1,
              }),
              selectedDate: today,
            };
          }
          return { currentDate: startOfMonth(today), selectedDate: today };
        });
      },

      selectDate: (date) => {
        set({ selectedDate: date });
      },

      // ── Events CRUD ────────────────────────────────────────
      addEvent: (title, description, date, recurrence) => {
        const eth = convertGregorianToEthiopian(date);
        const newEvent: CalendarEvent = {
          id: crypto.randomUUID(),
          title,
          description,
          gregorianDate: makeDateKey(date),
          ethiopianDate: makeEthiopianKey(eth),
          createdAt: new Date().toISOString(),
          recurrence,
          recurrenceCalendar: get().viewMode,
        };
        set((state) => ({
          events: [...state.events, newEvent],
          isEventModalOpen: false,
          editingEvent: null,
        }));
      },

      updateEvent: (id, title, description, recurrence) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, title, description, recurrence } : e
          ),
          isEventModalOpen: false,
          editingEvent: null,
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      // ── Modal ──────────────────────────────────────────────
      openEventModal: (event) => {
        set({
          isEventModalOpen: true,
          editingEvent: event ?? null,
        });
      },

      closeEventModal: () => {
        set({ isEventModalOpen: false, editingEvent: null });
      },

      // ── Import ─────────────────────────────────────────────
      openImportDialog: () => {
        set({ isImportDialogOpen: true });
      },

      closeImportDialog: () => {
        set({ isImportDialogOpen: false });
      },

      importPreviousYearEvents: () => {
        const { viewMode, currentDate, events } = get();

        let newEvents: CalendarEvent[] = [];

        if (viewMode === 'gregorian') {
          const currentYear = currentDate.getFullYear();
          const previousYear = currentYear - 1;

          const previousYearEvents = events.filter((e) => {
            const year = parseInt(e.gregorianDate.split('-')[0], 10);
            return year === previousYear;
          });

          newEvents = previousYearEvents.map((e) => {
            const [, m, d] = e.gregorianDate.split('-').map(Number);
            let newDay = d;

            // Handle Feb 29 → Feb 28 if current year is not leap
            if (m === 2 && d === 29 && !isGregorianLeapYear(currentYear)) {
              newDay = 28;
            }

            const newGregorianDate = new Date(currentYear, m - 1, newDay);
            const newEthDate = convertGregorianToEthiopian(newGregorianDate);

            return {
              id: crypto.randomUUID(),
              title: e.title,
              description: e.description,
              gregorianDate: formatGregorianDateString(newGregorianDate),
              ethiopianDate: formatEthiopianDateString(newEthDate),
              createdAt: new Date().toISOString(),
              recurrence: e.recurrence,
              recurrenceCalendar: e.recurrenceCalendar,
            };
          });
        } else {
          // Ethiopian mode
          const ethDate = convertGregorianToEthiopian(currentDate);
          const currentEthYear = ethDate.year;
          const previousEthYear = currentEthYear - 1;

          const previousYearEvents = events.filter((e) => {
            const year = parseInt(e.ethiopianDate.split('-')[0], 10);
            return year === previousEthYear;
          });

          newEvents = previousYearEvents.map((e) => {
            const [, m, d] = e.ethiopianDate.split('-').map(Number);
            let newDay = d;

            // Handle Pagume 6 → Pagume 5 if current year is not leap
            if (m === 13 && d === 6 && !isEthiopianLeapYear(currentEthYear)) {
              newDay = 5;
            }

            const newEthDate: EthiopianDate = {
              year: currentEthYear,
              month: m,
              day: newDay,
            };
            const newGregorianDate = convertEthiopianToGregorian(newEthDate);

            return {
              id: crypto.randomUUID(),
              title: e.title,
              description: e.description,
              gregorianDate: formatGregorianDateString(newGregorianDate),
              ethiopianDate: formatEthiopianDateString(newEthDate),
              createdAt: new Date().toISOString(),
              recurrence: e.recurrence,
              recurrenceCalendar: e.recurrenceCalendar,
            };
          });
        }

        set((state) => ({
          events: [...state.events, ...newEvents],
          isImportDialogOpen: false,
        }));
      },

      // ── Holidays ───────────────────────────────────────────
      openHolidayDialog: () => {
        set({ isHolidayDialogOpen: true });
      },

      closeHolidayDialog: () => {
        set({ isHolidayDialogOpen: false });
      },

      toggleHoliday: (id) => {
        set((state) => ({
          holidays: state.holidays.map((h) =>
            h.id === id ? { ...h, enabled: !h.enabled } : h
          ),
        }));
      },

      deleteHoliday: (id) => {
        set((state) => ({
          holidays: state.holidays.filter((h) => h.id !== id),
        }));
      },

      addHoliday: (holiday) => {
        const newHoliday: ManagedHoliday = {
          ...holiday,
          id: crypto.randomUUID(),
          enabled: true,
          custom: true,
        };
        set((state) => ({ holidays: [...state.holidays, newHoliday] }));
      },

      resetHolidays: () => {
        set({ holidays: buildDefaultHolidays() });
      },

      // ── Query ──────────────────────────────────────────────
      getEventsForDate: (date) => {
        return eventsForDate(get().events, date);
      },
    }),
    {
      name: 'calendar-storage',
      // Serialize Date objects to strings for localStorage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Rehydrate Date objects
          if (parsed?.state) {
            // Delete viewMode and currentDate so we default to Ethiopian and current month on app start
            delete parsed.state.viewMode;
            delete parsed.state.currentDate;
            if (parsed.state.selectedDate) {
              parsed.state.selectedDate = new Date(parsed.state.selectedDate);
            }
          }
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      // Only persist these keys
      partialize: (state) =>
        ({
          events: state.events,
          holidays: state.holidays,
        }) as unknown as CalendarState,
    }
  )
);
