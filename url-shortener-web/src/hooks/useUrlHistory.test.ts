import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlHistory } from './useUrlHistory';
import type { HistoryEntry } from '../types';

const STORAGE_KEY = 'url-shortener-history';

const makeEntry = (code: string): HistoryEntry => ({
  originalUrl: `https://example.com/${code}`,
  shortUrl: `http://localhost/short/${code}`,
  code,
  createdAt: new Date().toISOString(),
});

describe('useUrlHistory', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('starts with an empty list when storage is empty', () => {
    const { result } = renderHook(() => useUrlHistory());
    expect(result.current.entries).toEqual([]);
  });

  it('loads existing entries from localStorage on mount', () => {
    const stored = [makeEntry('abc'), makeEntry('def')];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useUrlHistory());
    expect(result.current.entries).toEqual(stored);
  });

  it('add() prepends the entry and persists to localStorage', () => {
    const { result } = renderHook(() => useUrlHistory());
    const entry = makeEntry('xyz');

    act(() => {
      result.current.add(entry);
    });

    expect(result.current.entries[0]).toEqual(entry);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as HistoryEntry[];
    expect(stored[0]).toEqual(entry);
  });

  it('clear() empties the list and removes the localStorage key', () => {
    const { result } = renderHook(() => useUrlHistory());
    act(() => result.current.add(makeEntry('aaa')));

    act(() => result.current.clear());

    expect(result.current.entries).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('handles corrupt localStorage data gracefully', () => {
    localStorage.setItem(STORAGE_KEY, '{bad json}');
    const { result } = renderHook(() => useUrlHistory());
    expect(result.current.entries).toEqual([]);
  });
});
