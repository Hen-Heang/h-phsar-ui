"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Truck, 
  Plus
} from "lucide-react";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";

import {
  get_all_preparing,
  get_finish,
} from "../../../redux/services/supplier/Preparing.service";
import { getProductDetail } from "../../../redux/slices/supplier/productSlice";
import { get_detail_product } from "../../../redux/services/supplier/product.service";
import {
  FinishedOrder,
  addDataToDispatch,
  getPrepraingOrder,
  setLoadingTheOrder,
} from "../../../redux/slices/supplier/orderPageSlice";
import { sendOneSignalNotification } from "@/lib/notifications/send-onesignal-client";
import OrderCard from "./OrderCard";
import Product from "./Product";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";

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
        const userId = res.data.data?.userId;
        if (userId != null) {
          await sendOneSignalNotification({
            contents: { en: "Your order was prepared for delivery." },
            include_external_user_ids: [userId.toString()],
          });
        }
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
        <LoadingState />
      ) : preparingList.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders in Preparation"
          description="Items you've accepted will appear here while being packed."
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
                  status="PROCESSING"
                  actionType="DISPATCH"
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
