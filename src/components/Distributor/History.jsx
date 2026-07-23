"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import {
  getImportHistory,
  setLoadingHistory,
} from "../../redux/slices/distributor/importHistorySlice";
import { get_import_history } from "../../redux/services/distributor/ImportHistory.service";
import ReactPaginate from "react-paginate";
import { PropagateLoader } from "react-spinners";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  History as HistoryIcon,
  Calendar,
  Package,
  DollarSign,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowUpRight,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export default function History() {
  const dispatch = useDispatch();
  const historyList = useSelector((state) => state.importHistory.data);
  const loading = useSelector((state) => state.importHistory.loading);

  const [itemOffset, setItemOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 8;

  useEffect(() => {
    document.title = "StockFlow | Import Audit";
    fetchHistory();
  }, [dispatch]);

  const fetchHistory = () => {
    dispatch(setLoadingHistory(true));
    get_import_history(dispatch)
      .then((r) => {
        if (r?.status === 401) {
          toast.error("Session expired. Please sign in again.");
        }
        if (r && r.data && r.data.status === 200) {
          dispatch(getImportHistory(r.data.data));
        }
      })
      .finally(() => {
        dispatch(setLoadingHistory(false));
      });
  };

  const filteredHistory = useMemo(() => {
    return (historyList || []).filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [historyList, searchQuery]);

  const endOffset = itemOffset + itemsPerPage;
  const currentHistory = filteredHistory.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredHistory.length / itemsPerPage);

  const onPageChange = (event) => {
    setItemOffset(event.selected * itemsPerPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stats = useMemo(() => {
    const total = filteredHistory.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );
    const units = filteredHistory.reduce(
      (sum, item) => sum + (item.qty || 0),
      0,
    );
    return { total, units };
  }, [filteredHistory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 space-y-8 min-h-screen bg-slate-50/30"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <motion.div variants={itemVariants}>
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <Layers className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              Inventory Log
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Import History
          </h1>
          <p className="mt-2 text-slate-500 max-w-xl font-medium">
            A comprehensive audit trail of all stock acquisitions and warehouse
            intake operations.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Filter by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full sm:w-72 pl-11 pr-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-medium text-sm"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl bg-white border-slate-200 font-bold gap-2 shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
        </motion.div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Investment",
            value: `$${stats.total.toLocaleString()}`,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Units Intake",
            value: stats.units.toLocaleString(),
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Unique Batches",
            value: filteredHistory.length,
            icon: HistoryIcon,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[2rem] bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {stat.value}
                </h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* History Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-6">Timestamp</th>
                    <th className="px-6 py-6">Category</th>
                    <th className="px-6 py-6">Product Information</th>
                    <th className="px-6 py-6 text-center">Batch Qty</th>
                    <th className="px-6 py-6 text-right">Unit cost</th>
                    <th className="px-8 py-6 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-32 text-center">
                        <PropagateLoader color="#2563eb" size={12} />
                        <p className="mt-8 text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                          Syncing Audit Logs
                        </p>
                      </td>
                    </tr>
                  ) : currentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-32 text-center px-8">
                        <div className="flex flex-col items-center max-w-xs mx-auto">
                          <div className="p-6 bg-slate-50 rounded-full mb-6">
                            <HistoryIcon className="w-12 h-12 text-slate-200" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">
                            No records found
                          </h3>
                          <p className="text-sm text-slate-500 mt-2">
                            Try adjusting your filters or check back after your
                            next inventory intake.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence mode="wait">
                      {currentHistory.map((item, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                                {new Date(item.date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 uppercase">
                                {new Date(item.date).toLocaleTimeString(
                                  "en-US",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                              {item.category || "General"}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-black text-slate-900 line-clamp-1">
                              {item.name || "Unnamed Product"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              SKU: SF-
                              {Math.random()
                                .toString(36)
                                .substr(2, 6)
                                .toUpperCase()}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 font-black text-slate-700 text-xs">
                              {item.qty}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-slate-600">
                            ${(item.price || 0).toFixed(2)}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="text-base font-black text-blue-600">
                              ${(item.total || 0).toFixed(2)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && pageCount > 1 && (
              <div className="p-8 border-t border-slate-50 flex justify-between items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Showing {itemOffset + 1} to{" "}
                  {Math.min(endOffset, filteredHistory.length)} of{" "}
                  {filteredHistory.length} results
                </p>
                <ReactPaginate
                  pageCount={pageCount}
                  onPageChange={onPageChange}
                  previousLabel={<ChevronLeft className="h-4 w-4" />}
                  nextLabel={<ChevronRight className="h-4 w-4" />}
                  containerClassName="flex gap-2 items-center"
                  pageLinkClassName="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black text-slate-400 hover:bg-slate-100 transition-all"
                  activeLinkClassName="!bg-blue-600 !text-white shadow-lg shadow-blue-600/20"
                  previousLinkClassName="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                  nextLinkClassName="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                  disabledClassName="opacity-20 cursor-not-allowed"
                  breakLabel="..."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
