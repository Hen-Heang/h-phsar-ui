"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NewOrder from "./NewOrder";
import Preparing from "./Preparing";
import Dispatch from "./Dispatch";
import Confirm from "./Confirm";
import Complete from "./Complete";
import AllOrders from "./AllOrders";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Package, Truck, CheckCircle2, LayoutList } from "lucide-react";
import { get_newOrder_withoutLoading } from "../../../redux/services/distributor/NewOrder.service";
import { get_all_confirm_withoutLoading } from "../../../redux/services/distributor/Confirm.service";
import { get_all_complete_withoutLoading } from "../../../redux/services/distributor/complete.service";
import { api } from "../../../utils/api";
import { getNewOrder, getPrepraingOrder, getDispatch, getConfirmOrder, getAllComplete } from "../../../redux/slices/distributor/orderPageSlice";

export default function Order() {
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "StockFlow | Orders";
  }, []);

  const [activeTab, setActiveTab] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      get_newOrder_withoutLoading(),
      api.get(`/suppliers/orders/preparing?sort=desc&pageNumber=1&pageSize=1000`).catch(e => e.response),
      api.get(`/suppliers/orders/dispatching?sort=desc&pageNumber=1&pageSize=1000`).catch(e => e.response),
      get_all_confirm_withoutLoading(),
      get_all_complete_withoutLoading(),
    ]).then(([newOrder, preparing, dispatching, confirm, complete]) => {
      if (newOrder.value?.data?.status === 200) dispatch(getNewOrder(newOrder.value.data.data));
      if (preparing.value?.data?.status === 200) dispatch(getPrepraingOrder(preparing.value.data.data));
      if (dispatching.value?.data?.status === 200) dispatch(getDispatch(dispatching.value.data.data));
      if (confirm.value?.data?.status === 200) dispatch(getConfirmOrder(confirm.value.data.data));
      if (complete.value?.data?.status === 200) dispatch(getAllComplete(complete.value.data.data));
    });
  }, [dispatch]);

  const orderData    = useSelector((s) => s.distributorOrder.orderData);
  const preData      = useSelector((s) => s.distributorOrder.preData);
  const disData      = useSelector((s) => s.distributorOrder.disData);
  const confirmData  = useSelector((s) => s.distributorOrder.confirmData);
  const dataComplete = useSelector((s) => s.distributorOrder.dataComplete);

  const counts = [
    orderData.length,
    preData.length,
    disData.length,
    confirmData.length,
    dataComplete.length,
    orderData.length + preData.length + disData.length + confirmData.length + dataComplete.length,
  ];

  const tabs = [
    { id: 1, label: "Pending",    icon: <ShoppingBag className="w-4 h-4" />, component: <NewOrder toggleTab2={() => setActiveTab(2)} /> },
    { id: 2, label: "Preparing",  icon: <Package className="w-4 h-4" />,     component: <Preparing toggleTab3={() => setActiveTab(3)} /> },
    { id: 3, label: "Dispatching",icon: <Truck className="w-4 h-4" />,       component: <Dispatch toggleTab4={() => setActiveTab(4)} /> },
    { id: 4, label: "Delivered",   icon: <CheckCircle2 className="w-4 h-4" />, component: <Confirm toggleTab5={() => setActiveTab(5)} /> },
    { id: 5, label: "Completed",  icon: <CheckCircle2 className="w-4 h-4" />,component: <Complete /> },
    { id: 6, label: "All Orders", icon: <LayoutList className="w-4 h-4" />,  component: <AllOrders /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6  min-h-screen"
    >
      <div className="bg-white  rounded-2xl shadow-sm border border-slate-100  overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 ">Order Activity</h1>
            <p className="text-slate-500 mt-1">Monitor and manage your incoming retailer orders.</p>
          </div>

          <div className="border-b border-slate-100  mb-6">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50  rounded-t-xl"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {counts[idx] > 0 && (
                    <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {counts[idx]}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
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

