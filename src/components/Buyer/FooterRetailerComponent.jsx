import React from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Send,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FooterRetailerComponent() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 bg-slate-950 text-slate-300">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800/60">
        <div className="mx-auto max-w-[105rem] px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="max-w-xl text-center lg:text-left">
              <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Stay updated with H-Phsar
              </h3>
              <p className="mt-2 text-slate-400">
                Join our newsletter to receive the latest updates on new
                distributors and stock arrivals.
              </p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-12 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <Button className="h-12 rounded-xl bg-indigo-500 px-8 font-bold text-white hover:bg-indigo-600 transition-all active:scale-[0.98]">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[105rem] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/buyer/home" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <Package className="h-7 w-7" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                H-Phsar
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
              The premier B2B marketplace connecting regional retailers with
              high-quality distributors. Streamline your procurement process
              with our modern warehouse management tools.
            </p>
            <div className="mt-8 flex gap-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 transition-all hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Group */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:ml-auto">
            {/* Navigation */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                Platform
              </h4>
              <ul className="mt-6 space-y-4">
                {[
                  { href: "/buyer/home", label: "Marketplace" },
                  { href: "/buyer/orders", label: "Order Tracking" },
                  { href: "/buyer/bookmarks", label: "Saved Shops" },
                  { href: "/buyer/reports", label: "Business Intelligence" },
                  { href: "/buyer/drafts", label: "Saved Drafts" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center text-sm font-medium text-slate-400 transition hover:text-indigo-500"
                    >
                      <ArrowRight className="mr-2 h-3 w-3 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                Resources
              </h4>
              <ul className="mt-6 space-y-4">
                {[
                  { label: "Help Center", href: "#" },
                  { label: "Partner Program", href: "#" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "Safety Guide", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group flex items-center text-sm font-medium text-slate-400 transition hover:text-indigo-500"
                    >
                      <ArrowRight className="mr-2 h-3 w-3 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                Global Contact
              </h4>
              <ul className="mt-6 space-y-5">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <div className="text-sm font-medium">
                    <p className="text-slate-200">+855 12 850 001</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      HQ Hotline
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <div className="text-sm font-medium">
                    <p className="text-slate-200">support@stockflow.com</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      Inquiries
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <div className="text-sm font-medium">
                    <p className="text-slate-200">Phnom Penh, Cambodia</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                      Regional Hub
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <p className="text-xs font-medium text-slate-500">
              © {currentYear} H-Phsar Commerce. Proudly developed by 11th Gen
              Students.
            </p>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">
              Korea Software HRD Center • Enterprise Edition
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Secure Cloud
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <ShoppingBag className="h-4 w-4 text-blue-500/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Certified Logistics
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
