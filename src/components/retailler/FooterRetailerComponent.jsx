import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Send,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

export default function FooterRetailerComponent() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-slate-200 bg-white pt-16 dark:border-slate-800 dark:bg-slate-950">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      
      <div className="mx-auto max-w-[105rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/retailer/home" className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-orange-100 p-0.5 dark:bg-orange-950/30">
                <img
                  src={require("../../assets/images/retailer/whitelogo.png")?.default || require("../../assets/images/retailer/whitelogo.png")}
                  alt="H-Phsar Logo"
                  className="h-full w-full object-contain brightness-0 filter dark:invert"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                H-Phsar
              </span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Connecting local retailers with the best distributors. Quality stock, managed efficiently in one modern platform.
            </p>
            <div className="mt-8 flex gap-4">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Send, href: "#", label: "Telegram" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:border-orange-500 hover:text-orange-500 dark:border-slate-800 dark:text-slate-600 dark:hover:border-orange-500"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Platform</h3>
            <ul className="mt-6 space-y-4">
              {[
                { to: "/retailer/home", label: "Marketplace" },
                { to: "/retailer/order", label: "Track Orders" },
                { to: "/retailer/report", label: "Analytics" },
                { to: "/retailer/favorite", label: "Favorites" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group flex items-center text-sm text-slate-500 transition hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400"
                  >
                    <ChevronRight className="mr-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Support</h3>
            <ul className="mt-6 space-y-4">
              {[
                { label: "Help Center", href: "#" },
                { label: "Safety Center", href: "#" },
                { label: "Community Guidelines", href: "#" },
                { label: "Privacy Policy", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center text-sm text-slate-500 transition hover:text-orange-500 dark:text-slate-400 dark:hover:text-orange-400"
                  >
                    <ChevronRight className="mr-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-900/50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Contact Us</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">+855 12 850 001</p>
                  <p className="text-[10px] text-slate-500">Available 8am - 9pm</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 text-break">warehousems@gmail.com</p>
                  <p className="text-[10px] text-slate-500">Business Inquiries</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Mon - Sun</p>
                  <p className="text-[10px] text-slate-500">Full Week Coverage</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-slate-100 py-8 dark:border-slate-900">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-slate-500 dark:text-slate-600">
              © {currentYear} H-Phsar. Built by 11th Gen Students of Korea Software HRD Center.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-700">
                <ShieldCheck className="h-3 w-3" />
                Secure Payments
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-700">
                <ShoppingBag className="h-3 w-3" />
                Reliable Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
