import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.14),transparent_32%)]" />
      <div className="relative mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700   ">
            <Sparkles className="h-4 w-4" />
            Built for modern commerce teams
          </p>

          <h1 className="text-4xl font-black tracking-tight text-slate-900  md:text-6xl">
            Manage stock, orders, and growth in one polished dashboard.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600  md:text-lg">
            Ship faster with a refined UI, meaningful motion, and a clean design
            system that scales.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg">Start Free Trial</Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
