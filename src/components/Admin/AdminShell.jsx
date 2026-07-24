"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { HPhsarLogo } from "@/components/brand/HPhsarLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ADMIN_NAV } from "@/config/navigation";
import { ROLES } from "@/config/roles";
import { clearAuthToken } from "@/lib/auth/authStore";
import { cn } from "@/lib/cn";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const signOut = () => {
    clearAuthToken();
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    router.replace("/sign-in");
  };

  const navigation = (
    <nav aria-label="Admin navigation" className="space-y-1.5">
      {ADMIN_NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-white text-admin shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
          >
            {active && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-primary"
                initial={shouldReduceMotion ? false : { opacity: 0, scaleY: 0.5 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              />
            )}
            <motion.span
              className="flex items-center gap-3"
              whileHover={shouldReduceMotion ? undefined : { x: 3 }}
              transition={{ duration: 0.18 }}
            >
              {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
              {item.label}
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <RoleGuard role={ROLES.ADMIN}>
      <div className="min-h-screen bg-background md:flex">
        <aside className="hidden w-64 shrink-0 flex-col bg-[var(--admin-accent)] p-5 text-white md:flex">
          <Link href="/admin/dashboard" className="mb-8 inline-flex min-h-11 items-center">
            <HPhsarLogo surface="dark" variant="compact" priority />
          </Link>
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <ShieldCheck className="h-8 w-8 text-teal-300" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Admin console</p>
              <p className="text-xs text-slate-300">Account management</p>
            </div>
          </div>
          <div className="flex-1">{navigation}</div>
          <Button
            variant="ghost"
            className="justify-start gap-3 text-slate-200 hover:bg-white/10 hover:text-white"
            onClick={() => setConfirmSignOut(true)}
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Sign out
          </Button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur md:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-admin">H-Phsar</p>
              <p className="text-sm font-semibold text-foreground">Administration</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label="Open admin navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </header>
          <main className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</main>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="fixed inset-0 z-50 md:hidden"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              <motion.button
                type="button"
                className="absolute inset-0 bg-slate-950/50"
                aria-label="Close admin navigation"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                role="dialog"
                aria-modal="true"
                aria-label="Admin navigation menu"
                className="relative flex h-full w-[min(84vw,20rem)] flex-col bg-[var(--admin-accent)] p-5 text-white shadow-2xl"
                initial={shouldReduceMotion ? false : { x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.24,
                  ease: "easeOut",
                }}
              >
                <div className="mb-8 flex items-center justify-between">
                  <HPhsarLogo surface="dark" variant="compact" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    aria-label="Close admin navigation"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex-1">{navigation}</div>
                <Button
                  variant="ghost"
                  className="justify-start gap-3 text-slate-200 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setMobileOpen(false);
                    setConfirmSignOut(true);
                  }}
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Sign out
                </Button>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={confirmSignOut} onOpenChange={setConfirmSignOut}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogTitle>Sign out of the Admin console?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              You will need to sign in again to manage H-Phsar accounts.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmSignOut(false)}>
                Stay signed in
              </Button>
              <Button variant="destructive" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
