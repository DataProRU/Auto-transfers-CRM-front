import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useNotification } from '../providers/Notification';
import { authStore } from '../store/AuthStore';
import { authSchema } from '../schemas/auth';
import type { AuthFormData } from '../@types/auth';
import { MuiTelInput } from 'mui-tel-input';

const Auth = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { login, authError } = authStore;

  useEffect(() => {
    if (authError) {
      showNotification(authError, 'error');
    }
  }, [authError, showNotification]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      const cleanedLogin = data.login.replaceAll(' ', '');
      await login(cleanedLogin, data.password);
      navigate('/');
    } catch {
      if (authError) {
        showNotification(authError, 'error');
      }
    }
  };

  return (
    <>
      <Container
        component='main'
        maxWidth='xs'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            px: 4,
            py: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography component='h2' variant='h4' textAlign='center'>
            Авторизация
          </Typography>

          <Box component='form' onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                name='login'
                control={control}
                rules={{
                  validate: (value) => {
                    if (!value || value.trim() === '') {
                      return 'Логин обязателен для заполнения';
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <MuiTelInput
                    {...field}
                    label='Номер телефона / Логин'
                    variant='outlined'
                    fullWidth
                    autoFocus
                    defaultCountry='RU'
                    langOfCountryName='ru'
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{
                      '& .MuiTelInput-Flag': {
                        borderRadius: '4px',
                      },
                    }}
                  />
                )}
              />
              <TextField
                label='Пароль'
                type='password'
                variant='outlined'
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password')}
              />
              <Button type='submit' fullWidth variant='contained' size='large'>
                Войти
              </Button>

              <Typography component='p' variant='body2' align='center'>
                Забыли пароль или нет учетной записи? Обратитесь к
                администратору!
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default Auth;
