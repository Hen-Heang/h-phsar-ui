import React, { useEffect, useState } from "react";
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
  ClipboardList
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
import noImage from "../../assets/images/retailer/No_image_available.png";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { sendOneSignalNotification } from "@/lib/notifications/send-onesignal-client";

export default function OrderPage() {
  const dispatch = useDispatch();
  const orderList = useSelector((state) => state.order.data);
  const loading = useSelector((state) => state.order.loading);
  const orderDetail = useSelector((state) => state.orderDetail.data);
  const orderProduct = useSelector((state) => state.orderDetail.dataOrder);

  const [itemOffset, setItemOffset] = useState(0);
  const [isOpen, setOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const [confirmData, setConfirmData] = useState({});
  const [storeId, setStoreId] = useState(null);
  const [loadingPro, setLoadingPro] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [dataRequest, setDataRequest] = useState(null);
  const [currentRating, setCurrentValue] = useState(0);
  const [hoverRating, setHoverValue] = useState(undefined);

  useEffect(() => {
    document.title = "H-Phsar | Orders";
    connect();
    fetchOrders();
    return () => disconnectFromSocket();
  }, []);

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

  // WebSocket Logic - preserved
  let stompClient = null;
  const connect = () => {
    const Sock = new SockJS("http://localhost:8888/ws");
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, (err) => console.log(err));
  };

  const disconnectFromSocket = () => {
    if (stompClient) stompClient.disconnect();
  };

  const onConnected = () => {
    stompClient.subscribe(`/user/${localStorage.getItem("userId")}/private`, (payload) => {
      const payloadData = JSON.parse(payload.body);
      if (payloadData.status === "ORDER") dispatch(setChangeOrderStatus(payloadData.message));
      else if (payloadData.status === "DECLINE") dispatch(setChangeOrderStatusDeclind(payloadData.message));
    });
    stompClient.send("/app/message", {}, JSON.stringify({ status: "JOIN" }));
  };

  const handleProductById = (id) => {
    setLoadingPro(true);
    get_orderById(id).then((r) => dispatch(getOrderById(r.data.data.products)));
    get_orderById(id).then((r) => dispatch(getOrderProduct(r.data.data.order))).then(() => setLoadingPro(false));
  };

  const handleConfirmOrder = async () => {
    setLoadingPro(true);
    try {
      const res = await confirm_transaction(confirmData?.id);
      if (res.status === 409) toast.error(res.data.detail);
      else {
        await sendOneSignalNotification({
          contents: { en: "Order delivered and confirmed by retailer" },
          include_external_user_ids: [res.data.data.userId.toString()],
        });
        dispatch(confirmTransaction(confirmData.id));
        if (currentRating > 0) await rating_star(storeId, currentRating);
        setComplete(false);
        toast.success("Order completed successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPro(false);
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
      case "Draft": return "bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800";
      case "Preparing": return "bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800";
      case "Shipping": return "bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800";
      case "Confirming": return "bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800";
      case "Complete": return "bg-green-100 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800";
      case "Declined": return "bg-red-100 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
      default: return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <ClipboardList className="h-3.5 w-3.5" />;
      case "Preparing": return <Package className="h-3.5 w-3.5" />;
      case "Shipping": return <Truck className="h-3.5 w-3.5" />;
      case "Confirming": return <Clock className="h-3.5 w-3.5" />;
      case "Complete": return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "Declined": return <XCircle className="h-3.5 w-3.5" />;
      default: return <History className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950">
      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-orange-500">
              <History className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Activity Log</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Order Tracking
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Monitor your stock deliveries and order history.</p>
          </div>
          <Button variant="outline" className="h-12 rounded-2xl border-slate-200 dark:border-slate-800" onClick={fetchOrders}>
            Refresh Status
          </Button>
        </header>

        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-8 py-5">Order Reference</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5">Distributor</th>
                  <th className="px-6 py-5">Order Date</th>
                  <th className="px-6 py-5 text-right">Total Amount</th>
                  <th className="px-8 py-5 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-32">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <PropagateLoader color="#f97316" size={12} />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing orders...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="rounded-full bg-slate-50 p-6 dark:bg-slate-800">
                          <Package className="h-12 w-12 text-slate-200 dark:text-slate-700" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((item, idx) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">REF-ORD</span>
                          <span className="text-sm font-black text-slate-900 dark:text-slate-100">#{item.id.slice(-8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex justify-center">
                          <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${getStatusStyle(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {item.status}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                            <img 
                              src={getSafeImageSrc(item.storeImage, noImage)} 
                              className="h-full w-full object-cover"
                              onError={(e) => applyImageFallback(e, noImage)}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.storeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-medium text-slate-500">
                          {new Date(item.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                          ${(item.total || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          {item.status === "Confirming" ? (
                            <Button 
                              size="sm" 
                              className="h-9 rounded-xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                              onClick={() => {
                                setConfirmData(item);
                                setComplete(true);
                                handleProductById(item.id);
                                setStoreId(item.storeId);
                              }}
                            >
                              Finalize
                            </Button>
                          ) : (
                            <button 
                              onClick={() => {
                                setOpen(true);
                                handleProductById(item.id);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-orange-200 hover:text-orange-500 dark:border-slate-800 dark:text-slate-600"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          )}
                          {(item.status === "Pending" || item.status === "Draft") && (
                            <button 
                              onClick={() => {
                                setDataRequest(item);
                                setRequestModal(true);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-400 transition hover:bg-red-100 hover:text-red-600 dark:bg-red-950/20 dark:text-red-500"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {pageCount > 1 && (
            <div className="border-t border-slate-50 bg-slate-50/30 px-8 py-6 dark:border-slate-800 dark:bg-slate-900/30">
              <ReactPaginate
                pageCount={pageCount}
                onPageChange={(e) => setItemOffset(e.selected * itemsPerPage)}
                previousLabel={<ChevronLeft className="h-4 w-4" />}
                nextLabel={<ChevronRight className="h-4 w-4" />}
                className="flex items-center justify-end gap-2"
                pageClassName="h-9 w-9 flex items-center justify-center rounded-xl text-sm font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                activeClassName="!bg-orange-500 !text-white shadow-lg shadow-orange-500/20"
                previousClassName="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white dark:border-slate-800 dark:hover:bg-slate-800"
                nextClassName="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white dark:border-slate-800 dark:hover:bg-slate-800"
                breakLabel="..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Completion & Rating Modal */}
      <Dialog open={complete} onOpenChange={setComplete}>
        <DialogContent className="max-w-xl overflow-hidden rounded-[2.5rem] p-0 border-none shadow-2xl">
          <div className="bg-orange-500 px-8 py-10 text-white">
            <h3 className="text-2xl font-black tracking-tight">Finalize Delivery</h3>
            <p className="mt-2 text-orange-100">Please confirm receipt and rate your experience.</p>
          </div>
          
          <div className="p-8">
            {loadingPro ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <PropagateLoader color="#f97316" size={10} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Order Details...</span>
              </div>
            ) : (
              <>
                <div className="mb-8 rounded-3xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Items Ordered</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{orderDetail.length} Products</span>
                  </div>
                  <div className="flex -space-x-3 overflow-hidden">
                    {orderDetail.slice(0, 5).map((item, i) => (
                      <div key={i} className="h-12 w-12 rounded-xl border-4 border-white bg-white shadow-sm dark:border-slate-900">
                        <img 
                          src={getSafeImageSrc(item.image, noImage)} 
                          className="h-full w-full object-contain" 
                          onError={(e) => applyImageFallback(e, noImage)}
                        />
                      </div>
                    ))}
                    {orderDetail.length > 5 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white bg-slate-100 text-xs font-black text-slate-400 dark:border-slate-900 dark:bg-slate-800">
                        +{orderDetail.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Rate Distributor</h4>
                  <div className="mt-4 flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setCurrentValue(star)}
                        onMouseOver={() => setHoverValue(star)}
                        onMouseLeave={() => setHoverValue(undefined)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          className={`h-10 w-10 transition-colors ${
                            (hoverRating || currentRating) >= star 
                            ? "fill-orange-500 text-orange-500" 
                            : "text-slate-200 dark:text-slate-800"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                  <Button 
                    className="h-14 flex-1 rounded-2xl bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600"
                    onClick={handleConfirmOrder}
                  >
                    Confirm Delivery
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-14 flex-1 rounded-2xl border-slate-200 font-bold dark:border-slate-800"
                    onClick={() => setComplete(false)}
                  >
                    Wait
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <Dialog open={requestModal} onOpenChange={setRequestModal}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 text-center border-none">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/30">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Cancel Request?</h3>
          <p className="mt-4 text-slate-500">
            Are you sure you want to cancel the order request from <span className="font-bold text-orange-500">{dataRequest?.storeName}</span>? 
            This will move the items back to your draft.
          </p>
          <div className="mt-10 flex gap-3">
            <Button 
              className="h-14 flex-1 rounded-2xl bg-red-500 font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-600"
              onClick={handleDeleteRequest}
            >
              Yes, Cancel
            </Button>
            <Button 
              variant="outline" 
              className="h-14 flex-1 rounded-2xl border-slate-200 font-bold dark:border-slate-800"
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
