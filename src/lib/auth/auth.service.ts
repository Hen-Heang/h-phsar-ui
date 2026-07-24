import { apiPost, apiPut, type ApiResult } from "@/utils/api";
import { clearAuthToken } from "@/lib/auth/authStore";
import type {
  BackendResponse,
  LoginCredentials,
  LoginData,
  RefreshTokenData,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/types/auth";

export type LoginApiResponse = ApiResult<BackendResponse<LoginData>>;

export const registerService = (data: RegisterRequest): Promise<ApiResult> =>
  apiPost("/authorization/register", {
    auth: false,
    body: data,
  });

export const generateCodeService = (email: string): Promise<ApiResult> =>
  apiPost("/authorization/api/v1/otp/generate", {
    auth: false,
    query: { email },
  });

export const loginService = (
  credentials: LoginCredentials,
): Promise<LoginApiResponse> =>
  apiPost<BackendResponse<LoginData>>("/authorization/login", {
    auth: false,
    // Required for the browser to actually store the backend's Set-Cookie
    // (refresh token) response header — for a cross-origin request, a
    // server's Access-Control-Allow-Credentials only permits the cookie;
    // the browser still silently drops it unless THIS request opted into
    // credentials mode too. Without this, login "succeeds" but the refresh
    // cookie is never stored and /refresh always fails later.
    withCredentials: true,
    body: credentials,
  });

// Password reset has one backend endpoint that both verifies the OTP and sets
// the new password (PUT /authorization/forget?otp=&email=&newPassword=) — there
// is no separate "just send me an OTP" reset endpoint. Sending the OTP itself
// reuses the same generate-code endpoint as signup verification.
export const sendForgotPasswordOtp = (email: string): Promise<ApiResult> =>
  apiPost("/authorization/api/v1/otp/generate", {
    auth: false,
    query: { email },
  });

export const resetPasswordService = (
  data: ResetPasswordRequest,
): Promise<ApiResult> =>
  apiPut("/authorization/forget", {
    auth: false,
    query: {
      otp: data.otp,
      email: data.email,
      newPassword: data.password,
    },
  });

export const verifyEmailService = (
  email: string,
  otp: string,
): Promise<ApiResult> =>
  apiPost("/authorization/api/v1/otp/verify", {
    auth: false,
    query: { otp, email },
  });

export const resendVerificationCode = (email: string): Promise<ApiResult> =>
  apiPost("/authorization/api/v1/otp/generate", {
    auth: false,
    query: { email },
  });

// Silent refresh: the backend reads the httpOnly refresh-token cookie (sent
// automatically because withCredentials is set) and returns a fresh access
// token. auth:false is required, not optional — if the caller's current
// access token happens to be expired (the normal reason to call this), the
// request interceptor would otherwise treat this call itself as
// unauthenticated. Called both from AuthInitializer (on app load) and from
// api.ts's response interceptor (on a 401 from any protected call).
export const refreshAccessToken = (): Promise<
  ApiResult<BackendResponse<RefreshTokenData>>
> =>
  apiPost<BackendResponse<RefreshTokenData>>("/authorization/refresh", {
    auth: false,
    withCredentials: true,
  });

// Revokes the refresh-token cookie server-side and clears it.
export const logoutService = (): Promise<ApiResult> =>
  apiPost("/authorization/logout", {
    auth: false,
    withCredentials: true,
  });

// Shared by every sign-out entry point (supplier navbar/sidebar, buyer navbar).
// Best-effort on the network call: a failure (offline, backend down, token
// already invalid) must never trap the user in a signed-in-looking UI with no
// way out, so local auth state is always cleared regardless of the outcome.
export const performLogout = async (): Promise<void> => {
  try {
    await logoutService();
  } catch {
    // Ignored — see comment above.
  }
  clearAuthToken();
};
