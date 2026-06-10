import { useToast } from '@homeberris/hooks/useToast';
import { login } from '@homeberris/http/authApi';
import { setToken } from '@homeberris/utils/auth';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useState } from 'react';

export const useAuthLogin = () => {
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
                showSuccess('Успешный вход в систему!');
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            } else {
                const errorMsg = 'Неверный ответ сервера авторизации';
                setErrorMessage(errorMsg);
                showError(errorMsg);
            }
        } catch (e: any) {
            const errorMsg = e?.response?.data?.message || 'Ошибка при входе в систему';
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
