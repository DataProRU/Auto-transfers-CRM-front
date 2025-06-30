import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction, useAtom } from '@reatom/npm-react';
import { authErrorAtom } from '../../store/auth/atoms';
import { login } from '../../store/auth/actions';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const authSchema = z.object({
  login: z.string().min(1, 'Логин обязятелен для заполенения'),
  password: z.string().min(6, 'Пароль должен состоянить минимум из 8 символов'),
  // .regex(
  //   /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
  //   'Пароль должен содержать заглавную, строчную букву, цифру и спецсимвол'
  // ),
});

type AuthFormData = z.infer<typeof authSchema>;

const Auth = () => {
  const [authError] = useAtom(authErrorAtom);
  const loginAction = useAction(login);
  const [openError, setOpenError] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      await loginAction(data.login, data.password);
      navigate('/');
    } catch {
      setOpenError(true);
    }
  };

  const handleCloseError = () => {
    setOpenError(false);
  };

  return (
    <>
      <Snackbar
        open={openError}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity='error' onClose={handleCloseError}>
          {authError}
        </Alert>
      </Snackbar>
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
              <TextField
                label='Логин/Номер телефона'
                variant='outlined'
                fullWidth
                required
                autoFocus
                error={!!errors.login}
                helperText={errors.login?.message}
                {...register('login')}
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
