import AiChat from '@homeberris/components/AiChat';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

export const CarAiDialog = ({ open, onClose, car }: any) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        AI-консультант по {car.title}
      </DialogTitle>

      <DialogContent>
        <AiChat car={car} />
      </DialogContent>
    </Dialog>
  );
};
