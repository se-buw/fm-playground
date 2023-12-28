import React, { useState, useEffect } from 'react';
import { Snackbar } from '@mui/material';

/**
 * Display a snackbar with a message.
 * @param {*} props
 * @returns
 */
const CustomSnackbar = ({ message, onClose }) => {
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
