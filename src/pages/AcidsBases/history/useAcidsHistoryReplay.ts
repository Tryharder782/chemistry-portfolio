import { useMemo, useState } from 'react';
import { loadAcidsHistory, type AcidsHistoryEntry, type AcidsHistorySection } from './historyStorage';

type UseAcidsHistoryReplayResult = {
  entries: AcidsHistoryEntry[];
  currentEntry: AcidsHistoryEntry | null;
  currentIndex: number;
  totalEntries: number;
  canGoBackwards: boolean;
  canGoForwards: boolean;
  goBack: () => void;
  goForward: () => void;
  statement: string[];
};

const sectionTitle = (section: AcidsHistorySection) => {
  if (section === 'introduction') return 'Introduction';
  if (section === 'buffers') return 'Buffers';
  return 'Titration';
};

export const useAcidsHistoryReplay = (
  section: AcidsHistorySection,
  enabled: boolean
): UseAcidsHistoryReplayResult => {
  const entries = useMemo(() => {
    if (!enabled) return [];
    return loadAcidsHistory(section);
  }, [enabled, section]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const totalEntries = entries.length;
  const hasEntries = totalEntries > 0;
  const boundedIndex = hasEntries ? Math.min(currentIndex, totalEntries - 1) : 0;
  const currentEntry = hasEntries ? entries[boundedIndex] : null;

  const canGoBackwards = boundedIndex > 0;
  const canGoForwards = hasEntries && boundedIndex < totalEntries - 1;

  const goBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goForward = () => {
    setCurrentIndex((prev) => {
      if (totalEntries === 0) return 0;
      return Math.min(totalEntries - 1, prev + 1);
    });
  };

  const statement = useMemo(() => {
    if (!enabled) return [];
    if (!currentEntry) {
      return [
        `No saved ${sectionTitle(section)} experiments yet.`,
        'Finish an experiment to save it here.',
        'Then use Next/Back to review your results.'
      ];
    }

    return [
      `${sectionTitle(section)} experiment ${boundedIndex + 1} of ${totalEntries}.`,
      `${currentEntry.substance} at pH ${currentEntry.pH.toFixed(2)}.`,
      'Use Next and Back to review snapshots.'
    ];
  }, [enabled, currentEntry, section, boundedIndex, totalEntries]);

  return {
    entries,
    currentEntry,
    currentIndex: boundedIndex,
    totalEntries,
    canGoBackwards,
    canGoForwards,
    goBack,
    goForward,
    statement
  };
};

export default useAcidsHistoryReplay;
