"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import {
  useSignUpMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
} from "@/hooks/auth/useAuth";
import { AuthLayout } from "@/components/modern/auth-layout";
import { SignUpForm } from "@/components/modern/auth/signup-form";
import { RoleSelection } from "@/components/modern/auth/role-selection";
import { OTPVerification } from "@/components/modern/auth/otp-verification";

type SignUpView = "signup" | "choose-role" | "verify-email";

export default function SignUpPage() {
  const router = useRouter();

  const [view, setView] = useState<SignUpView>("signup");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  const signUpMutation = useSignUpMutation({
    onOtpSent: (email) => {
      setFormData((prev) => ({ ...prev, email }));
      setView("verify-email");
    },
  });

  const verifyEmailMutation = useVerifyEmailMutation({
    onSuccess: () => router.push("/sign-in"),
  });

  const resendOtpMutation = useResendOtpMutation();

  const getTitle = () => {
    if (view === "choose-role") return "Choose your role";
    if (view === "verify-email") return "Verify your email";
    return "Create an account";
  };

  const getDescription = () => {
    if (view === "choose-role") return "Select how you want to use StockFlow.";
    if (view === "verify-email") return "We've sent a code to your email.";
    return "Join our platform to start managing your business.";
  };

  return (
    <AuthLayout title={getTitle()} description={getDescription()}>
      {view === "signup" && (
        <SignUpForm
          onSubmit={(data) => {
            setFormData(data);
            setView("choose-role");
          }}
          isLoading={false}
        />
      )}

      {view === "choose-role" && (
        <RoleSelection
          selectedRole={selectedRole}
          onSelect={setSelectedRole}
          onConfirm={() => {
            if (selectedRole === null) return;
            signUpMutation.mutate({ ...formData, roleId: selectedRole });
          }}
          isLoading={signUpMutation.isPending}
        />
      )}

      {view === "verify-email" && (
        <OTPVerification
          email={formData.email}
          onVerify={(otp) =>
            verifyEmailMutation.mutate({ email: formData.email, otp })
          }
          onResend={() => resendOtpMutation.mutate(formData.email)}
          isLoading={verifyEmailMutation.isPending}
          isResending={resendOtpMutation.isPending}
        />
      )}
    </AuthLayout>
  );
}
