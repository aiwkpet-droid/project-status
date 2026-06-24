import type { ProjectInputs, ProjectMetrics, ProjectHistoryRecord } from '../types';
import { STATUS_LABELS } from '../types';

const HISTORY_STORAGE_KEY = 'project-profitability-calculator-history';

export function loadHistory(): ProjectHistoryRecord[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveHistory(records: ProjectHistoryRecord[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function createHistoryRecord(
  inputs: ProjectInputs,
  metrics: ProjectMetrics,
  note?: string
): ProjectHistoryRecord {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    note: note || undefined,
    inputs: { ...inputs },
    metrics: {
      ...metrics,
      projectStatusLabel: STATUS_LABELS[metrics.status],
    },
  };
}

export function deleteRecord(records: ProjectHistoryRecord[], id: string): ProjectHistoryRecord[] {
  const updated = records.filter(r => r.id !== id);
  saveHistory(updated);
  return updated;
}

export function clearAllHistory(): void {
  saveHistory([]);
}
