// @ts-nocheck -- legacy page, pending UI-11 TypeScript alignment pass
import React, { useEffect, useState } from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Star,
  MapPin,
  Phone,
  Heart,
  LayoutGrid,
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Store,
} from "lucide-react";
import { toast } from "react-toastify";

import AllProducts from "./AllProducts";
import AllProductSortByPrice from "./AllProductSortByPrice";
import AllProductSortByDate from "./AllProductSortByDate";
import Beverage from "./Beverage";
import noImage from "../../assets/images/no_image.jpg";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import {
  bookmark_store,
  get_all_category_by_storeId,
  get_all_product_by_category,
  get_all_product_by_storeId,
  get_all_product_sort_by_created_date,
  get_all_product_sort_by_price,
  get_store_by_id,
  remove_bookmark_store,
} from "../../redux/services/buyer/retailerHomepage.service";
import {
  getAllCategoryByStoreId,
  getAllProductByCategory,
  getAllProductByStoreId,
  getProductByDate,
  getProductByPrice,
  getShopById,
  setLoadingAdd,
  setLoadingCard,
  setLoadingPrice,
  setLoadingStore,
  setUpdateBookmarkOneStore,
} from "../../redux/slices/buyer/homepageSlice/allShopSlice";
import { setLoadingCategory } from "../../redux/slices/supplier/categorySlice";
import SkeletonSearchCard from "@/shared/components/skeletons/SkeletonSearchCard";
import SkeletonCard from "@/shared/components/skeletons/SkeletonCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function DistributorStoreRetailer() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const id = searchParams.get("storeId");

  const {
    oneShopData,
    categoryData,
    loadingStore,
    loadingCard,
    loadingPrice,
    loadingAdded,
  } = useSelector((state) => state.getDataAllShop);

  const [toggleState, setToggleState] = useState(0);
  const [selectedOption, setSelectedOption] = useState("all");

  useEffect(() => {
    document.title = `H-Phsar | ${oneShopData.name || "Shop"}`;
  }, [oneShopData.name]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const storeRes = await get_store_by_id(id, dispatch);
        dispatch(getShopById(storeRes?.data?.data ?? {}));
        dispatch(setLoadingStore(false));

        const productsRes = await get_all_product_by_storeId(id, dispatch);
        dispatch(getAllProductByStoreId(productsRes?.data?.data ?? []));
        dispatch(setLoadingCard(false));

        const dateRes = await get_all_product_sort_by_created_date(
          id,
          dispatch,
        );
        dispatch(getProductByDate(dateRes?.data?.data ?? []));
        dispatch(setLoadingAdd(false));

        const priceRes = await get_all_product_sort_by_price(id, dispatch);
        dispatch(getProductByPrice(priceRes?.data?.data ?? []));
        dispatch(setLoadingPrice(false));

        const catRes = await get_all_category_by_storeId(id, dispatch);
        dispatch(getAllCategoryByStoreId(catRes?.data?.data ?? []));
        dispatch(setLoadingCategory(false));
      } catch (err) {}
    };

    fetchData();
  }, [id, dispatch]);

  const handleGoBack = () => window.history.back();

  const handleDropdownChange = (option) => {
    setSelectedOption(option);
  };

  const toggleTab = (index) => {
    setToggleState(index);
    if (index === 0) return;

    get_all_product_by_category(id, index)
      .then((res) => dispatch(getAllProductByCategory(res?.data?.data ?? [])))
      .catch(() => dispatch(getAllProductByCategory([])));
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (oneShopData.isBookmarked) {
      remove_bookmark_store(oneShopData.id).then(() =>
        dispatch(setUpdateBookmarkOneStore(oneShopData)),
      );
    } else {
      bookmark_store(oneShopData.id).then(() =>
        dispatch(setUpdateBookmarkOneStore(oneShopData)),
      );
    }
  };

  if (loadingStore)
    return (
      <div className="mx-auto w-[90%] max-w-7xl pt-10">
        <SkeletonSearchCard />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 ">
      {/* Header / Banner */}
      <div className="relative h-[250px] w-full overflow-hidden sm:h-[350px] lg:h-[400px]">
        <img
          src={getSafeImageSrc(oneShopData.bannerImage, noImage)}
          onError={(e) => applyImageFallback(e, noImage)}
          className="h-full w-full object-cover"
          alt="Store Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />

        <button
          onClick={handleGoBack}
          className="absolute left-6 top-6 flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="mx-auto -mt-20 w-[90%] max-w-7xl">
        {/* Store Profile Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50   ">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 ">
                  <Store className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900  sm:text-4xl">
                    {oneShopData.name}
                  </h1>
                  <p className="text-sm font-medium text-slate-500">
                    Official Distributor Store
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-indigo-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(oneShopData.rating || 0) ? "fill-current" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700 ">
                    {parseFloat(oneShopData.rating || 0).toFixed(1)} Rating
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">
                    {oneShopData.address}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">
                    {oneShopData.primaryPhone}{" "}
                    {oneShopData.additionalPhone
                      ? `/ ${oneShopData.additionalPhone}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleBookmarkClick}
                variant={oneShopData.isBookmarked ? "default" : "outline"}
                className={`h-14 rounded-2xl px-6 font-bold transition-all ${
                  oneShopData.isBookmarked
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`mr-2 h-5 w-5 ${oneShopData.isBookmarked ? "fill-current" : ""}`}
                />
                {oneShopData.isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
              <Button className="h-14 rounded-2xl bg-slate-900 px-8 font-bold text-white hover:bg-slate-800  ">
                Contact Store
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar: Sorting & Navigation */}
        <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Navigation Tabs */}
          <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm  scrollbar-hide">
            <button
              onClick={() => toggleTab(0)}
              className={`whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
                toggleState === 0
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900   "
              }`}
            >
              All Products
            </button>
            {categoryData?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleTab(cat.id)}
                className={`whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
                  toggleState === cat.id
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900   "
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Sort Menu - Only visible for All Products */}
          {toggleState === 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 min-w-[200px] justify-between rounded-2xl border-slate-200 "
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-700 ">
                      Sort:{" "}
                      {selectedOption === "all"
                        ? "Default"
                        : selectedOption === "price"
                          ? "By Price"
                          : "By Date"}
                    </span>
                  </div>
                  <ChevronLeft className="h-4 w-4 rotate-[270deg] text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 overflow-hidden rounded-2xl p-1.5 shadow-2xl"
              >
                <DropdownMenuItem
                  onClick={() => handleDropdownChange("all")}
                  className="gap-3 rounded-xl py-3"
                >
                  <LayoutGrid className="h-4 w-4 text-slate-400" />
                  <span className="font-bold">Default View</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 " />
                <DropdownMenuItem
                  onClick={() => handleDropdownChange("price")}
                  className="gap-3 rounded-xl py-3"
                >
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="font-bold">Sort by Price</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 " />
                <DropdownMenuItem
                  onClick={() => handleDropdownChange("recent")}
                  className="gap-3 rounded-xl py-3"
                >
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="font-bold">Recently Added</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Product Grid Area */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${toggleState}-${selectedOption}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {toggleState === 0 ? (
                <>
                  {selectedOption === "all" &&
                    (loadingCard ? <SkeletonCard /> : <AllProducts />)}
                  {selectedOption === "price" &&
                    (loadingPrice ? (
                      <SkeletonCard />
                    ) : (
                      <AllProductSortByPrice />
                    ))}
                  {selectedOption === "recent" &&
                    (loadingAdded ? (
                      <SkeletonCard />
                    ) : (
                      <AllProductSortByDate />
                    ))}
                </>
              ) : (
                <Beverage />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
