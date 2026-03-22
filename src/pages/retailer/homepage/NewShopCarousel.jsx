import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Store, 
  Star, 
  MapPin, 
  Phone, 
  Heart, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import noImage from "../../../assets/images/no_image.jpg";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import {
  getBookmarkStore,
  setStoreId,
  setUpdateBookmarkStoreNewest,
} from "../../../redux/slices/retailer/homepageSlice/allShopSlice";
import {
  bookmark_store,
  get_all_bookmark_store,
  remove_bookmark_store,
} from "../../../redux/services/retailer/retailerHomepage.service";
import Top10RecenceShop from "../../../components/retailler/skeletons/Top10RecenceShop";
import { Button } from "@/components/ui/button";

const NewShopCarousel = () => {
  const dataNewShop = useSelector((state) => state.getDataAllShop.dataNewShop);
  const topShops = useMemo(() => dataNewShop.slice(0, 3), [dataNewShop]);

  const router = useRouter();
  const dispatch = useDispatch();

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

  const handleBookmarkClick = useCallback((e, item) => {
    e.stopPropagation();
    if (item.isBookmarked) {
      remove_bookmark_store(item.id).then(() =>
        dispatch(setUpdateBookmarkStoreNewest(item))
      );
    } else {
      bookmark_store(item.id).then(() =>
        dispatch(setUpdateBookmarkStoreNewest(item))
      );
    }
  }, [dispatch]);

  if (bookmarkStoreQuery.isLoading) return <Top10RecenceShop />;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {topShops.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onClickGetDataShop(item.id, item.name)}
            className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10   "
          >
            {/* Store Banner */}
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={getSafeImageSrc(item.bannerImage, noImage)}
                onError={(e) => applyImageFallback(e, noImage)}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={item.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              {/* Badge */}
              <div className="absolute left-6 top-6 flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/30">
                <Sparkles className="h-3 w-3" />
                New Distributor
              </div>

              {/* Bookmark */}
              <button
                onClick={(e) => handleBookmarkClick(e, item)}
                className={`absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 ${
                  item.isBookmarked 
                  ? "bg-red-500 text-white" 
                  : "bg-white/20 text-white hover:bg-white/40"
                }`}
              >
                <Heart className={`h-5 w-5 ${item.isBookmarked ? "fill-current" : ""}`} />
              </button>

              {/* Quick Info Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 text-white/80">
                  <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                  <span className="text-xs font-bold">{parseFloat(item.rating || 0).toFixed(1)} Distributor Rating</span>
                </div>
                <h3 className="mt-1 line-clamp-1 text-2xl font-black text-white">
                  {item.name}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-slate-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  <p className="line-clamp-1 text-sm font-medium leading-relaxed ">
                    {item.address}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone className="h-4 w-4 shrink-0 text-orange-500" />
                  <p className="text-sm font-medium ">
                    {item.primaryPhone}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6 ">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-lg border-2 border-white bg-orange-100 " />
                  <div className="h-8 w-8 rounded-lg border-2 border-white bg-blue-100 " />
                  <div className="h-8 w-8 rounded-lg border-2 border-white bg-slate-100 " />
                </div>
                <Button variant="ghost" size="sm" className="h-10 rounded-xl font-bold text-orange-500 hover:bg-orange-50 group-hover:bg-orange-50">
                  Visit Store
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NewShopCarousel;
