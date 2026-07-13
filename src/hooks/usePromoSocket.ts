'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const usePromoSocket = (userUuid: string | undefined, onPromoReceived: (payload: { code: string; discountPercent: number }) => void) => {
  useEffect(() => {
    if (!userUuid) return;

    socket = io('http://localhost:6001', {
      query: { userUuid },
      transports: ['websocket'],
    });

    socket.on('promocode:received', (payload) => {
      onPromoReceived(payload);
    });

    return () => {
      socket?.off('promocode:received');
      socket?.disconnect();
      socket = null;
    };
  }, [userUuid]);
};
