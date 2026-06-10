'use client';

import { useRouter, useParams } from 'next/navigation';

const LOCALE_RE = /^\/[a-z]{2}(\/|$)/;

export function useLocalizedRouter() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ru';

  return {
    ...router,
    push: (path: string, options?: Parameters<ReturnType<typeof useRouter>['push']>[1]) => {
      if (typeof path === 'string' && !LOCALE_RE.test(path)) {
        return router.push(`/${locale}${path}`, options);
      }
      return router.push(path, options);
    },
  };
}
