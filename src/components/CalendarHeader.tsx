import { useCalendarStore } from '../store/useCalendarStore';
import {
  GREGORIAN_MONTH_NAMES,
  getCurrentEthiopianYearMonth,
  getGregorianSpanForEthiopianMonth,
} from '../utils/gregorianDate';
import { getEthiopianMonthName } from '../utils/ethiopianDate';
import { toGeez } from '../utils/geez';

export function CalendarHeader() {
  const {
    viewMode,
    setViewMode,
    currentDate,
    navigateMonth,
    goToToday,
    openImportDialog,
    openHolidayDialog,
  } = useCalendarStore();

  // Compute display title
  let title: string;
  let subtitle: string;

  if (viewMode === 'gregorian') {
    const monthName = GREGORIAN_MONTH_NAMES[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    title = `${monthName} ${year}`;

    const eth = getCurrentEthiopianYearMonth(currentDate);
    subtitle = `${getEthiopianMonthName(eth.month)} ${toGeez(eth.year)} (${eth.year}) EC`;
  } else {
    const eth = getCurrentEthiopianYearMonth(currentDate);
    title = `${getEthiopianMonthName(eth.month)} ${toGeez(eth.year)} (${eth.year}) EC`;

    // Show the full Gregorian span the Ethiopian month covers (often two months).
    subtitle = `${getGregorianSpanForEthiopianMonth(eth.year, eth.month)} GC`;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: title + navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center min-w-[200px]">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Today button */}
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300
                     text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Today
        </button>

        {/* View mode toggle */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => setViewMode('gregorian')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'gregorian'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Gregorian
          </button>
          <button
            onClick={() => setViewMode('ethiopian')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'ethiopian'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Ethiopian
          </button>
        </div>

        {/* Manage holidays button */}
        <button
          onClick={openHolidayDialog}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300
                     text-gray-700 hover:bg-gray-50 transition-colors"
          title="Edit holidays"
        >
          Holidays
        </button>

        {/* Import button */}
        <button
          onClick={openImportDialog}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300
                     text-gray-700 hover:bg-gray-50 transition-colors"
          title="Import events from previous year"
        >
          <span className="hidden sm:inline">Import Prev Year</span>
          <span className="sm:hidden">Import</span>
        </button>
      </div>
    </div>
  );
}
