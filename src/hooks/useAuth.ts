import React from 'react';
import { useCookies } from 'react-cookie';
import { checkToken } from '@homeberris/utils/auth';

export const useAuth = () => {
  const [isAuth, setIsAuth] = React.useState(false);
  const [cookies] = useCookies(['token']);

  React.useEffect(() => {
    setIsAuth(checkToken());
  }, [cookies.token]);

  return isAuth;
};