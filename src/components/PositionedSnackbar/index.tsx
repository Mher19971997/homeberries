import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';

interface PositionedSnackbarProps {
  open: boolean;
  message: string;
  handleClose: () => void;
}

const PositionedSnackbar: React.FC<PositionedSnackbarProps> = ({
  open = false,
  message,
  handleClose
}) => {
  return (
    <Snackbar
      sx={{ zIndex: `1500 !important` }} // Adjust this value to your desired z-index
      autoHideDuration={1500}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      onClose={handleClose}
      message={message}
      key={'top' + 'center'}
    />
  );
};
export default PositionedSnackbar;
