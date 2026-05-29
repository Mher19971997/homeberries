'use client';

import { Suspense } from 'react';
import AddressPage from '@homeberris/pages/services/address/index';

export default function Page() {
  return (
    <Suspense>
      <AddressPage />
    </Suspense>
  );
}
