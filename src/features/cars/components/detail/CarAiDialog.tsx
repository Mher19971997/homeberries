import AiChat from '@homeberris/components/AiChat';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useTranslation } from 'next-i18next';

export const CarAiDialog = ({ open, onClose, car }: any) => {
  const { t } = useTranslation('common');
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {t('carAiDialog.title')} {car.title}
      </DialogTitle>

      <DialogContent>
        <AiChat car={car} />
      </DialogContent>
    </Dialog>
  );
};
