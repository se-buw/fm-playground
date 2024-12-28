import React, { useState, useEffect } from 'react';
import { Snackbar } from '@mui/material';
interface CustomSnackbarProps {
  message: string;
  onClose?: () => void;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({ message, onClose }: any) => {
  const [open, setOpen] = useState(!!message);

  useEffect(() => {
    setOpen(!!message);
  }, [message]);

  const handleSnackbarClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      onClose={handleSnackbarClose}
      autoHideDuration={2000}
      message={message}
    />
  );
};

export default CustomSnackbar;
