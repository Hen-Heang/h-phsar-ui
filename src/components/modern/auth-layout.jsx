import React from "react";
import { motion } from "framer-motion";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function AuthLayout({ children, title, description, showBackButton = true }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Side: Illustration / Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-12 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.12),transparent_35%)]" />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <Package className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight">StockFlow</span>
        </div>

        <div className="relative z-10">
          <blockquote className="space-y-4">
            <p className="text-lg font-medium leading-relaxed">
              "StockFlow has transformed how we manage our inventory and connect with our distributors. The platform is intuitive, fast, and reliable."
            </p>
            <footer className="text-sm">
              <p className="font-semibold text-white">Sok San</p>
              <p className="text-slate-400">Owner, San's Retail</p>
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} StockFlow Commerce. All Rights Reserved.
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex flex-col p-6 md:p-12 lg:p-16 justify-center relative">
        {showBackButton && (
          <div className="absolute top-6 left-6 md:top-12 md:left-12">
            <Button variant="ghost" size="sm" asChild className="gap-2 text-slate-600 hover:text-slate-900">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        )}

        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="text-slate-500">{description}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
