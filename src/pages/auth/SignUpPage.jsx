"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

import {
  registerService,
  generateCodeService,
  verifyEmailService,
} from "../../redux/services/auth/auth.server";

import { AuthLayout } from "../../components/modern/auth-layout";
import { SignUpForm } from "../../components/modern/auth/signup-form";
import { RoleSelection } from "../../components/modern/auth/role-selection";
import { OTPVerification } from "../../components/modern/auth/otp-verification";

export default function SignUpPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState("signup"); // signup, choose-role, verify-email
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSignUpSubmit = (data) => {
    setFormData({ email: data.email, password: data.password });
    setView("choose-role");
  };

  const handleConfirmRole = async () => {
    setIsLoading(true);
    try {
      const response = await registerService(formData, { roleId: selectedRole });
      
      if (response.data.status === 201) {
        // Registration successful, now send OTP
        const otpResponse = await generateCodeService({ email: formData.email });
        if (otpResponse.data.status === 201) {
          setView("verify-email");
          toast.success("Account created! Please verify your email.");
        } else {
          toast.error("Account created, but failed to send verification code.");
        }
      } else {
        toast.error(response.data.detail || "Registration failed.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (otp) => {
    setIsLoading(true);
    try {
      const response = await verifyEmailService({ email: formData.email }, otp);
      if (response.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Congratulations!",
          text: "Your account has been verified successfully.",
          confirmButtonColor: "#2563eb",
        }).then(() => {
          router.push("/sign-in");
        });
      } else {
        toast.error(response.data.detail || "Invalid verification code.");
      }
    } catch (error) {
      toast.error("An error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await generateCodeService({ email: formData.email });
      toast.success("New verification code sent.");
    } catch (error) {
      toast.error("Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

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
          onSubmit={handleSignUpSubmit}
          isLoading={isLoading}
        />
      )}

      {view === "choose-role" && (
        <RoleSelection
          selectedRole={selectedRole}
          onSelect={setSelectedRole}
          onConfirm={handleConfirmRole}
          isLoading={isLoading}
        />
      )}

      {view === "verify-email" && (
        <OTPVerification
          email={formData.email}
          onVerify={handleVerifyEmail}
          onResend={handleResendOTP}
          isLoading={isLoading}
        />
      )}
    </AuthLayout>
  );
}

