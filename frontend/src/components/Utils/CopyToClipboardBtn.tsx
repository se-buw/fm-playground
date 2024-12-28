import { useState } from 'react';
import { useAtom } from 'jotai';
import { Snackbar } from '@mui/material';
import { FaShareNodes } from 'react-icons/fa6';
import { permalinkAtom } from '@/atoms';
import '@/assets/style/Playground.css';

const CopyToClipboardBtn = () => {
  const [open, setOpen] = useState(false);
  const [snackbarPosition] = useState<{ vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' }>({
    vertical: 'top',
    horizontal: 'center',
  });
  const [snackbarMessage, setSnackbarMessage] = useState('Copied to clipboard');
  const [permalink] = useAtom(permalinkAtom);

  const handleCopyClick = async () => {
    try {
      setOpen(true);
      await navigator.clipboard.writeText(
        `${window.location.origin}/?check=${permalink.check}&p=${permalink.permalink}`
      );
    } catch (err) {
      setSnackbarMessage('Failed to copy to clipboard');
    }
  };

  const handleSnackbarClose = () => {
    setOpen(false);
  };

  return (
    <>
      <FaShareNodes role='button' className='playground-icon' onClick={handleCopyClick} />

      <Snackbar
        anchorOrigin={snackbarPosition}
        open={open}
        onClose={handleSnackbarClose}
        autoHideDuration={2000}
        message={snackbarMessage}
      />
    </>
  );
};

export default CopyToClipboardBtn;
