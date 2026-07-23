import { apiPost, apiPut, type ApiResult } from "@/utils/api";
import type {
  BackendResponse,
  LoginCredentials,
  LoginData,
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
