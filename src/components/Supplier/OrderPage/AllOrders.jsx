"use client";

import React, { useEffect, useState } from "react";
import { PropagateLoader } from "react-spinners";
import { get_all_orders } from "../../../redux/services/supplier/allOrders.service";
import {
  ClipboardList, Package, Truck, Hourglass, CheckCircle2, XCircle, Clock,
  ChevronLeft, ChevronRight
} from "lucide-react";
import ReactPaginate from "react-paginate";

const STATUS_CONFIG = {
  PENDING:    { label: "Pending",     color: "bg-orange-50 text-orange-600" },
  PROCESSING: { label: "Preparing",   color: "bg-blue-50 text-blue-600" },
  CONFIRMED:  { label: "Dispatching", color: "bg-purple-50 text-purple-600" },
  SHIPPING:   { label: "Confirming",  color: "bg-amber-50 text-amber-600" },
  DELIVERED:  { label: "Completed",   color: "bg-emerald-50 text-emerald-600" },
  COMPLETED:  { label: "Completed",   color: "bg-emerald-50 text-emerald-600" },
  CANCELLED:  { label: "Cancelled",   color: "bg-rose-50 text-rose-600" },
  REJECTED:   { label: "Declined",    color: "bg-rose-50 text-rose-600" },
};

const formatMoney = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    get_all_orders()
      .then((res) => {
        if (res?.data?.data) setOrders(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const pageCount = Math.ceil(orders.length / itemsPerPage);
  const currentItems = orders.slice(itemOffset, itemOffset + itemsPerPage);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <PropagateLoader color="#0f766e" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50">
        <ClipboardList className="h-16 w-16 text-slate-200" />
        <h3 className="mt-6 text-xl font-bold text-slate-900">No Orders Found</h3>
        <p className="mt-2 text-slate-500">All active orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Retailer</th>
              <th className="px-6 py-4">Store</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentItems.map((order, idx) => {
              const cfg = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-slate-50 text-slate-600" };
              return (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-400 font-bold">{itemOffset + idx + 1}</td>
                  <td className="px-6 py-4 font-black text-blue-600">
                    #{String(order.id).slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{order.name || "—"}</td>
                  <td className="px-6 py-4 text-slate-500">{order.storeName || "—"}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">${formatMoney(order.total)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {order.date ? new Date(order.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex justify-end">
          <ReactPaginate
            pageCount={pageCount}
            onPageChange={(e) => setItemOffset(e.selected * itemsPerPage)}
            previousLabel={<ChevronLeft className="h-4 w-4" />}
            nextLabel={<ChevronRight className="h-4 w-4" />}
            className="flex items-center gap-1"
            pageClassName="h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
            activeClassName="!bg-blue-600 !text-white"
            previousClassName="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
            nextClassName="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
            disabledClassName="opacity-30 cursor-not-allowed"
            breakLabel="..."
          />
        </div>
      )}
    </div>
  );
}
