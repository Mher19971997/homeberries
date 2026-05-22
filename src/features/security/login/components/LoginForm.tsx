import React from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography
} from '@mui/material';
import FormInput from '@homeberris/components/FormInput';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Toast from '@homeberris/components/Toast';
import { useAuthLogin } from '@homeberris/features/security/login';
import styles from '@homeberris/features/security/login/styles/index.module.css';

interface Props {}

export const LoginForm: React.FC<Props> = () => {
  const {
    toast,
    hideToast,
    submitHandler,
    errorMessage,
    handleClickShowPassword,
    handleMouseDownPassword,
    showPassword
  } = useAuthLogin();

  return (
    <Box className={styles.wrapper}>
      <Card className={styles.cardBlock}>
        <Box component="form" onSubmit={submitHandler}>
          <Typography className={styles.title}>
            Войти или создать профиль
          </Typography>

          <Box className={styles.inputBox}>
            <FormInput
              error={!!errorMessage}
              placeholder="Email"
              type="email"
              name="email"
              fullWidth
            />
          </Box>

          <Box className={styles.inputBox}>
            <OutlinedInput
              error={!!errorMessage}
              fullWidth
              id="password"
              name="password"
              placeholder="Пароль"
              type={showPassword ? 'text' : 'password'}
              className={styles.passwordInput}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            className={styles.submitButton}
          >
            Войти
          </Button>
        </Box>
      </Card>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </Box>
  );
};
