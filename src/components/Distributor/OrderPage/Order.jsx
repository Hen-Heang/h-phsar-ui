"use client";

import React, { useState, useEffect } from "react";
import NewOrder from "./NewOrder";
import Preparing from "./Preparing";
import Dispatch from "./Dispatch";
import Confirm from "./Confirm";
import Complete from "./Complete";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Package, Truck, CheckCircle2, Clock } from "lucide-react";

export default function Order() {
  useEffect(() => {
    document.title = "H-Phsar | Orders";
  }, []);

  const [activeTab, setActiveTab] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const tabs = [
    { id: 1, label: "New Orders", icon: <ShoppingBag className="w-4 h-4" />, component: <NewOrder toggleTab2={() => setActiveTab(2)} /> },
    { id: 2, label: "Preparing", icon: <Package className="w-4 h-4" />, component: <Preparing toggleTab3={() => setActiveTab(3)} /> },
    { id: 3, label: "Dispatch", icon: <Truck className="w-4 h-4" />, component: <Dispatch toggleTab4={() => setActiveTab(4)} /> },
    { id: 4, label: "Confirming", icon: <Clock className="w-4 h-4" />, component: <Confirm toggleTab5={() => setActiveTab(5)} /> },
    { id: 5, label: "Completed", icon: <CheckCircle2 className="w-4 h-4" />, component: <Complete /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6 dark:bg-slate-950 min-h-screen"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Order Activity</h1>
            <p className="text-slate-500 mt-1">Monitor and manage your incoming retailer orders.</p>
          </div>

          <div className="border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "text-teal-600"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-t-xl"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tabs.find(t => t.id === activeTab)?.component}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

