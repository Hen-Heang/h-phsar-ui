"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Store,
  Star,
  MapPin,
  Tag,
  ChevronRight,
  SearchX,
  Sparkles,
} from "lucide-react";
import { PropagateLoader } from "react-spinners";
import noImage from "../../assets/images/no_image.jpg";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { Button } from "@/components/ui/button";

export default function SearchingRetailer() {
  const SearchList = useSelector((state) => state.search.item);
  const loadingSearch = useSelector((state) => state.search.loading);
  const error = useSelector((state) => state.search.error);
  const router = useRouter();

  const onClickGetDataShop = (id, storeName) => {
    router.push(
      `/retailer/distributor-shop?storeId=${id}&storeName=${encodeURIComponent(storeName)}`,
    );
    window.scrollTo(0, 0);
  };

  if (loadingSearch)
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
        <PropagateLoader color="#f97316" size={15} />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Searching Marketplace...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 ">
      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        {!SearchList ||
        SearchList === "" ||
        SearchList.length === 0 ||
        error ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="rounded-full bg-white p-8 shadow-xl shadow-slate-200/50  ">
              <SearchX className="h-16 w-16 text-slate-300 " />
            </div>
            <h2 className="mt-8 text-3xl font-black tracking-tight text-slate-900 ">
              No Results Found
            </h2>
            <p className="mt-2 max-w-xs text-slate-500">
              We couldn't find any distributors matching your search criteria.
            </p>
            <Button
              variant="outline"
              className="mt-8 h-12 rounded-2xl border-slate-200 "
              onClick={() => router.push("/retailer/home")}
            >
              Back to Marketplace
            </Button>
          </div>
        ) : (
          <>
            <header className="mb-10">
              <div className="mb-2 flex items-center gap-2 text-orange-500">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  Search Results
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900  sm:text-4xl">
                Found {SearchList.length} Distributors
              </h1>
            </header>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {SearchList.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onClickGetDataShop(item.id, item.name)}
                  className="group cursor-pointer overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10   "
                >
                  {/* Banner Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={getSafeImageSrc(item.bannerImage, noImage)}
                      onError={(e) => applyImageFallback(e, noImage)}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={item.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-orange-600 shadow-xl backdrop-blur-md ">
                      <Store className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="line-clamp-1 text-xl font-black text-slate-900 ">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-orange-600  ">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-[10px] font-black">
                          {parseFloat(item.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-slate-500">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                      <p className="line-clamp-2 text-sm font-medium leading-relaxed">
                        {item.address}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {item.categories?.slice(0, 3).map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-500   "
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {cat.name}
                        </span>
                      ))}
                      {item.categories?.length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          +{item.categories.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6 ">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Distributor
                        </span>
                        <span className="text-xs font-bold text-slate-700 ">
                          Verified Seller
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 rounded-xl font-bold text-orange-500 hover:bg-orange-50 group-hover:bg-orange-50"
                      >
                        View Store
                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
