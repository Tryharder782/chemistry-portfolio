import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AcidsBasesLayout from '../../../layout/AcidsBasesLayout';
import NavMenu from '../../../components/AcidsBases/navigation/NavMenu';
import AcidsHomeButton from '../../../components/AcidsBases/navigation/AcidsHomeButton';
import { type AcidsHistorySection, clearAcidsHistory, loadAcidsHistory } from './historyStorage';
import { runTapClick, runTapTouch } from '../../../components/AcidsBases/hooks/tapUtils';

type AcidsHistoryScreenProps = {
  section: AcidsHistorySection;
  title: string;
  returnPath: string;
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
};

const formatPH = (value: number) => value.toFixed(2);

export const AcidsHistoryScreen = ({ section, title, returnPath }: AcidsHistoryScreenProps) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(() => loadAcidsHistory(section));

  const sectionLabel = useMemo(() => {
    if (section === 'introduction') return 'Introduction';
    if (section === 'buffers') return 'Buffers';
    return 'Titration';
  }, [section]);

  const onClear = () => {
    clearAcidsHistory(section);
    setEntries([]);
  };

  return (
    <AcidsBasesLayout>
      <div className="h-full bg-white flex flex-col items-center">
        <div className="w-full h-full flex-1 flex flex-col px-[10px] py-[10px]">
          <NavMenu />

          <div className="w-full flex items-center justify-end gap-3 mb-4">
            <button
              type="button"
              onClick={(event) => runTapClick(event, () => navigate(returnPath))}
              onTouchEnd={(event) => runTapTouch(event, () => navigate(returnPath))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to {sectionLabel}
            </button>
            <AcidsHomeButton />
          </div>

          <div className="w-full max-w-[1080px] mx-auto flex-1 min-h-0 rounded-2xl border border-gray-200 bg-gray-50/40 p-6 overflow-y-auto">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500 mt-1">Saved experiment snapshots for {sectionLabel}</p>
              </div>
              <button
                type="button"
                onClick={(event) => runTapClick(event, onClear)}
                onTouchEnd={(event) => runTapTouch(event, onClear)}
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Clear History
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="rounded-xl bg-white p-6 text-gray-500 shadow-sm border border-gray-100">
                No saved experiments yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {entries.map((entry, index) => (
                  <div key={`${entry.date}-${index}`} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-700">
                      <span><strong>Date:</strong> {formatDateTime(entry.date)}</span>
                      <span><strong>Substance:</strong> {entry.substance}</span>
                      <span><strong>pH:</strong> {formatPH(entry.pH)}</span>
                      {typeof entry.volume === 'number' && <span><strong>Volume:</strong> {entry.volume.toFixed(3)}</span>}
                      {typeof entry.waterLevel === 'number' && <span><strong>Water:</strong> {entry.waterLevel.toFixed(3)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AcidsBasesLayout>
  );
};

export default AcidsHistoryScreen;
