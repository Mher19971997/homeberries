import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastProps {
  open: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

const Toast: React.FC<ToastProps> = ({
  open,
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = { vertical: 'top', horizontal: 'center' }
}) => {
  const alertColor: AlertColor = type;

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={position}
      sx={{ zIndex: 1500 }}
    >
      <Alert
        onClose={onClose}
        severity={alertColor}
        variant="filled"
        sx={{
          width: '100%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
