import { useMemo } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import { convertGregorianToEthiopian } from '../utils/ethiopianDate';

export function ImportDialog() {
  const {
    isImportDialogOpen,
    closeImportDialog,
    importPreviousYearEvents,
    viewMode,
    currentDate,
    events,
  } = useCalendarStore();

  const info = useMemo(() => {
    if (viewMode === 'gregorian') {
      const currentYear = currentDate.getFullYear();
      const previousYear = currentYear - 1;
      const count = events.filter((e) => {
        const year = parseInt(e.gregorianDate.split('-')[0], 10);
        return year === previousYear;
      }).length;
      return {
        currentLabel: `${currentYear} GC`,
        previousLabel: `${previousYear} GC`,
        count,
      };
    }
    const eth = convertGregorianToEthiopian(currentDate);
    const previousYear = eth.year - 1;
    const count = events.filter((e) => {
      const year = parseInt(e.ethiopianDate.split('-')[0], 10);
      return year === previousYear;
    }).length;
    return {
      currentLabel: `${eth.year} EC`,
      previousLabel: `${previousYear} EC`,
      count,
    };
  }, [viewMode, currentDate, events]);

  if (!isImportDialogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeImportDialog}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Import Previous Year Events
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          This will copy <strong>{info.count}</strong> event
          {info.count !== 1 ? 's' : ''} from{' '}
          <strong>{info.previousLabel}</strong> into{' '}
          <strong>{info.currentLabel}</strong>.
          Dates will be shifted by one year, respecting leap year boundaries.
        </p>

        {info.count === 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              No events found in {info.previousLabel}. Nothing to import.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={closeImportDialog}
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg
                       border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={importPreviousYearEvents}
            disabled={info.count === 0}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg
                       bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors"
          >
            Import {info.count} Event{info.count !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
