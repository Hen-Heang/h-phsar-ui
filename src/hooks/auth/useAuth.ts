import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppDispatch as useDispatch } from "@/redux/hooks";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import {
  loginService,
  registerService,
  generateCodeService,
  sendForgotPasswordOtp,
  resetPasswordService,
  verifyEmailService,
  resendVerificationCode,
} from "@/lib/auth/auth.service";
import { setDataLogin } from "@/redux/slices/auth/authSlice";
import { setAuthToken } from "@/lib/auth/authStore";
import { roleIdToRole } from "@/config/roles";
import { ROLE_HOME_ROUTE } from "@/config/routes";
import type {
  LoginCredentials,
  LoginData,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/types/auth";

// ─── Sign Up (register + generate OTP) ───────────────────────────────────────
interface UseSignUpOptions {
  onOtpSent?: (email: string) => void;
}

export function useSignUpMutation({ onOtpSent }: UseSignUpOptions = {}) {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const regRes = await registerService(data);
      if (!regRes.ok) return regRes;
      return generateCodeService(data.email);
    },
    onSuccess: (response, variables) => {
      if (response.ok) {
        onOtpSent?.(variables.email);
        toast.success("Account created! Please verify your email.");
      } else {
        const detail = (response.data as { detail?: string })?.detail;
        toast.error(detail ?? "Registration failed.");
      }
    },
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────
interface UseLoginOptions {
  onEmailNotVerified?: (email: string) => void;
}

export function useLoginMutation({ onEmailNotVerified }: UseLoginOptions = {}) {
  const router = useRouter();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginService(credentials),
    onSuccess: (response, variables) => {
      if (!navigator.onLine) {
        toast.error("No internet connection.");
        return;
      }

      if (response.status === 200) {
        const loginData = response.data?.data as LoginData | undefined;

        if (!loginData?.token) {
          toast.error("Login failed: unexpected server response.");
          return;
        }

        dispatch(setDataLogin(loginData));
        setAuthToken(loginData.token);
        localStorage.setItem("role", String(loginData.roleId));
        localStorage.setItem("email", variables.email);
        localStorage.setItem("userId", String(loginData.userId));

        Swal.fire({
          icon: "success",
          title: "Welcome back!",
          text: "You have successfully signed in.",
          timer: 2000,
          showConfirmButton: false,
        });

        try {
          const role = roleIdToRole(Number(loginData.roleId));
          router.push(ROLE_HOME_ROUTE[role]);
        } catch {
          toast.error("Login failed: unsupported account role.");
        }
      } else if (response.status === 409) {
        onEmailNotVerified?.(variables.email);
        toast.warning("Please verify your email first.");
      } else {
        const detail = (response.data as { detail?: string })?.detail;
        toast.error(detail ?? "Invalid email or password.");
      }
    },
  });
}

// ─── Forgot password (send OTP) ───────────────────────────────────────────────
interface UseForgotPasswordOptions {
  onOtpSent?: (email: string) => void;
}

export function useForgotPasswordMutation({
  onOtpSent,
}: UseForgotPasswordOptions = {}) {
  return useMutation({
    mutationFn: (email: string) => sendForgotPasswordOtp(email),
    onSuccess: (response, email) => {
      if (response.status === 200) {
        onOtpSent?.(email);
        toast.success("Reset code sent to your email.");
      } else {
        const detail = (response.data as { detail?: string })?.detail;
        toast.error(detail ?? "Failed to send reset code.");
      }
    },
  });
}

// ─── Reset password ───────────────────────────────────────────────────────────
interface UseResetPasswordOptions {
  onSuccess?: () => void;
}

export function useResetPasswordMutation({
  onSuccess,
}: UseResetPasswordOptions = {}) {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPasswordService(data),
    onSuccess: (response) => {
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: "Your password has been successfully updated.",
        });
        onSuccess?.();
      } else {
        const detail = (response.data as { detail?: string })?.detail;
        toast.error(detail ?? "Failed to reset password.");
      }
    },
  });
}

// ─── Verify email ─────────────────────────────────────────────────────────────
interface UseVerifyEmailOptions {
  onSuccess?: () => void;
}

export function useVerifyEmailMutation({
  onSuccess,
}: UseVerifyEmailOptions = {}) {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      verifyEmailService(email, otp),
    onSuccess: (response) => {
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Email Verified",
          text: "You can now sign in with your account.",
        });
        onSuccess?.();
      } else {
        const detail = (response.data as { detail?: string })?.detail;
        toast.error(detail ?? "Invalid verification code.");
      }
    },
  });
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────
export function useResendOtpMutation() {
  return useMutation({
    mutationFn: (email: string) => resendVerificationCode(email),
    onSuccess: () => toast.success("New verification code sent."),
  });
}
