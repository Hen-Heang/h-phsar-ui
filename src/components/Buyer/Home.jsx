"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Store,
  ArrowRight,
  Sparkles,
  Package,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 pb-20 font-family-retailer">
      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[3rem] bg-slate-900 px-8 py-20 text-white shadow-2xl mb-12"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-md">
              <Zap className="h-3 w-3 text-indigo-400" />
              Next-Gen Procurement
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-6">
              Manage Your <span className="text-indigo-500">Marketplace</span>{" "}
              with Precision.
            </h1>
            <p className="text-lg text-slate-400 font-medium mb-10 leading-relaxed">
              Welcome to your H-Phsar management hub. This high-performance
              dashboard is being optimized to provide you with real-time
              inventory synchronization.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="h-14 rounded-2xl bg-indigo-500 px-8 font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all">
                Enter Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-2xl border-white/10 bg-white/5 px-8 font-black text-xs uppercase tracking-widest text-white hover:bg-white/10 backdrop-blur-md"
              >
                View Documentation
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Status Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              label: "Track Orders",
              desc: "Real-time logistics monitoring",
              icon: ShoppingBag,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Analyze Growth",
              desc: "Business intelligence reports",
              icon: TrendingUp,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Verify Security",
              desc: "Certified distribution partners",
              icon: ShieldCheck,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "Instant Stock",
              desc: "Rapid procurement workflow",
              icon: Package,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] bg-white cursor-pointer overflow-hidden">
                <CardContent className="p-8">
                  <div
                    className={cn(
                      "p-4 rounded-2xl mb-6 w-fit transition-transform group-hover:scale-110",
                      item.bg,
                      item.color,
                    )}
                  >~
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    {item.label}
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Coming Soon Teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 mb-6">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Module Under Construction
          </h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Our engineers are finalizing the new Marketplace dashboard. Expect a
            revolutionary way to handle B2B procurement very soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
