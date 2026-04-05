import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { QRCodeSVG } from 'qrcode.react';
import type { ShortenResponse } from '../types';

interface Props {
  result: ShortenResponse;
}

export default function ResultCard({ result }: Props) {
  const [copied, setCopied] = useState(false);
  const shortUrl = `${window.location.origin}/short/${result.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl).then(() => setCopied(true));
  };

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Your short URL
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Typography
            variant="h6"
            component="a"
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ flexGrow: 1, wordBreak: 'break-all', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {shortUrl}
          </Typography>
          <Tooltip title="Copy to clipboard">
            <IconButton onClick={handleCopy} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <QRCodeSVG value={shortUrl} size={160} />
        </Box>
      </CardContent>

      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Copied!
        </Alert>
      </Snackbar>
    </Card>
  );
}
