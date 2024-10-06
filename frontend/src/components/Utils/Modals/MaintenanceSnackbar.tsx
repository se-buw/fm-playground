import * as React from 'react';

import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const MAINTENANCE_MSG = import.meta.env.VITE_FMP_MAINTENANCE_MESSAGE

const MaintenanceSnackbar = () => {
  const [open, setOpen] = React.useState(!!MAINTENANCE_MSG);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
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
          severity="warning"
          variant="standard"
          sx={{ width: '40vw' }}
        >
          <span dangerouslySetInnerHTML={{ __html: MAINTENANCE_MSG }} />
        </Alert>
      </Snackbar>
    </div>
  );
}

export default MaintenanceSnackbar;