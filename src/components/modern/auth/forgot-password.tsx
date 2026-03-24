"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { cn } from "@/lib/cn";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

const resetPasswordSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetPasswordSchema>;

interface ForgotPasswordProps {
  step: "email" | "reset";
  email: string;
  onSendOTP: (data: EmailFormData) => void;
  onResetPassword: (data: ResetFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function ForgotPassword({
  onSendOTP,
  onResetPassword,
  onBack,
  isLoading,
  step,
  email,
}: ForgotPasswordProps) {
  const {
    register: regEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });

  const {
    register: regReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetFormData>({ resolver: zodResolver(resetPasswordSchema) });

  if (step === "email") {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </button>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Forgot your password?
          </h2>
          <p className="text-sm text-slate-500">
            Enter your email address and we&apos;ll send you a code to reset
            your password.
          </p>
        </div>

        <form onSubmit={handleEmailSubmit(onSendOTP)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="reset-email"
                type="email"
                placeholder="name@example.com"
                className={cn("pl-10", emailErrors.email && "border-red-500")}
                {...regEmail("email")}
                disabled={isLoading}
              />
            </div>
            {emailErrors.email && (
              <p className="text-xs font-medium text-red-500">
                {emailErrors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Reset password</h2>
        <p className="text-sm text-slate-500">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold">{email}</span> and your new password.
        </p>
      </div>

      <form onSubmit={handleResetSubmit(onResetPassword)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="otp"
              placeholder="123456"
              className={cn("pl-10", resetErrors.otp && "border-red-500")}
              {...regReset("otp")}
              disabled={isLoading}
            />
          </div>
          {resetErrors.otp && (
            <p className="text-xs font-medium text-red-500">
              {resetErrors.otp.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              className={cn("pl-10", resetErrors.password && "border-red-500")}
              {...regReset("password")}
              disabled={isLoading}
            />
          </div>
          {resetErrors.password && (
            <p className="text-xs font-medium text-red-500">
              {resetErrors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </div>
  );
}
