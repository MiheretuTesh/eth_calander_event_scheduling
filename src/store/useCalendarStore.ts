import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarEvent, EthiopianDate, ViewMode } from '../types/calendar';
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
import { addMonths, startOfMonth } from 'date-fns';

// ─── Store State ───────────────────────────────────────────────
interface CalendarState {
  // Navigation
  viewMode: ViewMode;
  currentDate: Date; // Reference: 1st of the currently viewed month (Gregorian)
  selectedDate: Date | null;

  // Events
  events: CalendarEvent[];

  // UI state
  isEventModalOpen: boolean;
  editingEvent: CalendarEvent | null;
  isImportDialogOpen: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  navigateMonth: (delta: number) => void;
  goToToday: () => void;
  selectDate: (date: Date | null) => void;

  addEvent: (title: string, description: string, date: Date) => void;
  updateEvent: (id: string, title: string, description: string) => void;
  deleteEvent: (id: string) => void;

  openEventModal: (event?: CalendarEvent) => void;
  closeEventModal: () => void;

  openImportDialog: () => void;
  closeImportDialog: () => void;
  importPreviousYearEvents: () => void;

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
      viewMode: 'gregorian',
      currentDate: startOfMonth(new Date()),
      selectedDate: null,
      events: [],
      isEventModalOpen: false,
      editingEvent: null,
      isImportDialogOpen: false,

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
        set({ currentDate: startOfMonth(new Date()), selectedDate: new Date() });
      },

      selectDate: (date) => {
        set({ selectedDate: date });
      },

      // ── Events CRUD ────────────────────────────────────────
      addEvent: (title, description, date) => {
        const eth = convertGregorianToEthiopian(date);
        const newEvent: CalendarEvent = {
          id: crypto.randomUUID(),
          title,
          description,
          gregorianDate: makeDateKey(date),
          ethiopianDate: makeEthiopianKey(eth),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          events: [...state.events, newEvent],
          isEventModalOpen: false,
          editingEvent: null,
        }));
      },

      updateEvent: (id, title, description) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, title, description } : e
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
            };
          });
        }

        set((state) => ({
          events: [...state.events, ...newEvents],
          isImportDialogOpen: false,
        }));
      },

      // ── Query ──────────────────────────────────────────────
      getEventsForDate: (date) => {
        const key = makeDateKey(date);
        return get().events.filter((e) => e.gregorianDate === key);
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
            if (parsed.state.currentDate) {
              parsed.state.currentDate = new Date(parsed.state.currentDate);
            }
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
          viewMode: state.viewMode,
          currentDate: state.currentDate,
          events: state.events,
        }) as unknown as CalendarState,
    }
  )
);
