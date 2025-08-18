// __tests__/Auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from '../Auth';
import { authStore } from '../../store/AuthStore';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

jest.mock('../../setup/axios', () => ({
  API_URL: 'http://localhost:8000',
}));

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const mockedShowNotification = jest.fn();
jest.mock('../../providers/Notification', () => ({
  useNotification: () => ({
    showNotification: mockedShowNotification,
  }),
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
    jest.spyOn(authStore, 'setIsAuth').mockImplementation(() => {});
  });

  it('рендерит форму авторизации', () => {
    renderAuth();

    expect(screen.getByLabelText(/Логин\/Номер телефона/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
  });

  it('поля логин и пароль имеют required', () => {
    renderAuth();

    const loginInput = screen.getByLabelText(/Логин/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);

    expect(loginInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('показывает ошибку при коротком пароле', async () => {
    renderAuth();

    await userEvent.type(screen.getByLabelText(/Логин/i), 'testuser');
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
    };

    // Мокаем метод login чтобы возвращать успешный ответ
    const loginMock = jest.fn().mockResolvedValueOnce(mockResponse);
    (authStore as typeof authStore).login = loginMock;

    renderAuth();

    await userEvent.type(
      screen.getByLabelText(/Логин\/Номер телефона/i),
      'validuser'
    );
    await userEvent.type(screen.getByLabelText(/Пароль/i), 'validpassword123');

    await userEvent.click(screen.getByRole('button', { name: /Войти/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('validuser', 'validpassword123');
    });

    expect(mockedNavigate).toHaveBeenCalledWith('/');

    // // 3. Токены были сохранены в localStorage
    // expect(localStorage.setItem).toHaveBeenCalledWith(
    //   'crmAccess',
    //   'mockAccessToken'
    // );
    // expect(localStorage.setItem).toHaveBeenCalledWith(
    //   'crmRefresh',
    //   'mockRefreshToken'
    // );

    // 4. Состояние авторизации было обновлено
    // expect(authStore.setIsAuth).toHaveBeenCalledWith(true); ???
  });

  it('вызывает showNotification при ошибке авторизации', async () => {
    const loginMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('Ошибка авторизации'));

    (authStore as typeof authStore).login = loginMock;
    authStore.authError = 'Неверный логин или пароль';

    renderAuth();

    fireEvent.change(screen.getByLabelText(/Логин\/Номер телефона/i), {
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
