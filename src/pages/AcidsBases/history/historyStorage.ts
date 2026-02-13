export type AcidsHistorySection = 'introduction' | 'buffers' | 'titration';

export type AcidsHistoryEntry = {
  date: string;
  section: AcidsHistorySection;
  pH: number;
  substance: string;
  acidType?: string;
  volume?: number;
  waterLevel?: number;
  snapshot?: Record<string, unknown>;
};

const HISTORY_CHECKPOINT_ORDER: Record<AcidsHistorySection, string[]> = {
  introduction: [
    'showPhVsMolesGraphAcid',
    'showPhVsMolesGraphBase',
    'addWeakAcid',
    'addWeakBase',
  ],
  buffers: [
    'reachedAcidBuffer',
    'acidBufferLimitReached',
    'reachedBasicBuffer',
    'baseBufferLimitReached',
  ],
  titration: [
    'titr-16',
    'titr-27',
    'titr-48',
    'titr-68',
  ],
};

const HISTORY_STORAGE_KEYS: Record<AcidsHistorySection, string> = {
  introduction: 'acidsBases.introductionHistory',
  buffers: 'acidsBases.buffersHistory',
  titration: 'acidsBases.titrationHistory',
};

const REPLAY_STORAGE_KEYS: Record<AcidsHistorySection, string> = {
  introduction: 'acidsBases.introductionReplay',
  buffers: 'acidsBases.buffersReplay',
  titration: 'acidsBases.titrationReplay',
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const normalizeEntry = (raw: unknown, section: AcidsHistorySection): AcidsHistoryEntry | null => {
  if (!raw || typeof raw !== 'object') return null;

  const item = raw as Partial<AcidsHistoryEntry> & { acidType?: string };
  const substance = typeof item.substance === 'string'
    ? item.substance
    : (typeof item.acidType === 'string' ? item.acidType : '');

  if (
    typeof item.date !== 'string'
    || !isFiniteNumber(item.pH)
    || typeof substance !== 'string'
    || substance.length === 0
  ) {
    return null;
  }

  return {
    date: item.date,
    section,
    pH: item.pH,
    substance,
    acidType: substance,
    volume: isFiniteNumber(item.volume) ? item.volume : undefined,
    waterLevel: isFiniteNumber(item.waterLevel) ? item.waterLevel : undefined,
    snapshot: item.snapshot && typeof item.snapshot === 'object'
      ? item.snapshot as Record<string, unknown>
      : undefined,
  };
};

const getCheckpointId = (entry: Pick<AcidsHistoryEntry, 'snapshot'>): string | null => {
  const snapshot = entry.snapshot as { checkpointId?: unknown } | undefined;
  if (!snapshot) return null;
  return typeof snapshot.checkpointId === 'string' && snapshot.checkpointId.length > 0
    ? snapshot.checkpointId
    : null;
};

const getCheckpointIndex = (section: AcidsHistorySection, checkpointId: string | null) => {
  if (!checkpointId) return Number.MAX_SAFE_INTEGER;
  const idx = HISTORY_CHECKPOINT_ORDER[section].indexOf(checkpointId);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
};

export const loadAcidsHistory = (section: AcidsHistorySection): AcidsHistoryEntry[] => {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEYS[section]);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeEntry(item, section))
      .filter((item): item is AcidsHistoryEntry => item !== null);
  } catch {
    return [];
  }
};

export const appendAcidsHistory = (
  section: AcidsHistorySection,
  payload: Omit<AcidsHistoryEntry, 'date' | 'section'>
) => {
  const current = loadAcidsHistory(section);
  const nextEntry: AcidsHistoryEntry = {
    date: new Date().toISOString(),
    section,
    ...payload,
    acidType: payload.substance,
  };
  const checkpointId = getCheckpointId(nextEntry);
  if (checkpointId) {
    const existingIndex = current.findIndex((entry) => getCheckpointId(entry) === checkpointId);
    const merged = existingIndex >= 0
      ? current.map((entry, index) => (index === existingIndex ? nextEntry : entry))
      : [...current, nextEntry];

    const next = merged
      .slice()
      .sort((a, b) => {
        const byCheckpoint = getCheckpointIndex(section, getCheckpointId(a)) - getCheckpointIndex(section, getCheckpointId(b));
        if (byCheckpoint !== 0) return byCheckpoint;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .slice(0, 50);

    window.localStorage.setItem(HISTORY_STORAGE_KEYS[section], JSON.stringify(next));
    return next;
  }

  const next = [nextEntry, ...current].slice(0, 50);
  window.localStorage.setItem(HISTORY_STORAGE_KEYS[section], JSON.stringify(next));
  return next;
};

export const clearAcidsHistory = (section: AcidsHistorySection) => {
  window.localStorage.setItem(HISTORY_STORAGE_KEYS[section], JSON.stringify([]));
};

export const queueLatestAcidsReplay = (section: AcidsHistorySection): AcidsHistoryEntry | null => {
  const [latest] = loadAcidsHistory(section);
  if (!latest) {
    window.localStorage.removeItem(REPLAY_STORAGE_KEYS[section]);
    return null;
  }
  window.localStorage.setItem(REPLAY_STORAGE_KEYS[section], JSON.stringify(latest));
  return latest;
};

export const consumeAcidsReplay = (section: AcidsHistorySection): AcidsHistoryEntry | null => {
  try {
    const raw = window.localStorage.getItem(REPLAY_STORAGE_KEYS[section]);
    window.localStorage.removeItem(REPLAY_STORAGE_KEYS[section]);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeEntry(parsed, section);
  } catch {
    window.localStorage.removeItem(REPLAY_STORAGE_KEYS[section]);
    return null;
  }
};
