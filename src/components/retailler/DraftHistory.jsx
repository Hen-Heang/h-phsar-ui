import React, { useEffect, useState } from "react";
import {
  delete_draft,
  draft_to_request,
  get_draft_history,
} from "../../redux/services/retailer/draftHistory.service";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoadingDraft,
} from "../../redux/slices/retailer/draftHistorySlice";
import ReactPaginate from "react-paginate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteTheDraft,
  draftToRequest1,
  getDraftHis,
  pushToOrder,
} from "../../redux/slices/retailer/orderSlice";
import { PropagateLoader } from "react-spinners";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileEdit, 
  Trash2, 
  ChevronRight, 
  Store, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  X,
  ChevronLeft,
  Package,
  ArrowRight,
  Info,
  Loader2,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import noImage from "../../assets/images/retailer/No_image_available.png";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { sendOneSignalNotification } from "@/lib/notifications/send-onesignal-client";
import { cn } from "@/lib/cn";

export default function DraftHistory() {
  useEffect(() => {
    document.title = "StockFlow | Draft History";
    getAllDraftHistory();
  }, []);

  const draftHistoryList = useSelector((state) => state.order.dataDraft);
  const loading = useSelector((state) => state.draft.loading);
  const dispatch = useDispatch();
  
  const [itemOffset, setItemOffset] = useState(0);
  const [isOpen, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getAllDraftHistory = () => {
    dispatch(setLoadingDraft(true));
    get_draft_history(dispatch)
      .then((r) => {
        if (r && r.data && r.data.status === 200) {
          dispatch(getDraftHis(r.data.data));
        } else if (r.status === 401) {
          toast.error("Session expired. Please log in again.");
        }
      })
      .catch(() => toast.error("Failed to sync draft data"))
      .finally(() => dispatch(setLoadingDraft(false)));
  };

  const itemsPerPage = 6;
  const endOffset = itemOffset + itemsPerPage;
  const currentDrafts = draftHistoryList.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(draftHistoryList.length / itemsPerPage);

  const onPageChange = (event) => {
    setItemOffset(event.selected * itemsPerPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = async () => {
    if (!selectedDraft) return;
    setIsProcessing(true);
    const message = "You have a new procurement request";
    
    try {
      const res = await draft_to_request(selectedDraft);
      if (res.status === 200 || res.status === 201) {
        // Push notification logic
        if (res.data?.totalPage) {
          await sendOneSignalNotification({
            contents: { en: message },
            include_external_user_ids: [res.data.totalPage.toString()],
          });
        }
        dispatch(draftToRequest1(selectedDraft.id));
        dispatch(pushToOrder(selectedDraft));
        toast.success("Order request sent successfully!");
        setOpen(false);
      } else if (res.status === 409) {
        toast.error(res.data.detail);
      }
    } catch (error) {
      toast.error("Failed to process checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await delete_draft(id);
      dispatch(deleteTheDraft(id));
      toast.info("Draft discarded");
    } catch (error) {
      toast.error("Failed to delete draft");
    } finally {
      setIsDeleting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-family-retailer">
      {/* Global Processing Overlays */}
      <AnimatePresence>
        {(isProcessing || isDeleting) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/20 backdrop-blur-sm"
          >
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              <p className="text-sm font-black uppercase tracking-widest text-slate-900">
                {isProcessing ? "Processing Request..." : "Discarding Draft..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        {/* Header */}
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-orange-500">
              <Clock className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Pending Operations</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Draft History
            </h1>
            <p className="mt-2 text-slate-500 max-w-xl">
              Manage and finalize your saved shopping carts. Ready to stock up? Just hit checkout.
            </p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Info className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-600">You have {draftHistoryList.length} items in waiting</span>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <PropagateLoader color="#f97316" size={12} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4">Syncing Drafts...</p>
          </div>
        ) : currentDrafts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center"
          >
            <div className="rounded-full bg-slate-50 p-8 mb-6">
              <FileEdit className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Your draft folder is clear</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
              Any carts you save for later will appear here for finalized processing.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {currentDrafts.map((item, idx) => (
                <motion.div
                  key={item?.order?.id || `draft-${idx}`}
                  layout
                  variants={itemVariants}
                  exit="exit"
                >
                  <Card className="group relative overflow-hidden border-none rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50 bg-slate-50/30">
                        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          Saved Draft
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">#{item.order.id.slice(-6).toUpperCase()}</span>
                      </div>

                      <div className="p-8">
                        {/* Shop Info */}
                        <div className="flex items-start gap-4 mb-8">
                          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 p-1 shadow-inner">
                            <img 
                              src={getSafeImageSrc(item.order.image, noImage)} 
                              className="h-full w-full object-cover rounded-xl"
                              onError={(e) => applyImageFallback(e, noImage)}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-lg text-slate-900 line-clamp-1 group-hover:text-orange-500 transition-colors">
                              {item.order.name}
                            </h3>
                            <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                {new Date(item.order.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Items</span>
                            <span className="text-lg font-black text-slate-900">{item.products?.length || 0}</span>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">Total Value</span>
                            <span className="text-lg font-black text-orange-600">${item.order.total.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Button 
                            className="flex-1 h-12 rounded-2xl bg-orange-500 font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all"
                            onClick={() => {
                              setProducts(item.products);
                              setSelectedDraft(item.order);
                              setOpen(true);
                            }}
                          >
                            Review & Send
                          </Button>
                          <button 
                            onClick={() => handleDelete(item.order.id)}
                            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-[0.95] transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
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

      {/* Review Modal */}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl overflow-hidden rounded-[3rem] p-0 border-none shadow-2xl">
          <div className="bg-orange-500 px-10 py-12 text-white relative">
            <div className="absolute right-10 top-12 opacity-20">
              <ShoppingCart className="h-24 w-24" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight">Review Procurement</DialogTitle>
            <p className="mt-2 text-orange-100 font-medium">Verify your items before sending the request to <span className="font-bold border-b-2 border-white/30">{selectedDraft?.name}</span>.</p>
          </div>
          
          <div className="p-10">
            <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-8 py-4">Consignment Item</th>
                    <th className="px-6 py-4 text-center">Quantity</th>
                    <th className="px-6 py-4 text-center">In Stock</th>
                    <th className="px-6 py-4 text-right">Unit Price</th>
                    <th className="px-8 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((p, i) => (
                    <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getSafeImageSrc(p.image, noImage)} 
                            className="h-10 w-10 rounded-lg object-contain bg-slate-50 p-1"
                            onError={(e) => applyImageFallback(e, noImage)}
                          />
                          <span className="text-sm font-bold text-slate-700">{p.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-black text-slate-900">{p.qty}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold",
                          p.inStock < p.qty ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {p.inStock} Units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-medium text-slate-500">${p.unitPrice.toFixed(2)}</td>
                      <td className="px-8 py-4 text-right text-sm font-black text-slate-900">${p.subTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-900/20">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Estimated Total</span>
                <span className="text-3xl font-black">${selectedDraft?.total.toFixed(2)}</span>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="h-14 px-8 rounded-2xl border-slate-700 bg-transparent text-white font-bold hover:bg-slate-800"
                  onClick={() => setOpen(false)}
                >
                  Edit Further
                </Button>
                <Button 
                  className="h-14 px-10 rounded-2xl bg-orange-500 font-black text-sm uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
