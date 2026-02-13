import { runTapClick, runTapTouch } from '../../../../components/AcidsBases/hooks/tapUtils';

export type ExperimentHistoryEntry = {
  date: string;
  pH: number;
  volume: number;
  acidType: string;
};

interface ExperimentHistoryModalProps {
  isOpen: boolean;
  entries: ExperimentHistoryEntry[];
  onClose: () => void;
  onClear: () => void;
}

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString();
};

export function ExperimentHistoryModal({ isOpen, entries, onClose, onClear }: ExperimentHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[20000] bg-black/45 flex items-center justify-center p-4">
      <div className="w-full max-w-[760px] rounded-2xl bg-white shadow-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Experiment History</h2>
          <button
            onClick={(event) => runTapClick(event, onClose)}
            onTouchEnd={(event) => runTapTouch(event, onClose)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-6">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-600">
              No saved experiments yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map((entry, index) => (
                <div key={`${entry.date}-${index}`} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">{entry.acidType}</span>
                    <span>pH: {entry.pH.toFixed(2)}</span>
                    <span>Volume: {entry.volume.toFixed(3)} L</span>
                    <span className="text-gray-500">{formatDate(entry.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={(event) => runTapClick(event, onClear)}
            onTouchEnd={(event) => runTapTouch(event, onClear)}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
          >
            Clear History
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExperimentHistoryModal;
