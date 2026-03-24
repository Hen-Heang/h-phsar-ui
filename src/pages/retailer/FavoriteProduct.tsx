import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  MapPin,
  Eye,
  Store,
  Tag,
  Search,
  LayoutGrid,
  Trash2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PropagateLoader } from "react-spinners";

import {
  get_only_bookmark,
  remove_bookmark,
} from "../../redux/services/retailer/favourite.service";
import {
  deleteBookMark,
  getOnlyBookmark,
  setLoadingFavorite,
} from "../../redux/slices/retailer/favoriteSlice";
import { setStoreId } from "../../redux/slices/retailer/homepageSlice/allShopSlice";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import noImage from "../../assets/images/no_image.jpg";

export default function FavoriteProduct() {
  const dispatch = useDispatch();
  const router = useRouter();
  const bookMarkList = useSelector((state) => state.favorite.data);
  const loading = useSelector((state) => state.favorite.loading);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "StockFlow | My Favorites";
    fetchFavorites();
  }, []);

  const fetchFavorites = () => {
    dispatch(setLoadingFavorite(true));
    get_only_bookmark(dispatch)
      .then((r) => {
        if (r && r.data && r.data.status === 200) {
          dispatch(getOnlyBookmark(r.data.data));
        }
      })
      .finally(() => {
        dispatch(setLoadingFavorite(false));
      });
  };

  const onClickGetDataShop = (id, storeName) => {
    dispatch(setStoreId(id));
    router.push(
      `/retailer/distributor-shop?storeId=${id}&storeName=${encodeURIComponent(storeName)}`,
    );
    window.scrollTo(0, 0);
  };

  const handleDeleteBookmark = (e, id) => {
    e.stopPropagation();
    remove_bookmark(id).then(() => {
      dispatch(deleteBookMark(id));
    });
  };

  const filteredFavorites = (bookMarkList || []).filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categories?.some((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-family-retailer">
      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        {/* Header */}
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-orange-500">
              <Heart className="h-5 w-5 fill-orange-500" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                Curated Collection
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Saved Distributors
            </h1>
            <p className="mt-2 text-slate-500 max-w-xl">
              Quickly access your preferred supply partners and their latest
              stock updates.
            </p>
          </div>

          <div className="relative group w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-orange-500/20 transition-all font-medium text-sm"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <PropagateLoader color="#f97316" size={12} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4 animate-pulse">
              Syncing Favorites...
            </p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center px-6"
          >
            <div className="rounded-full bg-orange-50 p-8 mb-6">
              <Store className="h-16 w-16 text-orange-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              {searchQuery ? "No matches found" : "Your collection is empty"}
            </h3>
            <p className="text-slate-500 mt-2 max-w-xs">
              {searchQuery
                ? "Try adjusting your search terms to find what you're looking for."
                : "Bookmark distributors you frequently work with to see them here."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push("/retailer/home")}
                className="mt-8 h-12 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold gap-2"
              >
                Explore Shops
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredFavorites.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  variants={itemVariants}
                  exit="exit"
                >
                  <Card
                    className="group relative h-full overflow-hidden border-none rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 bg-white cursor-pointer"
                    onClick={() => onClickGetDataShop(item.id, item.name)}
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Image Section */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={getSafeImageSrc(item.bannerImage, noImage)}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => applyImageFallback(e, noImage)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Rating Badge */}
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-lg">
                          <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                          <span className="text-[11px] font-black text-slate-900">
                            {parseFloat(item.rating).toFixed(1)}
                          </span>
                        </div>

                        {/* Unfavorite Action */}
                        <button
                          onClick={(e) => handleDeleteBookmark(e, item.id)}
                          className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-orange-500 shadow-lg hover:bg-orange-500 hover:text-white transition-all transform hover:rotate-12"
                        >
                          <Heart className="h-5 w-5 fill-current" />
                        </button>
                      </div>

                      {/* Content Section */}
                      <div className="p-8 flex flex-col flex-1">
                        <div className="mb-4">
                          <h3 className="text-xl font-black text-slate-900 line-clamp-1 group-hover:text-orange-500 transition-colors">
                            {item.name}
                          </h3>
                          <div className="mt-2 flex items-start gap-2 text-slate-400">
                            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-slate-300" />
                            <p className="text-xs font-medium leading-relaxed line-clamp-2">
                              {item.address}
                            </p>
                          </div>
                        </div>

                        {/* Categories */}
                        <div className="mt-auto pt-6 border-t border-slate-50 flex flex-wrap gap-2">
                          {item.categories && item.categories.length > 0 ? (
                            item.categories.slice(0, 3).map((cat, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-lg bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors"
                              >
                                {cat.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                              General Stock
                            </span>
                          )}
                          {item.categories?.length > 3 && (
                            <span className="text-[10px] font-black text-slate-300 pt-1">
                              +{item.categories.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Hover Action Link */}
                        <div className="mt-6 flex items-center justify-between text-orange-500 font-black text-xs uppercase tracking-widest opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <span>Visit Store</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
