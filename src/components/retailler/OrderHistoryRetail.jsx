import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  FileText, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Calendar,
  Store,
  Package,
  ArrowRight,
  Info,
  Loader2,
  Search
} from "lucide-react";
import ReactPaginate from 'react-paginate';
import { useReactToPrint } from 'react-to-print';
import { PropagateLoader } from "react-spinners";
import { toast } from "react-toastify";

import RetailerInvoice from './RetailerInvoice';
import ProductDetail from './ProductDetail';
import { get_all_history } from '../../redux/services/retailer/history.service';
import { getAllHistory, setLoadingHistoryRetail } from '../../redux/slices/retailer/historySlice';
import { get_invoice } from '../../redux/services/retailer/invoice.service';
import { getInvoice, getOrderInvoice } from '../../redux/slices/retailer/invoiceRetailerSlice';
import { get_orderById } from '../../redux/services/retailer/orderDetail.service';
import { getOrderById } from '../../redux/slices/retailer/orderDetailSlice';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import noImage from '../../assets/images/no_image.jpg';
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { cn } from "@/lib/cn";

export default function OrderHistoryRetail() {
  const dispatch = useDispatch();
  const orderHistory = useSelector((state) => state.history.data);
  const loading = useSelector((state) => state.history.loading);
  
  const [invoice, setInvoice] = useState(false);
  const [itemOffset, setItemOffset] = useState(0);
  const [isOpen, setOpen] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const invoiceRef = useRef();
  const hanldePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: 'invoice',
  });

  useEffect(() => {
    document.title = "StockFlow | Order Archive";
    fetchHistory();
  }, [dispatch]);

  const fetchHistory = () => {
    dispatch(setLoadingHistoryRetail(true));
    get_all_history(dispatch)
      .then((r) => {
        if (r && r.status === 401) toast.error("Session expired");
        if (r && r.data && r.data.status === 200) {
          dispatch(getAllHistory(r.data.data));
        }
      })
      .finally(() => dispatch(setLoadingHistoryRetail(false)));
  };

  const filteredHistory = (orderHistory || []).filter(item => 
    item.order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 8;
  const endOffset = itemOffset + itemsPerPage;
  const currentOrderHistory = filteredHistory.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredHistory.length / itemsPerPage);

  const onPageChange = (event) => {
    setItemOffset(event.selected * itemsPerPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInvoice = (id) => {
    setLoadingInvoice(true);
    setInvoice(true);
    get_invoice(id).then(r => {
      dispatch(getInvoice(r.data.data.products));
      dispatch(getOrderInvoice(r.data.data.order));
      setLoadingInvoice(false);
    });
  };

  const handleProductById = (id) => {
    setLoadingPro(true);
    setOpen(true);
    get_orderById(id)
      .then((r) => dispatch(getOrderById(r.data.data.products)))
      .finally(() => setLoadingPro(false));
  };

  const getStatusConfig = (status) => {
    return status === "Complete" 
      ? { color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 }
      : { color: "text-rose-600", bg: "bg-rose-50", icon: XCircle };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-family-retailer">
      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        {/* Header Section */}
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-orange-500">
              <History className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Transaction Archive</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Order History
            </h1>
            <p className="mt-2 text-slate-500 max-w-xl">
              Access your full procurement history, download tax invoices, and track past stock movements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-orange-500/20 transition-all font-medium text-sm"
              />
            </div>
            <Button 
              variant="outline"
              className="h-12 px-6 rounded-2xl border-slate-200 bg-white font-bold shadow-sm"
              onClick={fetchHistory}
            >
              Refresh
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <PropagateLoader color="#f97316" size={12} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4 animate-pulse">Retrieving Archives...</p>
          </div>
        ) : currentOrderHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center px-6"
          >
            <div className="rounded-full bg-slate-50 p-8 mb-6">
              <FileText className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">No history found</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
              Your completed and cancelled transactions will appear here for your records.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <div className="col-span-1">Ref</div>
              <div className="col-span-4">Distributor Partner</div>
              <div className="col-span-2 text-center">Procurement Date</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {currentOrderHistory.map((item, index) => {
                const status = getStatusConfig(item.order.status);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div key={item.order.id} variants={itemVariants}>
                    <Card className="group border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[1.5rem] bg-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center px-6 lg:px-10 py-5">
                          {/* Ref */}
                          <div className="col-span-1 hidden lg:block">
                            <span className="text-xs font-black text-slate-300">#{index + 1 + itemOffset}</span>
                          </div>

                          {/* Distributor */}
                          <div className="col-span-1 lg:col-span-4 flex items-center gap-4">
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-1">
                              <img 
                                src={getSafeImageSrc(item.order.image, noImage)} 
                                className="h-full w-full object-cover rounded-lg"
                                onError={(e) => applyImageFallback(e, noImage)}
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-900 truncate group-hover:text-orange-500 transition-colors">
                                {item.order.name}
                              </h3>
                              <span className="lg:hidden block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Order #{item.order.id.slice(-8).toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="col-span-1 lg:col-span-2 lg:text-center flex lg:block items-center gap-2">
                            <Calendar className="h-3 w-3 text-slate-300 lg:hidden" />
                            <span className="text-sm font-bold text-slate-600">
                              {new Date(item.order.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="col-span-1 lg:col-span-2 flex justify-start lg:justify-center">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                              status.bg, status.color
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {item.order.status}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 lg:col-span-3 flex justify-end gap-2">
                            {item.order.status === "Complete" ? (
                              <Button 
                                onClick={() => handleInvoice(item.order.id)}
                                className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 flex-1 lg:flex-none px-6"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Invoice
                              </Button>
                            ) : (
                              <Button 
                                variant="outline"
                                onClick={() => handleProductById(item.order.id)}
                                className="h-10 rounded-xl border-slate-100 bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-widest gap-2 flex-1 lg:flex-none px-6 hover:bg-white hover:border-orange-200 hover:text-orange-500"
                              >
                                <Package className="h-3.5 w-3.5" />
                                Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* Pagination */}
        {!loading && pageCount > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
              <ReactPaginate
                pageCount={pageCount}
                onPageChange={onPageChange}
                previousLabel={<ChevronLeft className="h-5 w-5" />}
                nextLabel={<ChevronRight className="h-5 w-5" />}
                className="flex items-center gap-2"
                pageLinkClassName="h-10 w-10 flex items-center justify-center rounded-xl text-sm font-black transition-all hover:bg-slate-50 text-slate-400"
                activeLinkClassName="!bg-orange-500 !text-white shadow-lg shadow-orange-500/20"
                previousLinkClassName="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-orange-500 transition-all"
                nextLinkClassName="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-orange-500 transition-all"
                disabledClassName="opacity-30 cursor-not-allowed"
                breakLabel="..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Legacy Modal Components (kept for logic compatibility) */}
      <RetailerInvoice 
        handleClick={() => setInvoice(!invoice)} 
        invoice={invoice} 
        invoiceRef={invoiceRef} 
        hanldePrint={hanldePrint} 
        loadingInvoice={loadingInvoice} 
      />
      <ProductDetail 
        handleOpen={() => setOpen(!isOpen)} 
        isOpen={isOpen} 
        loadingPro={loadingPro} 
      />
    </div>
  );
}
