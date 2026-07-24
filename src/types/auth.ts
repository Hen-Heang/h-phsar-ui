// ── Login ─────────────────────────────────────────────────────────────────────
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginData {
  token: string;
  roleId: number;
  userId: string;
}

// Backend wraps data: { data: T }
export interface BackendResponse<T> {
  data: T;
  message?: string;
}

// ── Refresh ────────────────────────────────────────────────────────────────────
export interface RefreshTokenData {
  token: string;
}

// ── Forgot / Reset password ───────────────────────────────────────────────────
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

// ── Registration ──────────────────────────────────────────────────────────────
export interface RegisterRequest {
  email: string;
  password: string;
  roleId: number;
}

// ── Email verification ────────────────────────────────────────────────────────
export interface VerifyEmailRequest {
  email: string;
  otp: string;
}
