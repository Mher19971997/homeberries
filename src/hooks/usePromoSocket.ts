'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const PROMO_NOTIF_KEY = 'unreadPromos';

export const getUnreadPromos = (): number => {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(PROMO_NOTIF_KEY) || 0);
};

export const incrementUnreadPromos = () => {
  const current = getUnreadPromos();
  localStorage.setItem(PROMO_NOTIF_KEY, String(current + 1));
  window.dispatchEvent(new Event('promoNotification'));
};

export const clearUnreadPromos = () => {
  localStorage.setItem(PROMO_NOTIF_KEY, '0');
  window.dispatchEvent(new Event('promoNotification'));
};

export const usePromoSocket = (userUuid: string | undefined, onPromoReceived: (payload: { code: string; discountPercent: number }) => void) => {
  useEffect(() => {
    if (!userUuid) return;

    socket = io('http://localhost:6001', {
      query: { userUuid },
      transports: ['websocket'],
    });

    socket.on('promocode:received', (payload) => {
      incrementUnreadPromos();
      onPromoReceived(payload);
    });

    return () => {
      socket?.off('promocode:received');
      socket?.disconnect();
      socket = null;
    };
  }, [userUuid]);
};
