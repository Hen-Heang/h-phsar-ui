"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Plus
} from "lucide-react";
import ReactPaginate from "react-paginate";
import { PropagateLoader } from "react-spinners";
import { over } from "stompjs";
import SockJS from "sockjs-client";

import { 
  get_all_confirm, 
  get_all_confirm_withoutLoading 
} from "../../../redux/services/distributor/Confirm.service";
import { getProductDetail } from "../../../redux/slices/distributor/productSlice";
import { get_detail_product } from "../../../redux/services/distributor/product.service";
import {
  getConfirmOrder,
  setLoadingTheOrder,
} from "../../../redux/slices/distributor/orderPageSlice";
import OrderCard from "./OrderCard";
import Product from "./Product";

export default function Confirm({ toggleTab5 }) {
  const dispatch = useDispatch();
  const confirmList = useSelector((state) => state.distributorOrder.confirmData);
  const loading = useSelector((state) => state.distributorOrder.loading);

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;
  
  const [isOpen, setOpen] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);

  // WebSocket Connection
  useEffect(() => {
    const Sock = new SockJS(`${process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080"}/ws`);
    const stompClient = over(Sock);
    stompClient.connect({}, () => {
      stompClient.subscribe(`/user/${localStorage.getItem("userId")}/private`, (payload) => {
        if (JSON.parse(payload.body).status === "ORDER") {
          get_all_confirm_withoutLoading().then(r => r.data.status === 200 && dispatch(getConfirmOrder(r.data.data)));
        }
      });
    }, () => {});
    return () => Sock.close();
  }, [dispatch]);

  // Initial Fetch
  useEffect(() => {
    dispatch(setLoadingTheOrder(true));
    get_all_confirm(dispatch)
      .then(r => r?.data?.status === 200 && dispatch(getConfirmOrder(r.data.data)))
      .finally(() => dispatch(setLoadingTheOrder(false)));
  }, [dispatch]);

  const currentItems = confirmList.slice(itemOffset, itemOffset + itemsPerPage);
  const pageCount = Math.ceil(confirmList.length / itemsPerPage);

  const handlePageChange = (e) => setItemOffset((e.selected * itemsPerPage) % confirmList.length);

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
      ) : confirmList.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50  ">
          <Clock className="h-16 w-16 text-slate-200 " />
          <h3 className="mt-6 text-xl font-bold text-slate-900 ">Waiting for Confirmation</h3>
          <p className="mt-2 text-slate-500">Retailers are currently reviewing their delivered stock.</p>
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
                  status="Confirming"
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
