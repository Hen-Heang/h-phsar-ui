import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "./theme-toggle";

const LINKS = ["Features", "Projects", "Pricing", "Contact"];

export function ModernNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/70">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a href="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          H-Phsar 2026
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link}>
              <a
                href="/#"
                className="text-sm text-slate-600 transition hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button size="sm">Get Started</Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:hidden"
          >
            <ul className="space-y-1">
              {LINKS.map((link) => (
                <li key={link}>
                  <a href="/#" className="block rounded-lg px-2 py-3 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            <Button className="mt-4 w-full">Get Started</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
