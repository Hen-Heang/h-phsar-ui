import { apiPost, apiPut, type ApiResponse } from "@/lib/http/api-client";
import type {
  BackendResponse,
  LoginCredentials,
  LoginData,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/types/auth";

export type LoginApiResponse = ApiResponse<BackendResponse<LoginData>>;

export const registerService = (data: RegisterRequest): Promise<ApiResponse> =>
  apiPost("/authorization/register", {
    auth: false,
    body: data,
  });

export const generateCodeService = (email: string): Promise<ApiResponse> =>
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

export const sendForgotPasswordOtp = (email: string): Promise<ApiResponse> =>
  apiPut("/authorization/forget", {
    auth: false,
    query: { email },
  });

export const resetPasswordService = (
  data: ResetPasswordRequest,
): Promise<ApiResponse> =>
  apiPut("/authorization/change-password", {
    auth: false,
    body: data,
  });

export const verifyEmailService = (
  email: string,
  otp: string,
): Promise<ApiResponse> =>
  apiPost("/authorization/api/v1/otp/verify", {
    auth: false,
    query: { otp, email },
  });

export const resendVerificationCode = (email: string): Promise<ApiResponse> =>
  apiPost("/authorization/api/v1/otp/generate", {
    auth: false,
    query: { email },
  });
