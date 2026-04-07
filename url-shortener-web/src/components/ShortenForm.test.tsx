import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShortenForm from './ShortenForm';

vi.mock('../services/shortener', () => ({
  shortenUrl: vi.fn(),
}));

import { shortenUrl } from '../services/shortener';

describe('ShortenForm', () => {
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the URL input and submit button', () => {
    render(<ShortenForm onSuccess={onSuccess} />);
    expect(screen.getByLabelText(/long url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shorten/i })).toBeInTheDocument();
  });

  it('shows validation error when submitted with empty input', async () => {
    render(<ShortenForm onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole('button', { name: /shorten/i }));
    expect(screen.getByText(/please enter a url/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls shortenUrl and onSuccess on valid submission', async () => {
    const mockResult = { short_url: 'http://localhost/short/xyz', code: 'xyz' };
    vi.mocked(shortenUrl).mockResolvedValue(mockResult);

    render(<ShortenForm onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/long url/i), 'https://example.com');
    await userEvent.click(screen.getByRole('button', { name: /shorten/i }));

    await waitFor(() => {
      expect(shortenUrl).toHaveBeenCalledWith('https://example.com');
      expect(onSuccess).toHaveBeenCalledWith(mockResult, 'https://example.com');
    });
  });

  it('clears the input after successful submission', async () => {
    vi.mocked(shortenUrl).mockResolvedValue({ short_url: '', code: 'x' });

    render(<ShortenForm onSuccess={onSuccess} />);
    const input = screen.getByLabelText(/long url/i);
    await userEvent.type(input, 'https://example.com');
    await userEvent.click(screen.getByRole('button', { name: /shorten/i }));

    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('shows error message returned by the service', async () => {
    vi.mocked(shortenUrl).mockRejectedValue(new Error('Invalid URL'));

    render(<ShortenForm onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/long url/i), 'https://bad.example');
    await userEvent.click(screen.getByRole('button', { name: /shorten/i }));

    await waitFor(() => expect(screen.getByText('Invalid URL')).toBeInTheDocument());
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows fallback error for non-Error rejections', async () => {
    vi.mocked(shortenUrl).mockRejectedValue('boom');

    render(<ShortenForm onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/long url/i), 'https://example.com');
    await userEvent.click(screen.getByRole('button', { name: /shorten/i }));

    await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument());
  });
});
