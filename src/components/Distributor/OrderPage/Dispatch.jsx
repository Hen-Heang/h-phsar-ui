"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  CheckCircle, 
  Plus
} from "lucide-react";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { PropagateLoader } from "react-spinners";

import {
  get_all_dispatch,
  get_delivered,
} from "../../../redux/services/distributor/Dispatch.service";
import { getProductDetail } from "../../../redux/slices/distributor/productSlice";
import { get_detail_product } from "../../../redux/services/distributor/product.service";
import {
  addDataToConfirm,
  deliverdOrder,
  getDispatch,
  setLoadingTheOrder,
} from "../../../redux/slices/distributor/orderPageSlice";
import { sendOneSignalNotification } from "@/lib/notifications/send-onesignal-client";
import OrderCard from "./OrderCard";
import Product from "./Product";

export default function Dispatch({ toggleTab4 }) {
  const dispatch = useDispatch();
  const dispatchList = useSelector((state) => state.distributorOrder.disData);
  const loading = useSelector((state) => state.distributorOrder.loading);

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;
  
  const [isOpen, setOpen] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  useEffect(() => {
    dispatch(setLoadingTheOrder(true));
    get_all_dispatch(dispatch)
      .then(r => r?.data?.status === 200 && dispatch(getDispatch(r.data.data)))
      .finally(() => dispatch(setLoadingTheOrder(false)));
  }, [dispatch]);

  const currentItems = dispatchList.slice(itemOffset, itemOffset + itemsPerPage);
  const pageCount = Math.ceil(dispatchList.length / itemsPerPage);

  const handlePageChange = (e) => setItemOffset((e.selected * itemsPerPage) % dispatchList.length);

  const onDelivered = async (id, item) => {
    setDispatchLoading(true);
    try {
      const res = await get_delivered(id);
      if (res.status === 409) {
        toast.error(res.data.detail);
      } else {
        const userId = res.data.data?.userId;
        if (userId != null) {
          await sendOneSignalNotification({
            contents: { en: "Your order has been delivered, please check your order details." },
            include_external_user_ids: [userId.toString()],
          });
        }
        dispatch(deliverdOrder(id));
        dispatch(addDataToConfirm(item));
        toast.success("Order marked as delivered!");
      }
    } finally {
      setDispatchLoading(false);
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
        <div className="flex h-96 items-center justify-center">
          <PropagateLoader color="#0f766e" />
        </div>
      ) : dispatchList.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50  ">
          <Truck className="h-16 w-16 text-slate-200 " />
          <h3 className="mt-6 text-xl font-bold text-slate-900 ">No Active Deliveries</h3>
          <p className="mt-2 text-slate-500">Track orders that are currently on their way to retailers.</p>
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
                  status="Dispatch"
                  actionLabel="Mark Delivered"
                  actionIcon={CheckCircle}
                  onAction={onDelivered}
                  onViewDetails={onViewDetails}
                  isLoading={dispatchLoading}
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

      <Product handlePro={() => setOpen(false)} isOpen={isOpen} loadingPro={loadingPro} />
    </div>
  );
}
