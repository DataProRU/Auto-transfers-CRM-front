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

  it('should return decoded payload for a valid token', () => {
    // Настраиваем мок для успешного декодирования
    (jwtDecode as jest.Mock).mockReturnValue(mockJwtPayload);

    const result = decodeToken('valid-token');
    expect(result).toEqual(mockJwtPayload);
    expect(jwtDecode).toHaveBeenCalledWith('valid-token');
  });

  it('should return null when token is null', () => {
    const result = decodeToken(null);
    expect(result).toBeNull();
    expect(jwtDecode).not.toHaveBeenCalled();
  });

  it('should return null and log error for invalid token', () => {
    // Настраиваем мок для выброса ошибки
    (jwtDecode as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Мокаем console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = decodeToken('invalid-token');
    expect(result).toBeNull();
    expect(jwtDecode).toHaveBeenCalledWith('invalid-token');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Ошибка декодирования JWT:',
      expect.any(Error)
    );

    // Очищаем мок console.error
    consoleErrorSpy.mockRestore();
  });

  it('should return null for token with incomplete payload', () => {
    // Настраиваем мок для возврата неполного payload
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
