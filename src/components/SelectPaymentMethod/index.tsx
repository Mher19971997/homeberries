import React from 'react';
import { Box, Typography } from '@mui/material';
import styles from './index.module.css';
import CustomModal from '../CustomModal';
import StripePaymentForm from '../StripePaymentForm';
import PaymentIcons from '../PaymentIcons';
import { useTranslation } from 'react-i18next';

interface SelectPaymentMethodProps {
  amount?: number;
  orderUuid?: string;
  basketUuids?: string[];
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
  open?: boolean;
  onClose?: () => void;
}

const SelectPaymentMethod: React.FC<SelectPaymentMethodProps> = ({
  amount = 0,
  orderUuid,
  basketUuids,
  onPaymentSuccess,
  onPaymentError,
  open: externalOpen,
  onClose: externalOnClose,
}) => {
  const { t } = useTranslation('common');
  const [internalOpen, setInternalOpen] = React.useState<boolean>(false);

  // Используем внешний open если передан, иначе внутренний state
  const openModal = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalOpen(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    onPaymentSuccess?.(result);
    handleClose();
  };

  const handlePaymentError = (error: string) => {
    onPaymentError?.(error);
  };
  return (
    <Box>
      {externalOpen === undefined && (
        <Typography
          my={2}
          color={'primary'}
          className={styles.addCard}
          onClick={() => setInternalOpen(true)}
        >
          {t('basket.payment.selectMethod')}
        </Typography>
      )}
      <CustomModal
        width={'500px'}
        open={openModal}
        title={t('basket.payment.title')}
        handleClose={handleClose}
      >
        <Box className={styles.content}>
          {amount > 0 ? (
            <StripePaymentForm
              amount={amount}
              orderUuid={orderUuid}
              basketUuids={basketUuids}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <Typography color="text.secondary" textAlign="center">
              {t('basket.payment.noAmount')}
            </Typography>
          )}
          <Typography className={styles.cardInfoText} sx={{ mt: 2, textAlign: 'center' }}>
            {t('basket.payment.secureInfo')}
          </Typography>
        </Box>
      </CustomModal>
    </Box>
  );
};

export default SelectPaymentMethod;
