import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { LoadingButton } from '@mui/lab';
import LinkIcon from '@mui/icons-material/Link';
import { shortenUrl } from '../services/shortener';
import type { ShortenResponse } from '../types';

interface Props {
  onSuccess: (result: ShortenResponse, originalUrl: string) => void;
}

export default function ShortenForm({ onSuccess }: Props) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError('Please enter a URL.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await shortenUrl(value.trim());
      onSuccess(result, value.trim());
      setValue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <TextField
        fullWidth
        label="Long URL"
        placeholder="https://example.com/very/long/path"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={!!error}
        helperText={error ?? ' '}
        type="url"
        size="medium"
        autoFocus
      />
      <LoadingButton
        type="submit"
        variant="contained"
        loading={loading}
        startIcon={<LinkIcon />}
        sx={{ mt: '2px', height: 56, px: 3, whiteSpace: 'nowrap' }}
      >
        Shorten
      </LoadingButton>
    </Box>
  );
}
