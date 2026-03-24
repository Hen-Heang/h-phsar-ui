"use client";

import React, { useState } from "react";
import OTPInputBase from "react-otp-input";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OTPInput = OTPInputBase as React.ComponentType<any>;
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "@/lib/cn";

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isLoading: boolean;
  isResending?: boolean;
}

export function OTPVerification({
  email,
  onVerify,
  onResend,
  isLoading,
  isResending,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-slate-500">
          We&apos;ve sent a 6-digit verification code to{" "}
          <span className="font-semibold text-slate-900">{email}</span>.
        </p>
      </div>

      <div className="flex justify-center">
        <OTPInput
          value={otp}
          onChange={setOtp}
          numInputs={4}
          renderSeparator={<span className="mx-1 text-slate-300">-</span>}
          renderInput={(props: React.InputHTMLAttributes<HTMLInputElement>) => (
            <input
              {...props}
              className={cn(
                "h-12 w-10 md:w-12 rounded-md border border-slate-200 bg-white text-center text-lg font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-600 outline-none transition",
                props.className,
              )}
              style={{ width: "2.5rem" }}
            />
          )}
          shouldAutoFocus
        />
      </div>

      <Button
        onClick={() => otp.length === 4 && onVerify(otp)}
        className="w-full"
        disabled={isLoading || otp.length !== 4}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Email"
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
        >
          {isResending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Resend code
        </button>
      </div>
    </div>
  );
}
