import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryList from './HistoryList';
import type { HistoryEntry } from '../types';

const makeEntry = (code: string, original = `https://example.com/${code}`): HistoryEntry => ({
  originalUrl: original,
  shortUrl: `http://localhost/short/${code}`,
  code,
  createdAt: '2024-01-15T10:00:00.000Z',
});

describe('HistoryList', () => {
  const onClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost' },
      writable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
    });
  });

  it('renders nothing when entries list is empty', () => {
    const { container } = render(<HistoryList entries={[]} onClear={onClear} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a row for each entry', () => {
    const entries = [makeEntry('aaa'), makeEntry('bbb')];
    render(<HistoryList entries={entries} onClear={onClear} />);
    expect(screen.getByText('https://example.com/aaa')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/bbb')).toBeInTheDocument();
  });

  it('renders short URLs as links', () => {
    render(<HistoryList entries={[makeEntry('abc')]} onClear={onClear} />);
    const link = screen.getByRole('link', { name: /abc/ });
    expect(link).toHaveAttribute('href', 'http://localhost/short/abc');
  });

  it('calls onClear when the clear button is clicked', async () => {
    render(<HistoryList entries={[makeEntry('abc')]} onClear={onClear} />);
    await userEvent.click(screen.getByRole('button', { name: /clear history/i }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('copies original URL to clipboard', async () => {
    render(<HistoryList entries={[makeEntry('abc')]} onClear={onClear} />);
    // hover over the row to reveal the copy button
    await userEvent.hover(screen.getByText('https://example.com/abc'));
    await userEvent.click(screen.getByRole('button', { name: /copy original url/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/abc');
  });
});
