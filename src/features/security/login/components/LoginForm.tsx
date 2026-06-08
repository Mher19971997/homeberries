'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@homeberris/http/authApi';
import { setToken } from '@homeberris/utils/auth';
import styles from '@homeberris/features/security/login/styles/index.module.css';
import { useTranslation } from 'react-i18next';
import { EyeOff, EyeOpen } from '@homeberris/assets/icons/login';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { t } = useTranslation('common');
  
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
    if (!email || !password) { setError(t('auth.errors.fillFields')); return; }
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
    if (!email || !password || !confirm) { setError(t('auth.errors.fillFields')); return; }
    if (password !== confirm) { setError(t('auth.errors.passwordMismatch')); return; }
    if (password.length < 8) { setError(t('auth.errors.passwordLength')); return; }
    setLoading(true);
    try {
      await register({ email, password });
      const res = await login({ email, password });
      if (res?.data?.access_token) {
        setToken(res.data.access_token);
        setSuccess(t('auth.register.success'));
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
            <p className={styles.logoSub}>{t('auth.login.title')}</p>

            <div className={styles.tabs}>
              <button className={`${styles.tabBtn} ${styles.tabActive}`} onClick={() => flip(false)}>{t('auth.login.tabLogin')}</button>
              <button className={styles.tabBtn} onClick={() => flip(true)}>{t('auth.login.tabRegister')}</button>
            </div>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>{t('auth.login.email')}</label>
                <input name="email" type="email" className={styles.input} placeholder="your@email.com" autoComplete="email" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t('auth.login.password')}</label>
                <div className={styles.inputWrap}>
                  <input name="password" type={showPassword ? 'text' : 'password'} className={styles.input} placeholder={t('auth.login.passwordPlaceholder')} autoComplete="current-password" />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.successMsg}>{success}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? t('auth.login.loading') : t('auth.login.submit')}
              </button>
            </form>
          </div>

          {/* BACK — Register */}
          <div className={`${styles.face} ${styles.faceBack}`}>
            <div className={styles.logo}>cyber</div>
            <p className={styles.logoSub}>{t('auth.register.title')}</p>

            <div className={styles.tabs}>
              <button className={styles.tabBtn} onClick={() => flip(false)}>{t('auth.login.submit')}</button>
              <button className={`${styles.tabBtn} ${styles.tabActive}`} onClick={() => flip(true)}>{t('auth.login.tabRegister')}</button>
            </div>

            <form onSubmit={handleRegister} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>{t('auth.register.email')}</label>
                <input name="email" type="email" className={styles.input} placeholder="your@email.com" autoComplete="email" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t('auth.register.password')}</label>
                <div className={styles.inputWrap}>
                  <input name="password" type={showPassword ? 'text' : 'password'} className={styles.input} placeholder={t('auth.register.passwordPlaceholder')} autoComplete="new-password" />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t('auth.register.confirmPassword')}</label>
                <div className={styles.inputWrap}>
                  <input name="confirm" type={showConfirm ? 'text' : 'password'} className={styles.input} placeholder={t('auth.register.confirmPlaceholder')} autoComplete="new-password" />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.successMsg}>{success}</p>}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? t('auth.register.loading') : t('auth.register.submit')}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
