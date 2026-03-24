"use client";

import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  AlertTriangle,
  Trash2,
  Calendar,
  DollarSign,
  Loader2,
  Activity,
  RefreshCcw,
  CheckCircle2,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import { PropagateLoader as PropagateLoaderBase } from "react-spinners";
const PropagateLoader = PropagateLoaderBase as React.ElementType;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirm_transaction,
  delete_request,
  get_orderById,
  get_order_detail,
} from "../../redux/services/retailer/orderDetail.service";
import {
  confirmTransaction,
  deleteRequest,
  setChangeOrderStatus,
  setChangeOrderStatusDeclind,
} from "../../redux/slices/retailer/orderSlice";
import {
  getOrderById,
  getOrderProduct,
} from "../../redux/slices/retailer/orderDetailSlice";
import { rating_star } from "../../redux/services/retailer/rating.service";
import ProductDetail from "./ProductDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";

// Shared Resources
import SafeImage from "@/shared/components/SafeImage";
import DataTablePagination from "@/shared/components/DataTablePagination";
import useWebSocket from "@/shared/hooks/useWebSocket";
import {
  ORDER_STATUSES,
  getStatusConfig,
} from "@/shared/constants/orderStatuses";
import noImage from "@/assets/images/retailer/No_image_available.png";

export default function OrderPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // TanStack Query for data fetching
  const {
    data: orderList = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await get_order_detail(dispatch);
      return res?.data?.data || [];
    },
  });

  const orderDetail = useSelector((state: any) => state.orderDetail.data);

  const [itemOffset, setItemOffset] = useState(0);
  const [isOpen, setOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const [confirmData, setConfirmData] = useState<any>({});
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loadingPro, setLoadingPro] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [dataRequest, setDataRequest] = useState<any>(null);
  const [currentRating, setCurrentValue] = useState(0);
  const [hoverRating, setHoverValue] = useState<number | undefined>(undefined);

  // WebSocket Integration with automatic invalidation
  const onWebSocketMessage = useCallback(
    (payloadData: any) => {
      if (payloadData.status === "NEW_NOTIFICATION") {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }
    },
    [queryClient],
  );

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : "";
  useWebSocket(
    userId ? `/topic/notifications/${userId}` : null,
    onWebSocketMessage,
  );

  const handleProductById = (id: string) => {
    setLoadingPro(true);
    get_orderById(id).then((r: any) => {
      if (!r || r.status === 401 || r.status === 403) {
        toast.error("Unable to load receipt. Please try again.");
        setOpen(false);
        setLoadingPro(false);
        return;
      }
      dispatch(getOrderById(r.data.data.products));
      dispatch(getOrderProduct(r.data.data.order));
      setLoadingPro(false);
    });
  };

  const handleConfirmOrder = async () => {
    if (loadingPro) return;
    setLoadingPro(true);
    try {
      const res = await confirm_transaction(confirmData?.id);
      if (res?.status === 401 || res?.status === 403) {
        toast.error("Session expired. Please sign in again.");
      } else if (res?.status === 409) {
        toast.error(res.data.detail);
      } else if (res?.status >= 200 && res?.status < 300) {
        dispatch(confirmTransaction(confirmData.id));
        if (currentRating > 0 && storeId)
          await rating_star(storeId, currentRating);
        setComplete(false);
        toast.success("Order completed successfully!");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      } else {
        toast.error("Failed to confirm order. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to confirm order");
    } finally {
      setLoadingPro(false);
    }
  };

  const handleDeleteRequest = () => {
    delete_request(dataRequest?.id).then(() => {
      dispatch(deleteRequest(dataRequest?.id));
      setRequestModal(false);
      toast.info("Request cancelled.");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });
  };

  const itemsPerPage = 6;
  const pageCount = Math.ceil(orderList.length / itemsPerPage);
  const currentOrders = orderList.slice(itemOffset, itemOffset + itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-family-retailer">
      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        {/* Header */}
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-orange-500">
              <Activity className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                Order Lifecycle
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Tracking & Activity
            </h1>
            <p className="mt-2 text-slate-500 max-w-xl">
              Real-time monitoring of your procurement requests and delivery
              status from distributors.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 font-bold px-6 shadow-sm gap-2"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Sync Orders
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <PropagateLoader color="#f97316" size={12} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4 animate-pulse">
              Establishing Connection...
            </p>
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
            <h3 className="text-xl font-bold text-slate-900">
              No active orders found
            </h3>
            <p className="text-slate-500 mt-2">
              Your recent activity log will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {currentOrders.map((item: any, idx: number) => {
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
                        <div
                          className={cn(
                            "flex items-center justify-between px-8 py-5 border-b",
                            config.bg,
                            config.border,
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center gap-2 font-black text-[10px] uppercase tracking-widest",
                              config.color,
                            )}
                          >
                            <StatusIcon className="h-4 w-4" />
                            {item.status}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            #{String(item.id).slice(-8).toUpperCase()}
                          </span>
                        </div>

                        {/* Order Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${config.progress}%` }}
                            className={cn(
                              "h-full transition-all duration-1000",
                              config.progress === 100
                                ? "bg-emerald-500"
                                : "bg-orange-500",
                            )}
                          />
                        </div>

                        <div className="p-8">
                          {/* Distributor Info */}
                          <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 p-1 shadow-inner">
                                <SafeImage
                                  src={item.storeImage}
                                  fallback={noImage}
                                  className="h-full w-full object-cover rounded-xl"
                                />
                              </div>
                              <div>
                                <h3 className="font-black text-slate-900 line-clamp-1">
                                  {item.storeName}
                                </h3>
                                <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                                  <Calendar className="h-3 w-3" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {new Date(item.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end text-orange-600 font-black text-lg">
                                <DollarSign className="h-4 w-4" />
                                {item.total?.toFixed(2)}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Total Value
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            {item.status === ORDER_STATUSES.CONFIRMING ? (
                              <Button
                                className="flex-1 h-12 rounded-2xl bg-orange-500 font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all"
                                onClick={() => {
                                  setConfirmData(item);
                                  setComplete(true);
                                  handleProductById(item.id);
                                  setStoreId(item.storeId);
                                }}
                              >
                                Finalize Order
                              </Button>
                            ) : (
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
                            )}

                            {(item.status === ORDER_STATUSES.PENDING ||
                              item.status === ORDER_STATUSES.DRAFT) && (
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
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        <DataTablePagination
          pageCount={pageCount}
          onPageChange={(e: any) => {
            setItemOffset(e.selected * itemsPerPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          theme="orange"
        />
      </div>

      {/* Completion & Rating Modal */}
      <Dialog open={complete} onOpenChange={setComplete}>
        <DialogContent className="max-w-xl overflow-hidden rounded-[3rem] p-0 border-none shadow-2xl">
          <div className="bg-orange-500 px-10 py-12 text-white relative">
            <div className="absolute right-10 top-12 opacity-20">
              <CheckCircle2 className="h-24 w-24" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">
              Receipt Confirmation
            </h3>
            <p className="mt-2 text-orange-100 font-medium">
              Verify your stock delivery and rate the distributor.
            </p>
          </div>

          <div className="p-10">
            {loadingPro ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Inventory Sync in Progress...
                </span>
              </div>
            ) : (
              <>
                <div className="mb-10 rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Consignment Summary
                    </span>
                    <span className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
                      {orderDetail.length} Products
                    </span>
                  </div>
                  <div className="flex -space-x-4 overflow-hidden">
                    {orderDetail.slice(0, 6).map((item: any, i: number) => (
                      <div
                        key={i}
                        className="h-14 w-14 rounded-2xl border-4 border-white bg-white shadow-md relative z-[10]"
                      >
                        <SafeImage
                          src={item.image}
                          fallback={noImage}
                          className="h-full w-full object-contain p-1 rounded-xl"
                        />
                      </div>
                    ))}
                    {orderDetail.length > 6 && (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-xs font-black text-slate-400 shadow-md relative z-0">
                        +{orderDetail.length - 6}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center mb-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                    Rate your experience
                  </h4>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setCurrentValue(star)}
                        onMouseOver={() => setHoverValue(star)}
                        onMouseLeave={() => setHoverValue(undefined)}
                        className="transition-all transform hover:scale-125 active:scale-90"
                      >
                        <Star
                          className={cn(
                            "h-12 w-12 transition-colors duration-200",
                            (hoverRating || currentRating) >= star
                              ? "fill-orange-500 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]"
                              : "text-slate-200",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="h-16 flex-1 rounded-[1.5rem] bg-slate-900 font-black text-sm uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50"
                    onClick={handleConfirmOrder}
                    disabled={loadingPro}
                  >
                    {loadingPro ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Confirm Receipt"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 px-8 rounded-[1.5rem] border-slate-200 font-black text-sm uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                    onClick={() => setComplete(false)}
                  >
                    Later
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <Dialog open={requestModal} onOpenChange={setRequestModal}>
        <DialogContent className="max-w-md rounded-[3rem] p-10 text-center border-none shadow-2xl">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500 ">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 ">
            Withdraw Request?
          </h3>
          <p className="mt-4 text-slate-500 leading-relaxed font-medium">
            Are you sure you want to cancel your order from{" "}
            <span className="font-bold text-orange-500">
              {dataRequest?.storeName}
            </span>
            ? The items will be returned to your active draft.
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
