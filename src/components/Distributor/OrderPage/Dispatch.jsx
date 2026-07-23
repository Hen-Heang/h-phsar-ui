"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Plus
} from "lucide-react";
import ReactPaginate from "react-paginate";

import {
  get_all_dispatch,
} from "../../../redux/services/distributor/Dispatch.service";
import { getProductDetail } from "../../../redux/slices/distributor/productSlice";
import { get_detail_product } from "../../../redux/services/distributor/product.service";
import {
  getDispatch,
  setLoadingTheOrder,
} from "../../../redux/slices/distributor/orderPageSlice";
import OrderCard from "./OrderCard";
import Product from "./Product";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";

export default function Dispatch({ toggleTab4 }) {
  const dispatch = useDispatch();
  const dispatchList = useSelector((state) => state.distributorOrder.disData);
  const loading = useSelector((state) => state.distributorOrder.loading);

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;

  const [isOpen, setOpen] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);

  useEffect(() => {
    dispatch(setLoadingTheOrder(true));
    get_all_dispatch(dispatch)
      .then(r => r?.data?.status === 200 && dispatch(getDispatch(r.data.data)))
      .finally(() => dispatch(setLoadingTheOrder(false)));
  }, [dispatch]);

  const currentItems = dispatchList.slice(itemOffset, itemOffset + itemsPerPage);
  const pageCount = Math.ceil(dispatchList.length / itemsPerPage);

  const handlePageChange = (e) => setItemOffset((e.selected * itemsPerPage) % dispatchList.length);

  // Supplier responsibility ends at dispatch — only the buyer can mark an
  // order as received/completed (backend returns 403 for any supplier
  // attempt), so this tab is read-only tracking, not an action queue.
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
      ) : dispatchList.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No Active Deliveries"
          description="Track orders that are currently on their way to buyers."
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
                  status="Dispatch"
                  onViewDetails={onViewDetails}
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
