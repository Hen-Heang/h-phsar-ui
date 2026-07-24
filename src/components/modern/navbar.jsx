import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "./theme-toggle";

const LINKS = ["Features", "Projects", "Pricing", "Contact"];

export function ModernNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md  ">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 "
        >
          <img src="/logo/icon.png" alt="" className="h-8 w-8 object-contain" />
          H-Phsar 2026
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link}>
              <a
                href="/#"
                className="text-sm text-slate-600 transition hover:text-blue-600  "
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700   "
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
            className="border-t border-slate-200 bg-white px-4 py-4   md:hidden"
          >
            <ul className="space-y-1">
              {LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="/#"
                    className="block rounded-lg px-2 py-3 text-slate-700 transition hover:bg-slate-100  "
                  >
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
