import React, { useEffect } from 'react';
import { Modal, Box, Typography } from '@mui/material';
import IClose from '@homeberris/components/Icons/IClose';
import styles from '@homeberris/components/CustomModal/index.module.css';

interface CustomModalProps {
  open: boolean;
  title: string;
  width?: number | string;
  handleClose: () => void;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = (props) => {
  const { open, title, width, handleClose, children } =
    props as CustomModalProps;

  // Блокируем скролл при открытии модалки
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'absolute',
          zIndex: 1000000000,
          background: '#FFFFFF',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width
        }}
        className={styles.modelBody}
      >
        <Box className={styles.modalContent}>
          <Typography
            id='modal-modal-title'
            variant='h6'
            component='h2'
            color='warning'
            fontWeight={'bold'}
          >
            {title}
          </Typography>
          <button className={styles.closeBtn} onClick={handleClose}>
            <IClose color={'black'} />
          </button>
        </Box>
        {children}
      </Box>
    </Modal>
  );
};

export default CustomModal;
