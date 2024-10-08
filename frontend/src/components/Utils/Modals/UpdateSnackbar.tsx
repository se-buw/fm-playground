import React, { useState, useEffect, SyntheticEvent } from 'react';
import Alert, { AlertColor }  from '@mui/material/Alert';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';

type UpdateSnackbarProps = {
  message: string,
  severity?: AlertColor,
  visible?: boolean,
  targetDate?: string
};

const UpdateSnackbar: React.FC<UpdateSnackbarProps> = (props) => {
  const [open, setOpen] = useState(props.visible || false);
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const targetDate = new Date(props.targetDate || '1970-01-01');

  useEffect(() => {
    const currentDate = new Date();
    if (currentDate < targetDate && !manuallyClosed) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [targetDate, manuallyClosed]);

  const handleClose = (
    event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setManuallyClosed(true);
  };

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={props.severity}
          variant="standard"
          sx={{ width: '30vw' }}
        >
          <span dangerouslySetInnerHTML={{ __html: props.message }} />
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UpdateSnackbar;