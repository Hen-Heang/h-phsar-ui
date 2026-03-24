"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Package,
  TrendingUp,
  Bell,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ModernNavbar } from "../../components/modern/navbar";

const FEATURES = [
  {
    title: "Track Orders Real-Time",
    description:
      "Never guess when an order will arrive. Full visibility from warehouse to shelf.",
    icon: <Package className="h-6 w-6 text-blue-600 " />,
  },
  {
    title: "Export & Analyze",
    description:
      "Easily export your order reports to know exactly how much you have spent and earned.",
    icon: <TrendingUp className="h-6 w-6 text-blue-600 " />,
  },
  {
    title: "Instant Alerts",
    description:
      "Get timely alerts when high-demand products restock or become available.",
    icon: <Bell className="h-6 w-6 text-blue-600 " />,
  },
  {
    title: "Shop with Confidence",
    description:
      "Verified distributors and secure transactions make purchasing worry-free.",
    icon: <ShieldCheck className="h-6 w-6 text-blue-600 " />,
  },
  {
    title: "Save Precious Time",
    description:
      "With just a few clicks, you can purchase diverse products from anywhere.",
    icon: <Clock className="h-6 w-6 text-blue-600 " />,
  },
  {
    title: "Buy in Volume",
    description:
      "Purchase goods in large volumes with reasonable pricing and tiered discounts.",
    icon: <CheckCircle2 className="h-6 w-6 text-blue-600 " />,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50  font-sans text-slate-900 ">
      <ModernNavbar />

      <main>
        {/* Modernized Hero Section */}
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
                Connecting Quality Products with Trusted Partners
              </p>

              <h1 className="text-4xl font-black tracking-tight text-slate-900  md:text-6xl">
                Warehouse Master
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600  md:text-lg">
                StockFlow is a platform that connects Products with Distributors
                and Retailers in their target market and helps find new and
                innovative products.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/sign-up">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-6xl px-4 pb-24 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900  md:text-4xl">
              Our Best Features
            </h2>
            <p className="mt-4 text-slate-600  max-w-2xl mx-auto">
              We provide happiness through products, groceries and everyday
              essentials by making ordering easy, fast and fun.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                <Card className="h-full border-slate-200  bg-white/50  backdrop-blur-sm transition-transform hover:-translate-y-1 hover:shadow-lg ">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 ">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-slate-600 ">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white  py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900  mb-6">
                  How Does This Work?
                </h2>
                <p className="text-slate-600  mb-8 text-lg">
                  StockFlow streamlines your entire supply chain process from
                  onboarding to purchasing.
                </p>

                <div className="space-y-8">
                  {[
                    {
                      title: "Sign up your account",
                      desc: "Quick verification via Google to ensure secure access to our platform.",
                    },
                    {
                      title: "Choose your role",
                      desc: "Select whether you want to operate as a distributor or a retailer.",
                    },
                    {
                      title: "Head Online",
                      desc: "Once setup is complete, dive into the dashboard and start managing stock.",
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 ">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-slate-600 ">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden lg:block rounded-2xl overflow-hidden bg-slate-100  p-8">
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-tr from-blue-600/20 to-sky-500/20 border border-slate-200/50  flex items-center justify-center shadow-inner">
                  <Package className="w-32 h-32 text-blue-600/40 " />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <Package className="h-6 w-6" />
                </div>
                <span className="text-xl font-black tracking-tight text-white ">
                  StockFlow
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400 ">
                The next-generation B2B marketplace for high-performance
                warehouse operations. Built for distributors and retailers
                worldwide.
              </p>
              <div className="flex gap-4">
                <Facebook className="h-5 w-5 text-slate-500 hover:text-blue-500 cursor-pointer transition-colors" />
                <Instagram className="h-5 w-5 text-slate-500 hover:text-pink-500 cursor-pointer transition-colors" />
                <Twitter className="h-5 w-5 text-slate-500 hover:text-blue-400 cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">
                Organization
              </h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li className="hover:text-blue-500 cursor-pointer transition-colors">
                  Our Mission
                </li>
                <li className="hover:text-blue-500 cursor-pointer transition-colors">
                  HRD Korea Center
                </li>
                <li className="hover:text-blue-500 cursor-pointer transition-colors">
                  11th Generation
                </li>
                <li className="hover:text-blue-500 cursor-pointer transition-colors">
                  Career Path
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">
                Contact Support
              </h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-500" /> +855 12 850 001
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-500" />{" "}
                  support@stockflow.com
                </li>
                <li className="flex items-center gap-3 text-xs leading-relaxed">
                  <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />{" "}
                  Korea Software HRD Center, Phnom Penh
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">
                Security & Trust
              </h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li className="flex items-center gap-3 hover:text-blue-500 cursor-pointer transition-colors">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Privacy
                  Shield
                </li>
                <li className="flex items-center gap-3 hover:text-blue-500 cursor-pointer transition-colors">
                  <Package className="h-4 w-4 text-blue-500" /> Verified
                  Logistics
                </li>
                <li className="flex items-center gap-3 hover:text-blue-500 cursor-pointer transition-colors">
                  <ArrowRight className="h-4 w-4 text-orange-500" /> Terms of
                  Service
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium text-slate-500 ">
              © {new Date().getFullYear()} StockFlow Commerce. All Rights
              Reserved.
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
              <span className="hover:text-slate-400 cursor-pointer">
                Documentation
              </span>
              <span className="hover:text-slate-400 cursor-pointer">
                API Status
              </span>
              <span className="hover:text-slate-400 cursor-pointer">
                Changelog
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
