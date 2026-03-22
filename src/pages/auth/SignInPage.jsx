"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

import {
  loginService,
  forget_password,
  verifyEmailService,
  change_password,
  generateCodeService,
} from "../../redux/services/auth/auth.server";
import { setDataLogin } from "../../redux/slices/auth/authSlice";

import { AuthLayout } from "../../components/modern/auth-layout";
import { SignInForm } from "../../components/modern/auth/signin-form";
import { ForgotPassword } from "../../components/modern/auth/forgot-password";
import { OTPVerification } from "../../components/modern/auth/otp-verification";

export default function SignInPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState("signin"); // signin, forgot-password, verify-email
  const [forgotPasswordStep, setForgotPasswordStep] = useState("email"); // email, reset
  const [resetEmail, setResetEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");

  const handleLogin = async (data) => {
    setIsLoading(true);
    try {
      if (!navigator.onLine) {
        toast.error("No internet connection.");
        setIsLoading(false);
        return;
      }

      const response = await loginService(data);
      
      if (response.status === 200) {
        dispatch(setDataLogin(response.data.data));
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("role", response.data.data.roleId);
        localStorage.setItem("email", data.email);
        localStorage.setItem("userId", response.data.data.userId);

        Swal.fire({
          icon: "success",
          title: "Welcome back!",
          text: "You have successfully signed in.",
          timer: 2000,
          showConfirmButton: false,
        });

        if (response.data.data.roleId === 1) {
          router.push("/distributor/home");
        } else {
          router.push("/retailer/home");
        }
      } else if (response.status === 409) {
        // Email not verified
        setVerifyEmail(data.email);
        setView("verify-email");
        toast.warning("Please verify your email first.");
      } else {
        toast.error(response.data.detail || "Invalid email or password");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetOTP = async (data) => {
    setIsLoading(true);
    try {
      const response = await forget_password(data.email);
      if (response.status === 200) {
        setResetEmail(data.email);
        setForgotPasswordStep("reset");
        toast.success("Reset code sent to your email.");
      } else {
        toast.error(response.data.detail || "Failed to send reset code.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    setIsLoading(true);
    try {
      const response = await change_password({
        email: resetEmail,
        otp: data.otp,
        password: data.password,
      });
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: "Your password has been successfully updated.",
        });
        setView("signin");
      } else {
        toast.error(response.data.detail || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (otp) => {
    setIsLoading(true);
    try {
      const response = await verifyEmailService({ email: verifyEmail }, otp);
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Email Verified",
          text: "You can now sign in with your account.",
        });
        setView("signin");
      } else {
        toast.error(response.data.detail || "Invalid verification code.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await generateCodeService({ email: verifyEmail });
      toast.success("New verification code sent.");
    } catch (error) {
      toast.error("Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (view === "forgot-password") return "Reset Password";
    if (view === "verify-email") return "Verify your email";
    return "Sign in to StockFlow";
  };

  const getDescription = () => {
    if (view === "forgot-password") return "We'll help you get back into your account.";
    if (view === "verify-email") return "Enter the code we sent to your email.";
    return "Enter your credentials to access your dashboard.";
  };

  return (
    <AuthLayout title={getTitle()} description={getDescription()}>
      {view === "signin" && (
        <SignInForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          onForgotPassword={() => setView("forgot-password")}
        />
      )}

      {view === "forgot-password" && (
        <ForgotPassword
          step={forgotPasswordStep}
          email={resetEmail}
          onSendOTP={handleSendResetOTP}
          onResetPassword={handleResetPassword}
          onBack={() => {
            setView("signin");
            setForgotPasswordStep("email");
          }}
          isLoading={isLoading}
        />
      )}

      {view === "verify-email" && (
        <OTPVerification
          email={verifyEmail}
          onVerify={handleVerifyEmail}
          onResend={handleResendOTP}
          isLoading={isLoading}
        />
      )}
    </AuthLayout>
  );
}

