"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { toast } from "react-toastify";
import { PropagateLoader } from "react-spinners";

import {
  decline_order,
  get_accept_newOrder,
  get_newOrder,
  get_newOrder_withoutLoading,
} from "../../../redux/services/distributor/NewOrder.service";
import { getProductDetail } from "../../../redux/slices/distributor/productSlice";
import { get_detail_product } from "../../../redux/services/distributor/product.service";
import {
  acceptOrder,
  addDataToPrepar,
  declineNewOrder,
  getNewOrder,
  setLoadingTheOrder,
} from "../../../redux/slices/distributor/orderPageSlice";
import OrderCard from "./OrderCard";
import ConfirmBox from "./ConfirmBox";
import ProdunctNewOrder from "./ProdunctNewOrder";

// Shared Resources
import DataTablePagination from "@/shared/components/DataTablePagination";
import useWebSocket from "@/shared/hooks/useWebSocket";

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

  // WebSocket Integration
  const onWebSocketMessage = useCallback(
    (payload) => {
      if (payload.status === "ORDER") {
        get_newOrder_withoutLoading().then(
          (r) => r.data.status === 200 && dispatch(getNewOrder(r.data.data)),
        );
      }
    },
    [dispatch],
  );

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : "";
  useWebSocket(userId ? `/user/${userId}/private` : null, onWebSocketMessage);

  // Initial Fetch
  useEffect(() => {
    dispatch(setLoadingTheOrder(true));
    get_newOrder(dispatch)
      .then(
        (r) => r?.data?.status === 200 && dispatch(getNewOrder(r.data.data)),
      )
      .finally(() => dispatch(setLoadingTheOrder(false)));
  }, [dispatch]);

  const currentItems = newOrderList.slice(
    itemOffset,
    itemOffset + itemsPerPage,
  );
  const pageCount = Math.ceil(newOrderList.length / itemsPerPage);

  const handlePageChange = (e) =>
    setItemOffset((e.selected * itemsPerPage) % newOrderList.length);

  const onAccept = async (id, item) => {
    setLoadingAccept(true);
    try {
      const res = await get_accept_newOrder(id, item);
      if (res?.status === 401 || res?.status === 403) {
        toast.error("Session expired. Please sign in again.");
      } else if (res?.status === 409) {
        toast.error(res.data.detail);
      } else if (res?.status >= 200 && res?.status < 300) {
        dispatch(acceptOrder(id));
        dispatch(addDataToPrepar(item));
        toast.success("Order accepted!");
      } else {
        toast.error("Failed to accept order. Please try again.");
      }
    } finally {
      setLoadingAccept(false);
    }
  };

  const onDecline = async () => {
    setLoadingAccept(true);
    try {
      const res = await decline_order(targetOrder.id);
      if (res?.status === 401 || res?.status === 403) {
        toast.error("Session expired. Please sign in again.");
      } else if (res?.status === 409) {
        toast.error(res.data.detail);
      } else if (res?.status >= 200 && res?.status < 300) {
        dispatch(declineNewOrder(targetOrder.id));
        toast.info("Order declined.");
      } else {
        toast.error("Failed to decline order. Please try again.");
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
      .then((r) => dispatch(getProductDetail(r.data.data.products)))
      .finally(() => setLoadingPro(false));
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <PropagateLoader color="#0f766e" />
        </div>
      ) : newOrderList.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50  ">
          <ShoppingBag className="h-16 w-16 text-slate-200 " />
          <h3 className="mt-6 text-xl font-bold text-slate-900 ">
            No New Orders
          </h3>
          <p className="mt-2 text-slate-500">
            Wait for retailers to place new stock requests.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {currentItems.map((item, idx) => (
                <OrderCard
                  key={item.id}
                  index={idx}
                  item={item}
                  status="Pending"
                  actionLabel="Accept"
                  actionIcon={Check}
                  onAction={onAccept}
                  onViewDetails={onViewDetails}
                  isLoading={loadingAccept}
                  onDecline={(id) => {
                    setTargetOrder(item);
                    setShowDecline(true);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

          <DataTablePagination
            pageCount={pageCount}
            onPageChange={handlePageChange}
            theme="blue"
          />
        </>
      )}

      <ProdunctNewOrder
        handlePro={() => setOpen(false)}
        isOpen={isOpen}
        loadingPro={loadingPro}
        handleAccept={() => {
          // find target item from list
          const itm = newOrderList.find((i) => i.id === targetOrder?.id);
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
