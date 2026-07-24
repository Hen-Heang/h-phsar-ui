"use client";

import React, { useState } from "react";

import { AuthLayout } from "@/components/modern/auth-layout";
import { SignInForm } from "@/components/modern/auth/signin-form";
import { ForgotPassword } from "@/components/modern/auth/forgot-password";
import { OTPVerification } from "@/components/modern/auth/otp-verification";

import {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
} from "@/hooks/auth/useAuth";

import type { LoginCredentials } from "@/types/auth";

type AuthView = "signin" | "forgot-password" | "verify-email";
type ForgotStep = "email" | "reset";

export default function SignInPage() {
  const [view, setView] = useState<AuthView>("signin");
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [resetEmail, setResetEmail] = useState("");
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState("");

  const loginMutation = useLoginMutation({
    onEmailNotVerified: (email) => {
      setPendingVerifyEmail(email);
      setView("verify-email");
    },
  });

  const forgotPasswordMutation = useForgotPasswordMutation({
    onOtpSent: (email) => {
      setResetEmail(email);
      setForgotStep("reset");
    },
  });

  const resetPasswordMutation = useResetPasswordMutation({
    onSuccess: () => setView("signin"),
  });

  const verifyEmailMutation = useVerifyEmailMutation({
    onSuccess: () => setView("signin"),
  });

  const resendOtpMutation = useResendOtpMutation();

  const titles: Record<AuthView, string> = {
    signin: "Sign in to H-Phsar",
    "forgot-password": "Reset Password",
    "verify-email": "Verify your email",
  };

  const descriptions: Record<AuthView, string> = {
    signin: "Enter your credentials to access your dashboard.",
    "forgot-password": "We'll help you get back into your account.",
    "verify-email": "Enter the code we sent to your email.",
  };

  return (
    <AuthLayout title={titles[view]} description={descriptions[view]}>
      {view === "signin" && (
        <SignInForm
          onSubmit={(data: LoginCredentials) => loginMutation.mutate(data)}
          isLoading={loginMutation.isPending}
          onForgotPassword={() => setView("forgot-password")}
        />
      )}

      {view === "forgot-password" && (
        <ForgotPassword
          step={forgotStep}
          email={resetEmail}
          onSendOTP={({ email }) => forgotPasswordMutation.mutate(email)}
          onResetPassword={(data) =>
            resetPasswordMutation.mutate({
              email: resetEmail,
              otp: data.otp,
              password: data.password,
            })
          }
          onBack={() => {
            setView("signin");
            setForgotStep("email");
          }}
          isLoading={
            forgotPasswordMutation.isPending || resetPasswordMutation.isPending
          }
        />
      )}

      {view === "verify-email" && (
        <OTPVerification
          email={pendingVerifyEmail}
          onVerify={(otp: string) =>
            verifyEmailMutation.mutate({ email: pendingVerifyEmail, otp })
          }
          onResend={() => resendOtpMutation.mutate(pendingVerifyEmail)}
          isLoading={verifyEmailMutation.isPending}
          isResending={resendOtpMutation.isPending}
        />
      )}
    </AuthLayout>
  );
}
