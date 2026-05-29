'use client';

import { Suspense } from 'react';
import CatalogPage from '@homeberris/pages/catalog/index';

export default function Page() {
  return (
    <Suspense>
      <CatalogPage />
    </Suspense>
  );
}
