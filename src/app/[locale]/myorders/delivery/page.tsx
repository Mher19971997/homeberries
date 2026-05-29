'use client';

import { Suspense } from 'react';
import DeliveryPage from '@homeberris/pages/myorders/delivery/index';

export default function Page() {
  return (
    <Suspense>
      <DeliveryPage />
    </Suspense>
  );
}
