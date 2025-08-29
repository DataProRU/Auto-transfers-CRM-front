import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from '../Auth';
import { authStore } from '@/store/AuthStore';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import type { AxiosResponse } from 'axios';
import type { AuthResponse } from '@/models/AuthResponse';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const mockedShowNotification = jest.fn();
jest.mock('@/providers/Notification', () => ({
  useNotification: () => ({
    showNotification: mockedShowNotification,
  }),
}));

jest.mock('@/store/AuthStore', () => ({
  authStore: {
    isAuth: false,
    isAuthChecking: false,
    role: null,
    authError: null,
    setIsAuth: jest.fn(),
    setIsAuthChecking: jest.fn(),
    setRole: jest.fn(),
    setAuthError: jest.fn(),
    login: jest.fn(),
    verify: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(),
  },
}));

jest.mock('mui-tel-input', () => ({
  MuiTelInput: ({
    value = '',
    onChange,
    label,
    error,
    helperText,
    fullWidth,
    ...props
  }: {
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    error?: boolean;
    helperText?: string;
    fullWidth?: boolean;
    [key: string]: unknown;
  }) => (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={label}
      aria-label={label}
      {...props}
    />
  ),
}));

const renderAuth = () =>
  render(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );

describe('Auth Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('рендерит форму авторизации', () => {
    renderAuth();

    expect(
      screen.getByLabelText(/Номер телефона \/ Логин/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
  });

  it('поля логин и пароль имеют required', () => {
    renderAuth();

    const loginInput = screen.getByLabelText(/Номер телефона \/ Логин/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);

    expect(loginInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('показывает ошибку при коротком пароле', async () => {
    renderAuth();

    await userEvent.type(
      screen.getByLabelText(/Номер телефона \/ Логин/i),
      'testuser'
    );
    await userEvent.type(screen.getByLabelText(/Пароль/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /Войти/i }));

    expect(
      await screen.findByText(/Пароль должен состоянить минимум из 8 символов/i)
    ).toBeInTheDocument();
  });

  it('успешно авторизует пользователя и перенаправляет на главную страницу', async () => {
    const mockResponse = {
      data: {
        refresh: 'mockRefreshToken',
        access: 'mockAccessToken',
      },
    } as AxiosResponse<AuthResponse>;

    (authStore.login as jest.Mock).mockResolvedValue(mockResponse);

    renderAuth();

    await userEvent.type(
      screen.getByLabelText(/Номер телефона \/ Логин/i),
      'validuser'
    );
    await userEvent.type(screen.getByLabelText(/Пароль/i), 'validpassword123');

    await userEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(authStore.login).toHaveBeenCalledWith(
        'validuser',
        'validpassword123'
      );
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  it('вызывает showNotification при ошибке авторизации', async () => {
    (authStore.login as jest.Mock).mockRejectedValue(
      new Error('Ошибка авторизации')
    );
    (authStore.authError as string) = 'Неверный логин или пароль';

    renderAuth();

    fireEvent.change(screen.getByLabelText(/Номер телефона \/ Логин/i), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByLabelText(/Пароль/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(mockedShowNotification).toHaveBeenCalledWith(
        'Неверный логин или пароль',
        'error'
      );
    });
  });
});
