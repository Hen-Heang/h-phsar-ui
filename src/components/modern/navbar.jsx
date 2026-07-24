"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { HPhsarLogo } from "@/components/brand/HPhsarLogo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
];

export function ModernNavbar() {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6"
        aria-label="Public navigation"
      >
        <Link href="/" className="inline-flex min-h-11 items-center">
          <HPhsarLogo variant="compact" priority />
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <motion.li
              key={link.href}
              initial="rest"
              whileHover="hover"
            >
              <Link href={link.href} className="group relative block py-2 text-sm font-semibold text-muted-foreground hover:text-brand-primary">
                <motion.span
                  className="block"
                  whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                >
                  {link.label}
                </motion.span>
                <motion.span
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-full bg-brand-primary"
                  variants={
                    shouldReduceMotion
                      ? undefined
                      : { rest: { scaleX: 0 }, hover: { scaleX: 1 } }
                  }
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </motion.li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "menu"}
                initial={shouldReduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, rotate: 45, scale: 0.8 }}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-surface px-4 md:hidden"
          >
            <ul className="space-y-1 py-4">
              {LINKS.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: shouldReduceMotion ? 0 : index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block min-h-11 rounded-xl px-3 py-3 font-semibold text-foreground hover:bg-muted hover:text-brand-primary"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="flex gap-3 border-t border-border py-4">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/sign-up" onClick={() => setOpen(false)}>Get started</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
