'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const promoNotifKey = (userUuid: string) => `unreadPromos_${userUuid}`;

export const getUnreadPromos = (userUuid?: string): number => {
  if (typeof window === 'undefined' || !userUuid) return 0;
  return Number(localStorage.getItem(promoNotifKey(userUuid)) || 0);
};

export const incrementUnreadPromos = (userUuid: string) => {
  const current = getUnreadPromos(userUuid);
  localStorage.setItem(promoNotifKey(userUuid), String(current + 1));
  window.dispatchEvent(new Event('promoNotification'));
};

export const clearUnreadPromos = (userUuid: string) => {
  localStorage.setItem(promoNotifKey(userUuid), '0');
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
      incrementUnreadPromos(userUuid);
      onPromoReceived(payload);
    });

    return () => {
      socket?.off('promocode:received');
      socket?.disconnect();
      socket = null;
    };
  }, [userUuid]);
};
