import type { ApiError } from '../@types/api';

export function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'response' in e;
}
