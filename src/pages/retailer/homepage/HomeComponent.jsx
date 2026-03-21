import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  Calendar, 
  Star, 
  ArrowRight,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  MapPin
} from "lucide-react";
import CategoryCarousel from "./CategoryCarousel";
import NewShopCarousel from "./NewShopCarousel";
import AllShopCarousel from "./AllShopCarousel";
import AllShopCarouselNewest from "./AllShopCarouselNewest";
import AllShopCarouselHighestRate from "./AllShopCarouselHighestRate";
import {
  get_all_store,
  get_all_new_store,
} from "../../../redux/services/retailer/retailerHomepage.service";
import {
  getAllDataNewShop,
  getDataAllShopShow,
} from "../../../redux/slices/retailer/homepageSlice/allShopSlice";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function HomeComponent() {
  useEffect(() => {
    document.title = "H-Phsar | Home";
  }, []);

  const dispatch = useDispatch();

  const allStoreQuery = useQuery({
    queryKey: queryKeys.retailer.allStores(),
    queryFn: async () => {
      const res = await get_all_store();
      return res?.data?.data || [];
    },
  });

  const newStoreQuery = useQuery({
    queryKey: queryKeys.retailer.newStores(),
    queryFn: async () => {
      const res = await get_all_new_store();
      return res?.data?.data || [];
    },
  });

  useEffect(() => {
    if (allStoreQuery.data) {
      dispatch(getDataAllShopShow(allStoreQuery.data));
    }
  }, [allStoreQuery.data, dispatch]);

  useEffect(() => {
    if (newStoreQuery.data) {
      dispatch(getAllDataNewShop(newStoreQuery.data));
    }
  }, [newStoreQuery.data, dispatch]);

  const [selectedOption, setSelectedOption] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: require("../../../assets/images/forCarousel4.webp")?.default || require("../../../assets/images/forCarousel4.webp"),
      title: "Direct from Distributors",
      subtitle: "Get the best wholesale prices directly from verified local suppliers."
    },
    {
      image: require("../../../assets/images/retailer/forCarousel.jpg")?.default || require("../../../assets/images/retailer/forCarousel.jpg"),
      title: "Efficient Inventory",
      subtitle: "Restock your store with ease using our modern management tools."
    },
    {
      image: require("../../../assets/images/retailer/woman-checking-her-delivery-groceries.jpg")?.default || require("../../../assets/images/retailer/woman-checking-her-delivery-groceries.jpg"),
      title: "Reliable Delivery",
      subtitle: "Track your orders in real-time and never run out of stock."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleDropdownChange = (option) => {
    setSelectedOption(option);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950"
    >
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden sm:h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <img
              src={heroSlides[currentSlide].image}
              alt="Hero Slide"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium Wholesale
                </span>
                <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-base text-slate-200 sm:text-lg">
                  {heroSlides[currentSlide].subtitle}
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Button size="lg" className="h-14 rounded-2xl bg-orange-500 px-8 text-base font-bold text-white hover:bg-orange-600">
                    Explore Marketplace
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 rounded-2xl border-white/20 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-md hover:bg-white hover:text-slate-950">
                    How it Works
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === idx ? "w-8 bg-orange-500" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-[105rem] px-4 sm:px-6 lg:px-8">
        
        {/* Category Section */}
        <motion.section variants={itemVariants} className="mt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                Browse Categories
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Find exactly what your store needs.
              </p>
            </div>
            <Button variant="ghost" className="hidden items-center gap-2 text-orange-500 hover:text-orange-600 sm:flex">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <CategoryCarousel />
        </motion.section>

        {/* New Shops Section */}
        <motion.section variants={itemVariants} className="mt-20">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                Recent Joiners
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Discover new distributors in your area.</p>
            </div>
          </div>
          <NewShopCarousel />
        </motion.section>

        {/* All Shops Grid & Filter */}
        <motion.section variants={itemVariants} className="mt-24">
          <div className="mb-10 flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Marketplace</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 min-w-[160px] justify-between rounded-xl border-slate-200 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Sort: {selectedOption === 'all' ? 'All Shops' : selectedOption === 'newest' ? 'Newest' : 'Highest Rated'}
                    </span>
                    <ChevronLeft className="h-4 w-4 rotate-[270deg]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 overflow-hidden rounded-2xl p-1.5 shadow-2xl">
                  <DropdownMenuItem 
                    onClick={() => handleDropdownChange("all")}
                    className={`gap-3 rounded-xl py-2.5 ${selectedOption === 'all' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400' : ''}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="font-bold">All Shops</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem 
                    onClick={() => handleDropdownChange("newest")}
                    className={`gap-3 rounded-xl py-2.5 ${selectedOption === 'newest' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400' : ''}`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="font-bold">Newest First</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem 
                    onClick={() => handleDropdownChange("rate")}
                    className={`gap-3 rounded-xl py-2.5 ${selectedOption === 'rate' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400' : ''}`}
                  >
                    <Star className="h-4 w-4" />
                    <span className="font-bold">Highest Rated</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Dynamic Content Overlay */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedOption}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              {selectedOption === "all" && <AllShopCarousel />}
              {selectedOption === "newest" && <AllShopCarouselNewest />}
              {selectedOption === "rate" && <AllShopCarouselHighestRate />}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          variants={itemVariants} 
          className="relative mt-24 overflow-hidden rounded-[3rem] bg-orange-500 px-8 py-20 text-center text-white"
        >
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-orange-400/20" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-orange-600/20" />
          
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready to restock?</h2>
            <p className="mt-4 text-lg text-orange-100">
              Join thousands of retailers growing their business with H-Phsar.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-14 rounded-2xl bg-white px-8 text-base font-bold text-orange-600 hover:bg-orange-50">
                Start Shopping Now
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
