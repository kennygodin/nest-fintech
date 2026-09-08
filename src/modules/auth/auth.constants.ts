export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  LOGIN_SUCCESS: 'Login successful',
  INVALID_CLIENT_TYPE: 'Invalid client type',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  REFRESH_SUCCESS: 'Refresh successful',
  LOGOUT_SUCCESS: 'Logout successful',
  LOGOUT_ALL_SUCCESS: 'Logout all successful',
} as const;

export enum ClientType {
  WEB = 'web',
  MOBILE = 'mobile',
}

export function isClientType(value: string): value is ClientType {
  return Object.values(ClientType).includes(value as ClientType);
}
