'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { checkToken } from '@homeberris/utils/auth';
import { LoginForm } from '@homeberris/features/security/login';

export default function Login() {
  const router = useRouter();

  React.useEffect(() => {
    if (checkToken()) {
      router.push('/');
    }
  }, [router]);

  return <LoginForm />;
}
