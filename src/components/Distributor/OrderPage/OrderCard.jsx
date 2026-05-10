"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle,
  MoreHorizontal,
  ChevronRight,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import photoDefault from "../../../assets/images/distributor/photo.png";

const OrderCard = ({ 
  item, 
  status, 
  onViewDetails, 
  onAction, 
  actionLabel, 
  actionIcon: ActionIcon,
  actionVariant = "default",
  isLoading = false,
  index = 0
}) => {
  const formatMoney = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : "0.00";
  };

  const getStatusColor = (s) => {
    switch (s) {
      case "Pending": return "bg-orange-50 text-orange-600 border-orange-100";
      case "Preparing": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Dispatch": return "bg-purple-50 text-purple-600 border-purple-100";
      case "Confirming": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Completed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Declined": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5  "
    >
      {/* Header: Retailer Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50  ">
            <img
              src={item.retailerImage && item.retailerImage !== "String" ? item.retailerImage : photoDefault.src || photoDefault}
              className="h-full w-full object-cover"
              alt=""
            />
          </div>
          <div>
            <h3 className="line-clamp-1 text-base font-black text-slate-900 ">
              {item.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="text-blue-600 ">Order ID:</span>
              <span className="truncate max-w-[80px]">#{String(item.id).slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${getStatusColor(status)}`}>
          {status}
        </div>
      </div>

      {/* Body: Order Details */}
      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-3 text-slate-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="line-clamp-1 text-sm font-medium leading-relaxed ">
            {item.address}
          </p>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <Calendar className="h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-sm font-medium ">
            {new Date(item.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Footer: Stats & Actions */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6 ">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Amount</span>
          <span className="text-lg font-black text-slate-900 ">
            ${formatMoney(item.total)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(item.id, item)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600  "
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </button>
          
          {onAction && actionLabel && (
            <Button
              size="sm"
              variant={actionVariant}
              onClick={() => onAction(item.id, item)}
              disabled={isLoading}
              className={`h-11 rounded-xl px-5 font-bold shadow-lg transition-all active:scale-[0.98] ${
                actionVariant === "default" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" : ""
              }`}
            >
              {isLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                  {actionLabel}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;
