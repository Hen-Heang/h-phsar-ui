"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ADMIN_NAV } from "@/config/navigation";

export default function AdminDashboard() {
  const shouldReduceMotion = useReducedMotion();
  const managementRoutes = ADMIN_NAV.filter(
    (item) => item.href !== "/admin/dashboard",
  );

  return (
    <section aria-labelledby="admin-dashboard-title" className="space-y-8">
      <header className="max-w-3xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-admin">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 id="admin-dashboard-title" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Admin dashboard
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Manage the Supplier and Buyer accounts supported by the current H-Phsar API.
          Additional platform analytics are intentionally omitted until backend data is available.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {managementRoutes.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              className="h-full"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.28,
                delay: shouldReduceMotion ? 0 : index * 0.06,
              }}
            >
              <Link
                href={item.href}
                className="group block h-full rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md motion-reduce:transform-none"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-admin">
                    {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
                </div>
                <h2 className="mt-6 text-lg font-bold text-foreground">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
