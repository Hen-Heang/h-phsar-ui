import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  MoreHorizontal, 
  Star, 
  MapPin,
  AlertTriangle,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Store,
  Calendar,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Loader2,
  Activity,
  RefreshCcw
} from "lucide-react";
import { toast } from "react-toastify";
import { over } from "stompjs";
import SockJS from "sockjs-client";
import { PropagateLoader } from "react-spinners";

import { 
  confirm_transaction, 
  delete_request, 
  get_orderById, 
  get_order_detail 
} from "../../redux/services/retailer/orderDetail.service";
import { 
  confirmTransaction, 
  deleteRequest, 
  getOrderDetail, 
  setChangeOrderStatus, 
  setChangeOrderStatusDeclind, 
  setLoadingOrder 
} from "../../redux/slices/retailer/orderSlice";
import { 
  getOrderById, 
  getOrderProduct 
} from "../../redux/slices/retailer/orderDetailSlice";
import { rating_star } from "../../redux/services/retailer/rating.service";
import ProductDetail from "./ProductDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import noImage from "../../assets/images/retailer/No_image_available.png";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { sendOneSignalNotification } from "@/lib/notifications/send-onesignal-client";
import { cn } from "@/lib/cn";

export default function OrderPage() {
  const dispatch = useDispatch();
  const orderList = useSelector((state) => state.order.data);
  const loading = useSelector((state) => state.order.loading);
  const orderDetail = useSelector((state) => state.orderDetail.data);
  
  const [itemOffset, setItemOffset] = useState(0);
  const [isOpen, setOpen] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [dataRequest, setDataRequest] = useState(null);
  const [ratingMap, setRatingMap] = useState({});
  const [hoverMap, setHoverMap] = useState({});
  const autoConfirmedRef = useRef(new Set());

  useEffect(() => {
    document.title = "StockFlow | Orders";
    fetchOrders();

    const Sock = new SockJS(`${process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080"}/ws`);
    const client = over(Sock);
    client.connect({}, () => {
      client.subscribe(`/user/${localStorage.getItem("userId")}/private`, (payload) => {
        const payloadData = JSON.parse(payload.body);
        if (payloadData.status === "ORDER") dispatch(setChangeOrderStatus(payloadData.message));
        else if (payloadData.status === "DECLINE") dispatch(setChangeOrderStatusDeclind(payloadData.message));
      });
      client.send("/app/message", {}, JSON.stringify({ status: "JOIN" }));
    }, () => {});

    return () => Sock.close();
  }, [dispatch]);

  // Auto-confirm delivered orders — no manual action needed from retailer
  useEffect(() => {
    orderList
      .filter(o => o.status === "Confirming" && !autoConfirmedRef.current.has(o.id))
      .forEach(o => {
        autoConfirmedRef.current.add(o.id);
        confirm_transaction(o.id)
          .then(res => {
            if (res?.data?.data) {
              const userId = res.data.data?.userId;
              if (userId != null) {
                sendOneSignalNotification({
                  contents: { en: "Order confirmed as delivered." },
                  include_external_user_ids: [userId.toString()],
                });
              }
              dispatch(confirmTransaction(o.id));
            }
          })
          .catch(() => {});
      });
  }, [orderList, dispatch]);

  const fetchOrders = () => {
    dispatch(setLoadingOrder(true));
    get_order_detail(dispatch)
      .then((r) => {
        if (r && r.data && r.data.status === 200) {
          dispatch(getOrderDetail(r.data.data));
        }
      })
      .finally(() => dispatch(setLoadingOrder(false)));
  };

  const handleProductById = (id) => {
    setLoadingPro(true);
    get_orderById(id).then((r) => {
      dispatch(getOrderById(r.data.data.products));
      dispatch(getOrderProduct(r.data.data.order));
      setLoadingPro(false);
    });
  };

  const handleRate = async (orderId, storeId, star) => {
    setRatingMap(prev => ({ ...prev, [orderId]: star }));
    try {
      await rating_star(storeId, star);
      toast.success("Thanks for your rating!");
    } catch {
      toast.error("Failed to submit rating");
    }
  };

  const handleDeleteRequest = () => {
    delete_request(dataRequest?.id).then(() => {
      dispatch(deleteRequest(dataRequest?.id));
      setRequestModal(false);
      toast.info("Request cancelled.");
    });
  };

  const itemsPerPage = 6;
  const pageCount = Math.ceil(orderList.length / itemsPerPage);
  const currentOrders = orderList.slice(itemOffset, itemOffset + itemsPerPage);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending":
      case "Draft": return { 
        color: "text-orange-600", 
        bg: "bg-orange-50", 
        border: "border-orange-100",
        icon: ClipboardList,
        progress: 20
      };
      case "Preparing": return { 
        color: "text-blue-600", 
        bg: "bg-blue-50", 
        border: "border-blue-100",
        icon: Package,
        progress: 40
      };
      case "Shipping": return { 
        color: "text-purple-600", 
        bg: "bg-purple-50", 
        border: "border-purple-100",
        icon: Truck,
        progress: 60
      };
      case "Confirming": return {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        icon: CheckCircle2,
        label: "Delivered",
        progress: 95
      };
      case "Complete": return { 
        color: "text-emerald-600", 
        bg: "bg-emerald-50", 
        border: "border-emerald-100",
        icon: CheckCircle2,
        progress: 100
      };
      case "Declined": return { 
        color: "text-rose-600", 
        bg: "bg-rose-50", 
        border: "border-rose-100",
        icon: XCircle,
        progress: 0
      };
      default: return { 
        color: "text-slate-600", 
        bg: "bg-slate-50", 
        border: "border-slate-100",
        icon: History,
        progress: 0
      };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-family-retailer">
      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        {/* Header */}
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-orange-500">
              <Activity className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Order Lifecycle</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Tracking & Activity
            </h1>
            <p className="mt-2 text-slate-500 max-w-xl">
              Real-time monitoring of your procurement requests and delivery status from distributors.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="h-12 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 font-bold px-6 shadow-sm gap-2" 
              onClick={fetchOrders}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Sync Orders
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <PropagateLoader color="#f97316" size={12} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4 animate-pulse">Establishing Connection...</p>
          </div>
        ) : currentOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <div className="rounded-full bg-slate-50 p-8 mb-6">
              <Package className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No active orders found</h3>
            <p className="text-slate-500 mt-2">Your recent activity log will appear here.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {currentOrders.map((item, idx) => {
                const config = getStatusConfig(item.status);
                const StatusIcon = config.icon;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group relative overflow-hidden border-none rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                      <CardContent className="p-0">
                        {/* Status Header */}
                        <div className={cn("flex items-center justify-between px-8 py-5 border-b", config.bg, config.border)}>
                          <div className={cn("flex items-center gap-2 font-black text-[10px] uppercase tracking-widest", config.color)}>
                            <StatusIcon className="h-4 w-4" />
                            {config.label || item.status}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">#{String(item.id).slice(-8).toUpperCase()}</span>
                        </div>

                        {/* Order Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${config.progress}%` }}
                            className={cn("h-full transition-all duration-1000", config.progress === 100 ? "bg-emerald-500" : "bg-orange-500")}
                          />
                        </div>

                        <div className="p-8">
                          {/* Distributor Info */}
                          <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 p-1 shadow-inner">
                                <img 
                                  src={getSafeImageSrc(item.storeImage, noImage)} 
                                  className="h-full w-full object-cover rounded-xl"
                                  onError={(e) => applyImageFallback(e, noImage)}
                                />
                              </div>
                              <div>
                                <h3 className="font-black text-slate-900 line-clamp-1">{item.storeName}</h3>
                                <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                                  <Calendar className="h-3 w-3" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {new Date(item.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end text-orange-600 font-black text-lg">
                                <DollarSign className="h-4 w-4" />
                                {item.total?.toFixed(2)}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Value</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3">
                            {item.status === "Confirming" && (
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rate experience</span>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => handleRate(item.id, item.storeId, star)}
                                      onMouseEnter={() => setHoverMap(prev => ({ ...prev, [item.id]: star }))}
                                      onMouseLeave={() => setHoverMap(prev => ({ ...prev, [item.id]: undefined }))}
                                      className="transition-transform hover:scale-125 active:scale-90"
                                    >
                                      <Star className={cn(
                                        "h-5 w-5 transition-colors",
                                        (hoverMap[item.id] || ratingMap[item.id] || 0) >= star
                                          ? "fill-orange-500 text-orange-500"
                                          : "text-slate-200"
                                      )} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-2xl border-slate-100 bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-white hover:border-orange-200 hover:text-orange-500 active:scale-[0.98] transition-all"
                                onClick={() => {
                                  setOpen(true);
                                  handleProductById(item.id);
                                }}
                              >
                                View Receipt
                              </Button>

                              {(item.status === "Pending" || item.status === "Draft") && (
                                <button
                                  onClick={() => {
                                    setDataRequest(item);
                                    setRequestModal(true);
                                  }}
                                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-[0.95] transition-all"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {!loading && pageCount > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
              <ReactPaginate
                pageCount={pageCount}
                onPageChange={(e) => {
                  setItemOffset(e.selected * itemsPerPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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

      {/* Cancel Confirmation Modal */}
      <Dialog open={requestModal} onOpenChange={setRequestModal}>
        <DialogContent className="max-w-md rounded-[3rem] p-10 text-center border-none shadow-2xl">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500 ">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 ">Withdraw Request?</DialogTitle>
          <p className="mt-4 text-slate-500 leading-relaxed font-medium">
            Are you sure you want to cancel your order from <span className="font-bold text-orange-500">{dataRequest?.storeName}</span>? 
            The items will be returned to your active draft.
          </p>
          <div className="mt-10 flex gap-4">
            <Button 
              className="h-14 flex-1 rounded-2xl bg-rose-500 font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 active:scale-[0.98] transition-all"
              onClick={handleDeleteRequest}
            >
              Withdraw
            </Button>
            <Button 
              variant="outline" 
              className="h-14 flex-1 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all"
              onClick={() => setRequestModal(false)}
            >
              Go Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProductDetail
        handleOpen={() => setOpen(!isOpen)}
        isOpen={isOpen}
        loadingPro={loadingPro}
      />
    </div>
  );
}
