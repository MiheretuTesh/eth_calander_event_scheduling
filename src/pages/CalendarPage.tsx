import { useCallback, useState } from 'react';
import { CalendarHeader } from '../components/CalendarHeader';
import { CalendarGrid } from '../components/CalendarGrid';
import { DayEventsPanel } from '../components/DayEventsPanel';
import { EventModal } from '../components/EventModal';
import { ImportDialog } from '../components/ImportDialog';
import { HolidayManagerDialog } from '../components/HolidayManagerDialog';
import { useCalendarStore } from '../store/useCalendarStore';
import { exportYearToPdf, exportMonthToPdf } from '../utils/pdfExport';
import { convertGregorianToEthiopian } from '../utils/ethiopianDate';

export function CalendarPage() {
  const { viewMode, currentDate, events, holidays } = useCalendarStore();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const handleExportYear = useCallback(() => {
    if (viewMode === 'gregorian') {
      exportYearToPdf('gregorian', currentDate.getFullYear(), events, holidays);
    } else {
      const eth = convertGregorianToEthiopian(currentDate);
      exportYearToPdf('ethiopian', eth.year, events, holidays);
    }
    setExportMenuOpen(false);
  }, [viewMode, currentDate, events, holidays]);

  const handleExportMonth = useCallback(() => {
    if (viewMode === 'gregorian') {
      exportMonthToPdf(
        'gregorian',
        currentDate.getFullYear(),
        currentDate.getMonth(),
        events,
        holidays
      );
    } else {
      const eth = convertGregorianToEthiopian(currentDate);
      exportMonthToPdf('ethiopian', eth.year, eth.month, events, holidays);
    }
    setExportMenuOpen(false);
  }, [viewMode, currentDate, events, holidays]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                Dual Calendar
              </h1>
            </div>

            <div className="relative">
              <button
                onClick={() => setExportMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                           text-gray-700 bg-white border border-gray-300 rounded-lg
                           hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export PDF
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {exportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setExportMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-44 z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={handleExportMonth}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      This month
                    </button>
                    <button
                      onClick={handleExportYear}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                    >
                      Whole year
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <CalendarHeader />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar grid */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
              <CalendarGrid />
            </div>
          </div>

          {/* Side panel */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-[140px]">
              <DayEventsPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <EventModal />
      <ImportDialog />
      <HolidayManagerDialog />
    </div>
  );
}
