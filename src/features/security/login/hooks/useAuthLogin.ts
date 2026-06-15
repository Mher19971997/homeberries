import { useToast } from '@homeberris/hooks/useToast';
import { login } from '@homeberris/http/authApi';
import { setToken } from '@homeberris/utils/auth';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';

export const useAuthLogin = () => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { toast, showSuccess, showError, hideToast } = useToast();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
        event.preventDefault();
    };

    const submitHandler = async (e: any) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const res = await login({ email, password });
            if (res?.data?.access_token) {
                setToken(res.data.access_token);
                showSuccess(t('auth.login.welcome'));
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            } else {
                const errorMsg = t('auth.errors.serverError');
                setErrorMessage(errorMsg);
                showError(errorMsg);
            }
        } catch (e: any) {
            const errorMsg = e?.response?.data?.message || t('auth.errors.loginError');
            setErrorMessage(errorMsg);
            showError(errorMsg);
        }
    };
    return {
        router,
        toast,
        hideToast,
        errorMessage,
        showPassword,
        handleClickShowPassword,
        handleMouseDownPassword,
        submitHandler
    };
};
