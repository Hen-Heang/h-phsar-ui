"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Check, 
  X, 
  Plus
} from "lucide-react";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";

import {
  decline_order,
  get_accept_newOrder,
  get_newOrder,
} from "../../../redux/services/supplier/NewOrder.service";
import { getProductDetail } from "../../../redux/slices/supplier/productSlice";
import { get_detail_product } from "../../../redux/services/supplier/product.service";
import {
  acceptOrder,
  addDataToPrepar,
  declineNewOrder,
  getNewOrder,
  setLoadingTheOrder,
} from "../../../redux/slices/supplier/orderPageSlice";
import { sendOneSignalNotification } from "@/lib/notifications/send-onesignal-client";
import OrderCard from "./OrderCard";
import ConfirmBox from "./ConfirmBox";
import ProdunctNewOrder from "./ProdunctNewOrder";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";

export default function NewOrder({ toggleTab2 }) {
  const dispatch = useDispatch();
  const newOrderList = useSelector((state) => state.distributorOrder.orderData);
  const loading = useSelector((state) => state.distributorOrder.loading);

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;
  
  const [isOpen, setOpen] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [targetOrder, setTargetOrder] = useState(null);
  const [loadingPro, setLoadingPro] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false);

  // No supplier-facing WebSocket topic exists on the backend today — use the
  // "Sync" action / refetch on tab focus instead of a real-time push.
  // Initial Fetch
  useEffect(() => {
    dispatch(setLoadingTheOrder(true));
    get_newOrder(dispatch)
      .then(r => r?.data?.status === 200 && dispatch(getNewOrder(r.data.data)))
      .finally(() => dispatch(setLoadingTheOrder(false)));
  }, [dispatch]);

  const currentItems = newOrderList.slice(itemOffset, itemOffset + itemsPerPage);
  const pageCount = Math.ceil(newOrderList.length / itemsPerPage);

  const handlePageChange = (e) => setItemOffset((e.selected * itemsPerPage) % newOrderList.length);

  const onAccept = async (id, item) => {
    setLoadingAccept(true);
    try {
      const res = await get_accept_newOrder(id, item);
      if (res.status === 409) {
        toast.error(res.data.detail);
      } else {
        const userId = res.data.data?.[0]?.userId;
        if (userId != null) {
          await sendOneSignalNotification({
            contents: { en: "Your order was accepted and is being prepared." },
            include_external_user_ids: [userId.toString()],
          });
        }
        dispatch(acceptOrder(id));
        dispatch(addDataToPrepar(item));
        toast.success("Order accepted!");
      }
    } finally {
      setLoadingAccept(false);
    }
  };

  const onDecline = async () => {
    setLoadingAccept(true);
    try {
      const res = await decline_order(targetOrder.id);
      if (res.status === 409) {
        toast.error(res.data.detail);
      } else {
        await sendOneSignalNotification({
          contents: { en: "Your order was declined." },
          include_external_user_ids: [res.data.data.userId.toString()],
        });
        dispatch(declineNewOrder(targetOrder.id));
        toast.info("Order declined.");
      }
    } finally {
      setLoadingAccept(false);
      setShowDecline(false);
    }
  };

  const onViewDetails = (id) => {
    setOpen(true);
    setLoadingPro(true);
    get_detail_product(id)
      .then(r => dispatch(getProductDetail(r.data.data.products)))
      .finally(() => setLoadingPro(false));
  };

  return (
    <div className="w-full">
      {loading ? (
        <LoadingState />
      ) : newOrderList.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No New Orders"
          description="Wait for buyers to place new stock requests."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {currentItems.map((item, idx) => (
                <OrderCard
                  key={item.id}
                  index={idx}
                  item={item}
                  status="PENDING"
                  actionType="ACCEPT"
                  actionLabel="Accept"
                  actionIcon={Check}
                  onAction={onAccept}
                  onViewDetails={onViewDetails}
                  isLoading={loadingAccept}
                  onReject={() => {
                    setTargetOrder(item);
                    setShowDecline(true);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          {pageCount > 1 && (
            <div className="mt-16 flex justify-center">
              <ReactPaginate
                pageCount={pageCount}
                onPageChange={handlePageChange}
                previousLabel={<Plus className="h-4 w-4 rotate-90" />}
                nextLabel={<Plus className="h-4 w-4 -rotate-90" />}
                className="flex items-center gap-2"
                pageClassName="h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition hover:bg-slate-100  text-slate-500"
                activeClassName="!bg-blue-600 !text-white shadow-lg shadow-blue-600/20"
                previousClassName="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white "
                nextClassName="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white "
                breakLabel="..."
              />
            </div>
          )}
        </>
      )}

      <ProdunctNewOrder
        handlePro={() => setOpen(false)}
        isOpen={isOpen}
        loadingPro={loadingPro}
        handleAccept={() => {
          // find target item from list
          const itm = newOrderList.find(i => i.id === targetOrder?.id);
          if (itm) onAccept(itm.id, itm);
          setOpen(false);
        }}
      />
      
      <ConfirmBox
        open={showDecline}
        closeDialog={() => setShowDecline(false)}
        title={targetOrder?.id}
        deleteFunction={onDecline}
      />
    </div>
  );
}
