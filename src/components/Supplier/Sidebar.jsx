"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, Download, History, LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HPhsarLogo } from "@/components/brand/HPhsarLogo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SUPPLIER_NAV } from "@/config/navigation";
import { performLogout } from "@/lib/auth/auth.service";
import { cn } from "@/lib/cn";
import { useAppDispatch as useDispatch } from "@/redux/hooks";
import { getAccountDistributer } from "@/redux/slices/supplier/AccountSlice";
import { getAllCategoryDistributor } from "@/redux/slices/supplier/categorySlice";
import { getAllProduct } from "@/redux/slices/supplier/productSlice";
import { getDataStore } from "@/redux/slices/supplier/storeSlice";
import NewImport from "./NewImport";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const shouldReduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const handleSignOut = async () => {
    await performLogout();
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    dispatch(getAllProduct([]));
    dispatch(getAllCategoryDistributor([]));
    dispatch(getDataStore([]));
    dispatch(getAccountDistributer([]));
    router.replace("/sign-in");
  };

  const renderNavigation = (scope) => (
    <nav aria-label="Supplier navigation" className="space-y-1.5">
      {SUPPLIER_NAV.map((item, index) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <motion.div
            key={item.href}
            initial={
              scope === "mobile" && !shouldReduceMotion
                ? { opacity: 0, x: -16 }
                : false
            }
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: scope === "mobile" && !shouldReduceMotion ? index * 0.045 : 0 }}
          >
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 items-center overflow-hidden rounded-xl px-3 py-2.5 text-sm font-semibold",
                active
                  ? "text-supplier"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              {active && (
                <motion.span
                  layoutId={`supplier-${scope}-active-nav`}
                  className="absolute inset-0 rounded-xl bg-teal-50"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              )}
              <motion.span
                className="relative z-10 flex items-center gap-3"
                whileHover={shouldReduceMotion ? undefined : { x: 4 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              >
                {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
                {item.label}
              </motion.span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );

  const utilityActions = (
    <div className="mt-5 border-t border-border pt-5">
      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Inventory tools
      </p>
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950"
        onClick={() => {
          setMobileOpen(false);
          setShowImport(true);
        }}
      >
        <Download className="h-5 w-5" aria-hidden="true" />
        New import
      </button>
      <Link
        href="/supplier/import-history"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
          pathname === "/supplier/import-history"
            ? "bg-teal-50 text-supplier"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
        )}
      >
        <History className="h-5 w-5" aria-hidden="true" />
        Import history
      </Link>
    </div>
  );

  const renderPanel = (scope) => (
    <>
      <Link href="/supplier/dashboard" className="mb-7 inline-flex min-h-11 items-center">
        <HPhsarLogo variant="compact" priority />
      </Link>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {renderNavigation(scope)}
        {utilityActions}
      </div>
      <Button
        variant="ghost"
        className="mt-4 justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setShowSignOut(true)}
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        Sign out
      </Button>
    </>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-surface p-5 lg:flex">
        {renderPanel("desktop")}
      </aside>

      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <HPhsarLogo variant="compact" priority />
        <Button
          variant="ghost"
          size="sm"
          aria-label="Open supplier navigation"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40"
              aria-label="Close supplier navigation"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={shouldReduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 300, damping: 30 }
              }
              className="relative flex h-full w-[min(86vw,21rem)] flex-col bg-surface p-5 shadow-2xl"
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-4"
                aria-label="Close supplier navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
              {renderPanel("mobile")}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <NewImport
        isOpenNewImport={showImport}
        handleShowImport={() => setShowImport(false)}
      />

      <Dialog open={showSignOut} onOpenChange={setShowSignOut}>
        <DialogContent className="max-w-md rounded-3xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <DialogTitle>Sign out of your Supplier account?</DialogTitle>
          <p className="text-sm text-muted-foreground">
            You will need to sign in again to manage products, inventory, and orders.
          </p>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSignOut(false)}>
              Stay signed in
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
