import { useState, useCallback } from 'react';
import type { HistoryEntry } from '../types';

const STORAGE_KEY = 'url-shortener-history';

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function useUrlHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(load);

  const add = useCallback((entry: HistoryEntry) => {
    setEntries((prev) => {
      const next = [entry, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  return { entries, add, clear };
}
