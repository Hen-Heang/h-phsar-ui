"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getImportHistory, setLoadingHistory } from "../../redux/slices/distributor/importHistorySlice";
import { get_import_history } from "../../redux/services/distributor/ImportHistory.service";
import ReactPaginate from "react-paginate";
import { PropagateLoader } from "react-spinners";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { History as HistoryIcon, Calendar, Package, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function History() {
  useEffect(() => {
    document.title = "H-Phsar | Import History";
  }, []);

  const historyList = useSelector((state) => state.importHistory.data);
  const loading = useSelector((state) => state.importHistory.loading);
  const dispatch = useDispatch();

  const [itemOffset, setItemOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
    get_import_history(dispatch)
      .then((r) => {
        if (r.status === 401) {
          toast.error("Session expired. Please sign in again.");
        }
        if (r && r.data && r.data.status === 200) {
          dispatch(getImportHistory(r.data.data));
        }
      })
      .finally(() => {
        dispatch(setLoadingHistory(false));
      });
  }, [dispatch]);

  const endOffset = itemOffset + 8;
  const currentHistory = historyList.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(historyList.length / 8);

  const onPageChange = (event) => {
    const newOffset = (event.selected * 8) % historyList.length;
    setItemOffset(newOffset);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6 dark:bg-slate-950 min-h-screen"
    >
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Import History</CardTitle>
              <p className="text-slate-500 text-sm">Track and manage your recent inventory restocks.</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-separate border-spacing-y-3">
              <thead className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  <th className="px-6 py-3 text-right">Unit Price</th>
                  <th className="px-6 py-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <PropagateLoader color="#0f766e" />
                    </td>
                  </tr>
                ) : currentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium text-lg">No import records found.</p>
                    </td>
                  </tr>
                ) : (
                  currentHistory.map((item, index) => (
                    <tr key={index} className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all hover:shadow-sm">
                      <td className="px-6 py-4 rounded-l-2xl whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize font-medium text-teal-600">
                        {item.category || "General"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {item.name || "Unnamed Product"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        {item.qty}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        ${(item.price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right rounded-r-2xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                        ${(item.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex justify-end pt-8">
              <ReactPaginate
                pageCount={pageCount}
                onPageChange={onPageChange}
                previousLabel="←"
                nextLabel="→"
                containerClassName="flex gap-2 items-center"
                pageClassName="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-teal-50 transition-colors"
                activeClassName="bg-teal-600 text-white border-teal-600"
                previousClassName="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200"
                nextClassName="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

