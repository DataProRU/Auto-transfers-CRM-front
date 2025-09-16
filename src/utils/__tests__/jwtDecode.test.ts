import { decodeToken, type JwtPayload } from '../jwtDecode';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

describe('decodeToken', () => {
  const mockJwtPayload: JwtPayload = {
    user_id: 123,
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 3600,
    approved: true,
    onboarded: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает декодированный payload для валидного токена', () => {
    (jwtDecode as jest.Mock).mockReturnValue(mockJwtPayload);

    const result = decodeToken('valid-token');
    expect(result).toEqual(mockJwtPayload);
    expect(jwtDecode).toHaveBeenCalledWith('valid-token');
  });

  it('возвращает null когда токен равен null', () => {
    const result = decodeToken(null);
    expect(result).toBeNull();
    expect(jwtDecode).not.toHaveBeenCalled();
  });

  it('возвращает null и логирует ошибку для невалидного токена', () => {
    (jwtDecode as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = decodeToken('invalid-token');
    expect(result).toBeNull();
    expect(jwtDecode).toHaveBeenCalledWith('invalid-token');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Ошибка декодирования JWT:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('возвращает null для токена с неполным payload', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      user_id: 123,
      role: 'user',
      // Отсутствуют exp, approved, onboarded
    });

    const result = decodeToken('incomplete-token');
    expect(result).toEqual({
      user_id: 123,
      role: 'user',
    });
    expect(jwtDecode).toHaveBeenCalledWith('incomplete-token');
  });
});
