export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  preferredLanguage?: string;
  gender?: string;
  country: string;
  role: 'user' | 'specialist';
}

export interface ConfirmEmailRequest {
  email: string;
  token: string;
}

export interface ResendConfirmationEmailRequest {
  email: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresOnUtc: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}
