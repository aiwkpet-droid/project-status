import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ProjectInputs, ProjectMetrics } from '../types';
import { DEFAULT_INPUTS } from '../types';
import { calculateProjectMetrics } from '../utils/calculateProjectMetrics';

const STORAGE_KEY = 'project-calculator-data';

function loadFromStorage(): ProjectInputs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_INPUTS, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_INPUTS;
}

function saveToStorage(inputs: ProjectInputs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    // ignore
  }
}

export function useProjectData() {
  const [inputs, setInputs] = useState<ProjectInputs>(loadFromStorage);

  useEffect(() => {
    saveToStorage(inputs);
  }, [inputs]);

  const updateField = useCallback(<K extends keyof ProjectInputs>(
    field: K,
    value: ProjectInputs[K]
  ) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
  }, []);

  const metrics: ProjectMetrics = useMemo(
    () => calculateProjectMetrics(inputs),
    [inputs]
  );

  return { inputs, metrics, updateField, resetToDefaults };
}
