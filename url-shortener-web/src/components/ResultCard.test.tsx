import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultCard from './ResultCard';

const RESULT = { short_url: 'http://localhost/short/abc123', code: 'abc123' };

describe('ResultCard', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost' },
      writable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
    });
  });

  it('renders the short URL as a link', () => {
    render(<ResultCard result={RESULT} />);
    const link = screen.getByRole('link', { name: /abc123/i });
    expect(link).toHaveAttribute('href', 'http://localhost/short/abc123');
  });

  it('renders a QR code SVG', () => {
    const { container } = render(<ResultCard result={RESULT} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('copies the short URL to clipboard on button click', async () => {
    render(<ResultCard result={RESULT} />);
    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost/short/abc123');
  });
});
