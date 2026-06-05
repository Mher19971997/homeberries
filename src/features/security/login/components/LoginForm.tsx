'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@homeberris/http/authApi';
import { setToken } from '@homeberris/utils/auth';
import styles from '@homeberris/features/security/login/styles/index.module.css';

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const flip = (toRegister: boolean) => {
    setError('');
    setSuccess('');
    setFlipped(toRegister);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    if (!email || !password) { setError('Заполните все поля'); return; }
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res?.data?.access_token) {
        setToken(res.data.access_token);
        setSuccess('Добро пожаловать!');
        setTimeout(() => router.push('/'), 800);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Неверный email или пароль');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (e.currentTarget.elements.namedItem('confirm') as HTMLInputElement).value;
    if (!email || !password || !confirm) { setError('Заполните все поля'); return; }
    if (password !== confirm) { setError('Пароли не совпадают'); return; }
    if (password.length < 8) { setError('Пароль минимум 8 символов'); return; }
    setLoading(true);
    try {
      await register({ email, password });
      const res = await login({ email, password });
      if (res?.data?.access_token) {
        setToken(res.data.access_token);
        setSuccess('Аккаунт создан!');
        setTimeout(() => router.push('/'), 800);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ошибка при регистрации');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.scene}>
        <div className={`${styles.cardFlip} ${flipped ? styles.cardFlipFlipped : ''}`}>

          {/* FRONT — Login */}
          <div className={styles.face}>
            <div className={styles.logo}>cyber</div>
            <p className={styles.logoSub}>Войдите в свой аккаунт</p>

            <div className={styles.tabs}>
              <button className={`${styles.tabBtn} ${styles.tabActive}`} onClick={() => flip(false)}>Войти</button>
              <button className={styles.tabBtn} onClick={() => flip(true)}>Регистрация</button>
            </div>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input name="email" type="email" className={styles.input} placeholder="your@email.com" autoComplete="email" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Пароль</label>
                <div className={styles.inputWrap}>
                  <input name="password" type={showPassword ? 'text' : 'password'} className={styles.input} placeholder="Введите пароль" autoComplete="current-password" />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.successMsg}>{success}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Входим...' : 'Войти'}
              </button>
            </form>
          </div>

          {/* BACK — Register */}
          <div className={`${styles.face} ${styles.faceBack}`}>
            <div className={styles.logo}>cyber</div>
            <p className={styles.logoSub}>Создайте аккаунт</p>

            <div className={styles.tabs}>
              <button className={styles.tabBtn} onClick={() => flip(false)}>Войти</button>
              <button className={`${styles.tabBtn} ${styles.tabActive}`} onClick={() => flip(true)}>Регистрация</button>
            </div>

            <form onSubmit={handleRegister} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input name="email" type="email" className={styles.input} placeholder="your@email.com" autoComplete="email" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Пароль</label>
                <div className={styles.inputWrap}>
                  <input name="password" type={showPassword ? 'text' : 'password'} className={styles.input} placeholder="Минимум 8 символов" autoComplete="new-password" />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Подтвердите пароль</label>
                <div className={styles.inputWrap}>
                  <input name="confirm" type={showConfirm ? 'text' : 'password'} className={styles.input} placeholder="Повторите пароль" autoComplete="new-password" />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.successMsg}>{success}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Создаём...' : 'Создать аккаунт'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
