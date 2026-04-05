import { useState, useCallback } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import LinkIcon from '@mui/icons-material/Link';
import ShortenForm from './components/ShortenForm';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';
import { useUrlHistory } from './hooks/useUrlHistory';
import type { HistoryEntry, ShortenResponse } from './types';

export default function App() {
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const { entries, add, clear } = useUrlHistory();

  const handleSuccess = useCallback(
    (res: ShortenResponse, originalUrl: string) => {
      setResult(res);
      const entry: HistoryEntry = {
        originalUrl,
        shortUrl: `${window.location.origin}/short/${res.code}`,
        code: res.code,
        createdAt: new Date().toISOString(),
      };
      add(entry);
    },
    [add],
  );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
        <LinkIcon sx={{ fontSize: 48, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight={700} textAlign="center">
          URL Shortener
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Paste a long link and get a short, shareable URL instantly.
        </Typography>
      </Stack>

      <ShortenForm onSuccess={handleSuccess} />

      {result && <ResultCard result={result} />}

      <HistoryList entries={entries} onClear={clear} />
    </Container>
  );
}
