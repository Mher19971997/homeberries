import Cookies from 'js-cookie';

// Проверка наличия токена в cookies (клиент)
export const checkToken = (): boolean => {
  const token = Cookies.get('token');
  return !!token && token.split('.').length === 3;
};

// Получение токена из cookies (клиент)
export const getToken = (): string | undefined => {
  return Cookies.get('token');
};

// Сохранение токена в cookies (клиент)
export const setToken = (token: string) => {
  Cookies.set('token', token);
};

// Удаление токена из cookies (клиент)
export const removeToken = () => {
  Cookies.remove('token');
};

// Получение токена из cookies на сервере (через req) или на клиенте
export const getTokenFromCookie = (req?: any): string | null => {
  // Если выполняемся на сервере и есть заголовок cookie
  if (req?.headers?.cookie) {
    const rawCookie: string = req.headers.cookie;
    const cookies = rawCookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1] || null;
    }
    return null;
  }

  // Если выполняемся на клиенте – читаем из js-cookie
  const token = Cookies.get('token');
  return token ?? null;
};
