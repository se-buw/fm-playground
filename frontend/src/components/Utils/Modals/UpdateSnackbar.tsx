import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

type UpdateSnackbarProps = {
  message: string,
};

const UpdateSnackbar: React.FC<UpdateSnackbarProps> = (props) => {
  const [open, setOpen] = useState(true);


  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning">
          <span dangerouslySetInnerHTML={{ __html: props.message }} />
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UpdateSnackbar;