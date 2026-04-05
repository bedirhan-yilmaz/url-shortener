import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import type { HistoryEntry } from '../types';

interface Props {
  entries: HistoryEntry[];
  onClear: () => void;
}

export default function HistoryList({ entries, onClear }: Props) {
  const [copied, setCopied] = useState(false);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  if (entries.length === 0) return null;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(() => setCopied(true));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">History</Typography>
        <Tooltip title="Clear history">
          <IconButton size="small" onClick={onClear} color="error">
            <DeleteSweepIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Original URL</TableCell>
              <TableCell>Short URL</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => {
              const shortUrl = `${window.location.origin}/short/${entry.code}`;
              return (
                <TableRow key={entry.code + entry.createdAt} hover>
                  <TableCell
                    sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onMouseEnter={() => setHoveredCode(entry.code)}
                    onMouseLeave={() => setHoveredCode(null)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title={entry.originalUrl}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0 }}>
                          {entry.originalUrl}
                        </span>
                      </Tooltip>
                      <Tooltip title="Copy original URL">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(entry.originalUrl)}
                          sx={{ visibility: hoveredCode === entry.code ? 'visible' : 'hidden', flexShrink: 0 }}
                        >
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Link href={shortUrl} target="_blank" rel="noopener noreferrer">
                      {shortUrl}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Copied!
        </Alert>
      </Snackbar>
    </Box>
  );
}
