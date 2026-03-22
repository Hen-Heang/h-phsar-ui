import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, 
  Star, 
  MapPin, 
  Heart, 
  ChevronRight,
  ChevronLeft,
  Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";

import {
  getBookmarkStore,
  setStoreId,
  setUpdateBookmarkStore,
} from "../../../redux/slices/retailer/homepageSlice/allShopSlice";
import noImage from "../../../assets/images/no_image.jpg";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import {
  bookmark_store,
  get_all_bookmark_store,
  remove_bookmark_store,
} from "../../../redux/services/retailer/retailerHomepage.service";
import AllShopSkeleton from "../../../components/retailler/skeletons/AllShop";
import { Button } from "@/components/ui/button";

const AllShopCarousel = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const dataShop = useSelector((state) => state.getDataAllShop.dataShop);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 9;

  const onClickGetDataShop = useCallback((id, storeName) => {
    dispatch(setStoreId(id));
    router.push(`/retailer/distributor-shop?storeId=${id}&storeName=${encodeURIComponent(storeName)}`);
    window.scrollTo(0, 0);
  }, [dispatch, router]);

  const bookmarkStoreQuery = useQuery({
    queryKey: ["retailer", "bookmark-store"],
    queryFn: async () => {
      const res = await get_all_bookmark_store();
      return res?.data?.data || [];
    },
  });

  useEffect(() => {
    if (bookmarkStoreQuery.data) {
      dispatch(getBookmarkStore(bookmarkStoreQuery.data));
    }
  }, [bookmarkStoreQuery.data, dispatch]);

  const handlePageChange = useCallback((event) => {
    const newOffset = (event.selected * itemsPerPage) % (dataShop?.length || 1);
    setItemOffset(newOffset);
    window.scrollTo({ top: 800, behavior: 'smooth' });
  }, [dataShop?.length]);

  const currentDataShop = useMemo(() => {
    return dataShop.slice(itemOffset, itemOffset + itemsPerPage);
  }, [dataShop, itemOffset]);

  const handleBookmarkClick = useCallback((e, item) => {
    e.stopPropagation();
    if (item.isBookmarked) {
      remove_bookmark_store(item.id).then(() => dispatch(setUpdateBookmarkStore(item)));
    } else {
      bookmark_store(item.id).then(() => dispatch(setUpdateBookmarkStore(item)));
    }
  }, [dispatch]);

  if (bookmarkStoreQuery.isLoading) return <AllShopSkeleton />;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {currentDataShop.map((item, idx) => (
            <motion.div
              key={item.id ?? idx}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: (idx % 3) * 0.05 }}
              onClick={() => onClickGetDataShop(item.id, item.name)}
              className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 transition-all hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5  "
            >
              {/* Card Image Wrapper */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-50 ">
                <img
                  src={getSafeImageSrc(item.bannerImage, noImage)}
                  onError={(e) => applyImageFallback(e, noImage)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={item.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                
                {/* Bookmark Overlay */}
                <button
                  onClick={(e) => handleBookmarkClick(e, item)}
                  className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 ${
                    item.isBookmarked 
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                    : "bg-white/80 text-slate-400 hover:bg-white hover:text-red-500 shadow-sm"
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 ${item.isBookmarked ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Card Content */}
              <div className="mt-5 px-2 pb-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="line-clamp-1 text-lg font-black text-slate-900 ">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-xs font-black">{parseFloat(item.rating || 0).toFixed(1)}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-slate-500 ">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span className="line-clamp-1 text-xs font-medium">{item.address}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.categories?.slice(0, 2).map((cat) => (
                    <span key={cat.id} className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-500  ">
                      <Tag className="h-2 w-2" />
                      {cat.name}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4 ">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Verified Seller</span>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[11px] font-black uppercase tracking-wider text-orange-500 hover:bg-orange-50">
                    View Detail
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {dataShop.length > itemsPerPage && (
        <div className="mt-16 flex justify-center">
          <ReactPaginate
            pageCount={pageCount}
            onPageChange={handlePageChange}
            previousLabel={<ChevronLeft className="h-5 w-5" />}
            nextLabel={<ChevronRight className="h-5 w-5" />}
            className="flex items-center gap-2"
            pageClassName="h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition hover:bg-slate-100  text-slate-500"
            activeClassName="!bg-orange-500 !text-white shadow-lg shadow-orange-500/20"
            previousClassName="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white  "
            nextClassName="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white  "
            breakLabel="..."
          />
        </div>
      )}
    </div>
  );
};

export default AllShopCarousel;
