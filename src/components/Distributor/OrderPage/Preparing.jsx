"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Truck, 
  Plus
} from "lucide-react";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { PropagateLoader } from "react-spinners";

import {
  get_all_preparing,
  get_finish,
} from "../../../redux/services/distributor/Preparing.service";
import { getProductDetail } from "../../../redux/slices/distributor/productSlice";
import { get_detail_product } from "../../../redux/services/distributor/product.service";
import {
  FinishedOrder,
  addDataToDispatch,
  getPrepraingOrder,
  setLoadingTheOrder,
} from "../../../redux/slices/distributor/orderPageSlice";
import { sendOneSignalNotification } from "@/lib/notifications/send-onesignal-client";
import OrderCard from "./OrderCard";
import Product from "./Product";

export default function Preparing({ toggleTab3 }) {
  const dispatch = useDispatch();
  const preparingList = useSelector((state) => state.distributorOrder.preData);
  const loading = useSelector((state) => state.distributorOrder.loading);

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;
  
  const [isOpen, setOpen] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);

  useEffect(() => {
    dispatch(setLoadingTheOrder(true));
    get_all_preparing(dispatch)
      .then(r => r?.data?.status === 200 && dispatch(getPrepraingOrder(r.data.data)))
      .finally(() => dispatch(setLoadingTheOrder(false)));
  }, [dispatch]);

  const currentItems = preparingList.slice(itemOffset, itemOffset + itemsPerPage);
  const pageCount = Math.ceil(preparingList.length / itemsPerPage);

  const handlePageChange = (e) => setItemOffset((e.selected * itemsPerPage) % preparingList.length);

  const onDispatch = async (id, item) => {
    setFinishLoading(true);
    try {
      const res = await get_finish(id);
      if (res.status === 409) {
        toast.error(res.data.detail);
      } else {
        await sendOneSignalNotification({
          contents: { en: "Your order was prepared for delivery." },
          include_external_user_ids: [res.data.data.userId.toString()],
        });
        dispatch(FinishedOrder(id));
        dispatch(addDataToDispatch(item));
        toast.success("Order dispatched for delivery!");
      }
    } finally {
      setFinishLoading(false);
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
      ) : preparingList.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50">
          <Package className="h-16 w-16 text-slate-200 dark:text-slate-800" />
          <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">No Orders in Preparation</h3>
          <p className="mt-2 text-slate-500">Items you've accepted will appear here while being packed.</p>
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
                  status="Preparing"
                  actionLabel="Dispatch"
                  actionIcon={Truck}
                  onAction={onDispatch}
                  onViewDetails={onViewDetails}
                  isLoading={finishLoading}
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
                pageClassName="h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                activeClassName="!bg-teal-600 !text-white shadow-lg shadow-teal-600/20"
                previousClassName="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white dark:border-slate-800"
                nextClassName="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white dark:border-slate-800"
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
