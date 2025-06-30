import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  user_id: number;
  role: string;
  exp: number;
  iat?: number;
  approved: boolean;
  onboarded: boolean;
}

export const decodeToken = (token: string | null): JwtPayload | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch (e) {
    console.error('Ошибка декодирования JWT:', e);
    return null;
  }
};
