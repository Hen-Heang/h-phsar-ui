"use client";

import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

const MODES = ["light", "dark", "system"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const currentIndex = MODES.indexOf(theme);

  const cycleTheme = () => {
    const nextMode = MODES[(currentIndex + 1) % MODES.length];
    setTheme(nextMode);
  };

  return (
    <motion.button
      type="button"
      onClick={cycleTheme}
      whileTap={{ scale: 0.95 }}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100    "
      aria-label={`Toggle theme, current mode is ${theme}`}
      title={`Theme: ${theme}`}
    >
      {theme === "light" && <Sun className="h-5 w-5" />}
      {theme === "dark" && <Moon className="h-5 w-5" />}
      {theme === "system" && <Monitor className="h-5 w-5" />}
    </motion.button>
  );
}
