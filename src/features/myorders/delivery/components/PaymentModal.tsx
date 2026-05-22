import SelectPaymentMethod from '@homeberris/components/SelectPaymentMethod';
import { OrderItem } from '@homeberris/http/orderApi';

interface Props {
  order: OrderItem | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (err: string) => void;
}

export const PaymentModal = ({
  order,
  onClose,
  onSuccess,
  onError
}: Props) => {
  if (!order) return null;

  return (
    <SelectPaymentMethod
      amount={order.price * 100}
      orderUuid={order.uuid}
      open
      onClose={onClose}
      onPaymentSuccess={onSuccess}
      onPaymentError={onError}
    />
  );
};
