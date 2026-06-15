import React, { useEffect, useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { createPaymentIntent, confirmPayment } from '@homeberris/http/paymentApi';
import { useTranslation } from 'next-i18next';
import styles from './index.module.css';

// Инициализируем Stripe с публичным ключом
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QKxXxExampleKey'
);

interface StripePaymentFormProps {
  amount: number; // сумма в копейках
  orderUuid?: string;
  basketUuids?: string[];
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: string) => void;
}

const PaymentFormContent: React.FC<{
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  orderUuid?: string;
  basketUuids?: string[];
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: string) => void;
}> = ({ clientSecret, paymentIntentId, amount, orderUuid, basketUuids, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation('common');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Валидируем форму
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || t('stripe.errorSubmit'));
        setIsProcessing(false);
        return;
      }

      // Подтверждаем платеж - Stripe Elements сам получит payment method
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/basket?payment=success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setErrorMessage(confirmError.message || t('stripe.errorConfirm'));
        onError?.(confirmError.message || t('stripe.errorConfirm'));
        setIsProcessing(false);
        return;
      }

      // Платеж успешен на Stripe
      if (!paymentIntentId) {
        setErrorMessage(t('stripe.errorNoIntentId'));
        setIsProcessing(false);
        return;
      }

      // Проверяем статус платежа
      if (paymentIntent?.status !== 'succeeded') {
        setErrorMessage(t('stripe.errorNotCompleted', { status: paymentIntent?.status || 'unknown' }));
        setIsProcessing(false);
        return;
      }

      // Получаем payment method из payment intent (может быть строкой или объектом)
      const paymentMethodId = paymentIntent?.payment_method;
      let paymentMethodIdString = '';
      
      if (paymentMethodId) {
        paymentMethodIdString = typeof paymentMethodId === 'string' 
          ? paymentMethodId 
          : (paymentMethodId as any)?.id || '';
      }
      
      // Подтверждаем платеж на backend
      // Если orderUuid передан, обновим статус заказа на 'paid'
      const result = await confirmPayment(
        {
          paymentIntentId: paymentIntentId,
          paymentMethodId: paymentMethodIdString || undefined, // передаем undefined если пусто
        },
        orderUuid // передаем orderUuid для обновления статуса заказа
      );

      if (result.success) {
        // Передаем paymentIntentId в результат
        onSuccess?.({ ...result, paymentIntentId: paymentIntentId });
      } else {
        setErrorMessage(result.message || t('stripe.errorProcessing'));
        onError?.(result.message || t('stripe.errorProcessing'));
      }
    } catch (error: any) {
      setErrorMessage(error.message || t('stripe.errorGeneral'));
      onError?.(error.message || t('stripe.errorGeneral'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <PaymentElement />
      {errorMessage && (
        <Typography color="error" sx={{ mt: 2, fontSize: '14px' }}>
          {errorMessage}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || isProcessing}
        sx={{
          mt: 3,
          backgroundColor: '#667eea',
          '&:hover': {
            backgroundColor: '#5568d3',
          },
        }}
      >
        {isProcessing ? t('stripe.processing') : t('stripe.pay', { amount: (amount / 100).toFixed(2) })}
      </Button>
    </form>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  orderUuid,
  basketUuids,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation('common');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Создаем payment intent при монтировании компонента
    const createIntent = async () => {
      setIsLoading(true);
      try {
        const response = await createPaymentIntent({
          amount,
          currency: 'rub',
          orderUuid,
          basketUuids,
          description: t('stripe.orderDescription', { amount: (amount / 100).toFixed(2) }),
        });
        setClientSecret(response.clientSecret);
        setPaymentIntentId(response.paymentIntentId);
      } catch (error: any) {
        const errorMsg = error.message || t('stripe.errorCreate');
        setErrorMessage(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, orderUuid, basketUuids]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage || !clientSecret || !paymentIntentId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          {errorMessage || t('stripe.errorCreateFallback')}
        </Typography>
      </Box>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#667eea',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
        <PaymentFormContent
          clientSecret={clientSecret}
          paymentIntentId={paymentIntentId}
          amount={amount}
          orderUuid={orderUuid}
          basketUuids={basketUuids}
          onSuccess={onSuccess}
          onError={onError}
        />
    </Elements>
  );
};

export default StripePaymentForm;
