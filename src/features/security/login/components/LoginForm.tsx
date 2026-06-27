'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { login, register } from '@homeberris/http/authApi';
import { checkContact, verifyContact } from '@homeberris/http/authApi';
import { setToken } from '@homeberris/utils/auth';
import styles from '@homeberris/features/security/login/styles/index.module.css';
import { useTranslation } from 'react-i18next';
import { EyeOff, EyeOpen } from '@homeberris/assets/icons/login';

// step: 'login' | 'reg_form' | 'reg_verify' | 'reg_done'
type Step = 'login' | 'reg_form' | 'reg_verify';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(
    searchParams?.get('mode') === 'register' ? 'reg_form' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // данные регистрации сохраняем чтобы после верификации отправить register
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeExpiry, setCodeExpiry] = useState(0); // секунд до истечения кода

  const { t } = useTranslation('common');
  const redirectTo = searchParams?.get('redirect') || '/';

  // Countdown таймер для кода (2 минуты)
  React.useEffect(() => {
    if (step !== 'reg_verify' || codeExpiry <= 0) return;
    const interval = setInterval(() => {
      setCodeExpiry(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, codeExpiry]);

  const extractError = (err: any, fallback: string): string => {
    const msg = err?.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) {
      return msg.map((m: any) => (typeof m === 'string' ? m : m?.message)).filter(Boolean).join(', ');
    }
    if (msg && typeof msg === 'object' && typeof msg.message === 'string') return msg.message;
    return fallback;
  };

  const switchTab = (toRegister: boolean) => {
    setError('');
    setSuccess('');
    setStep(toRegister ? 'reg_form' : 'login');
  };

  // ── Логин ──
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
        setSuccess(t('auth.login.welcome'));
        setTimeout(() => router.push(redirectTo), 800);
      }
    } catch (err: any) {
      setError(extractError(err, t('auth.errors.invalid')));
    } finally { setLoading(false); }
  };

  // ── Регистрация шаг 1: отправить код на email ──
  const handleRegisterStep1 = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const res = await checkContact({ email });
      if (res?.data?.exist === true) {
        setError(t('auth.errors.emailExists'));
        return;
      }
      if (res?.data?.after) {
        // код уже был отправлен недавно, ждём cooldown
        setError(t('auth.errors.codeCooldown', { s: res.data.after }));
        return;
      }
      // exist === false → новый код отправлен
      setPendingEmail(email);
      setPendingPassword(password);
      setSuccess(t('auth.register.codeSent'));
      setTimeout(() => {
        setSuccess('');
        setStep('reg_verify');
        setCodeExpiry(120); // 2 минуты
      }, 1000);
      if (res?.data?.after) setResendCooldown(res.data.after);
    } catch (err: any) {
      setError(extractError(err, t('auth.errors.registerError')));
    } finally { setLoading(false); }
  };

  // ── Регистрация шаг 2: верифицировать код и создать аккаунт ──
  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const code = (e.currentTarget.elements.namedItem('code') as HTMLInputElement).value.trim();
    if (!code) { setError(t('auth.errors.fillFields')); return; }
    setLoading(true);
    try {
      const verifyRes = await verifyContact({ email: pendingEmail, code });
      if (verifyRes?.data?.expired) {
        setError(t('auth.errors.codeExpired'));
        setCodeExpiry(0);
        return;
      }
      if (!verifyRes?.data?.verified) {
        setError(t('auth.errors.wrongCode'));
        return;
      }
      // верификация прошла → регистрируем
      const regRes = await register({ email: pendingEmail, password: pendingPassword });
      const token = regRes?.data?.access_token;
      if (token) {
        setToken(token);
        setSuccess(t('auth.register.success'));
        setTimeout(() => router.push(redirectTo), 900);
      }
    } catch (err: any) {
      setError(extractError(err, t('auth.errors.registerError')));
    } finally { setLoading(false); }
  };

  const isRegister = step === 'reg_form' || step === 'reg_verify';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>cyber</div>
        <p className={styles.logoSub}>
          {step === 'login' && t('auth.login.title')}
          {step === 'reg_form' && t('auth.register.title')}
          {step === 'reg_verify' && t('auth.register.verifyTitle')}
        </p>

        {/* Табы — только на login и reg_form */}
        {step !== 'reg_verify' && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${!isRegister ? styles.tabActive : ''}`}
              onClick={() => switchTab(false)}
            >
              {t('auth.login.tabLogin')}
            </button>
            <button
              className={`${styles.tabBtn} ${isRegister ? styles.tabActive : ''}`}
              onClick={() => switchTab(true)}
            >
              {t('auth.login.tabRegister')}
            </button>
          </div>
        )}

        {/* Логин */}
        {step === 'login' && (
          <form key="login" onSubmit={handleLogin} className={styles.form}>
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
        )}

        {/* Регистрация шаг 1 */}
        {step === 'reg_form' && (
          <form key="reg_form" onSubmit={handleRegisterStep1} className={styles.form}>
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
        )}

        {/* Регистрация шаг 2 — ввод кода */}
        {step === 'reg_verify' && (
          <form key="reg_verify" onSubmit={handleVerify} className={styles.form}>
            <p className={styles.verifyHint}>
              {t('auth.register.verifyHint')} <strong>{pendingEmail}</strong>
            </p>
            {codeExpiry > 0 ? (
              <p className={styles.codeTimer}>
                {t('auth.register.codeExpires')} {Math.floor(codeExpiry / 60)}:{String(codeExpiry % 60).padStart(2, '0')}
              </p>
            ) : (
              <p className={styles.codeExpired}>
                {t('auth.errors.codeExpired')}{' '}
                <button type="button" className={styles.resendBtn} onClick={() => { setStep('reg_form'); setError(''); }}>
                  {t('auth.register.resend')}
                </button>
              </p>
            )}
            <div className={styles.field}>
              <label className={styles.label}>{t('auth.register.code')}</label>
              <input
                name="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className={`${styles.input} ${styles.inputCode}`}
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.successMsg}>{success}</p>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? t('auth.register.loading') : t('auth.register.verify')}
            </button>
            <button type="button" className={styles.backBtn} onClick={() => { setError(''); setStep('reg_form'); }}>
              ← {t('auth.register.back')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
