import { useState, useCallback } from 'react';
import type { ProjectInputs, ProjectMetrics, ProjectHistoryRecord } from '../types';
import {
  loadHistory,
  saveHistory,
  createHistoryRecord,
  deleteRecord,
  clearAllHistory,
} from '../utils/historyStorage';
import { exportProjectHistoryToExcel } from '../utils/exportProjectHistoryToExcel';

export function useProjectHistory() {
  const [history, setHistory] = useState<ProjectHistoryRecord[]>(loadHistory);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addSnapshot = useCallback((
    inputs: ProjectInputs,
    metrics: ProjectMetrics,
    note?: string
  ) => {
    const record = createHistoryRecord(inputs, metrics, note);
    setHistory(prev => {
      const updated = [...prev, record];
      saveHistory(updated);
      return updated;
    });
    showNotification('Розрахунок збережено в історію проєкту.');
  }, [showNotification]);

  const removeRecord = useCallback((id: string) => {
    if (!window.confirm('Видалити цей розрахунок з історії?')) return;
    setHistory(prev => {
      const updated = deleteRecord(prev, id);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    if (!window.confirm('Ви впевнені, що хочете очистити всю фінансову історію проєкту?')) return;
    clearAllHistory();
    setHistory([]);
  }, []);

  const exportToExcel = useCallback(() => {
    if (history.length === 0) {
      showNotification('Немає збережених розрахунків для експорту.');
      return;
    }
    exportProjectHistoryToExcel(history);
    showNotification('Excel-файл з фінансовою історією створено.');
  }, [history, showNotification]);

  return {
    history,
    notification,
    addSnapshot,
    removeRecord,
    clearAll,
    exportToExcel,
  };
}
