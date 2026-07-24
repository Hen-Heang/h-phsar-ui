"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Package, 
  Layers, 
  ShoppingCart, 
  BarChart3, 
  CheckSquare, 
  Download, 
  History, 
  User, 
  Store, 
  LogOut, 
  ChevronDown, 
  X,
  AlertTriangle
} from "lucide-react";

import HamburgerButton from "../HamburgerMenuButton/HamburgerButton";
import { useAppDispatch as useDispatch } from "@/redux/hooks";
import { getAllCategoryDistributor } from "../../redux/slices/supplier/categorySlice";
import NewImport from "./NewImport";
import { getAllProduct } from "../../redux/slices/supplier/productSlice";
import { getDataStore } from "../../redux/slices/supplier/storeSlice";
import { getAccountDistributer } from "../../redux/slices/supplier/AccountSlice";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();

  const [showSignOut, setShowSignOut] = useState(false);
  const [isOpenNewImport, setIsOpenNewImport] = useState(false);
  const [isImportSectionOpen, setIsImportSectionOpen] = useState(pathname.includes('import') || pathname.includes('history'));
  const [isProfileSectionOpen, setIsProfileSectionOpen] = useState(pathname.includes('account') || pathname.includes('store'));

  const handleSignOut = () => {
    localStorage.clear();
    dispatch(getAllProduct([]));
    dispatch(getAllCategoryDistributor([]));
    dispatch(getDataStore([]));
    dispatch(getAccountDistributer([]));
    router.push("/");
  };

  const menuItems = [
    { title: "Home", path: "/supplier/dashboard", icon: Home },
    { title: "Product", path: "/supplier/products", icon: Package },
    { title: "Category", path: "/supplier/categories", icon: Layers },
    { title: "Order", path: "/supplier/orders", icon: ShoppingCart },
    { title: "Report", path: "/supplier/reports", icon: BarChart3 },
    { title: "Order history", path: "/supplier/order-history", icon: CheckSquare },
  ];

  const getNavLinkClass = (path) => {
    const isActive = pathname === path;
    return `group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
      isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold" 
        : "text-slate-500 hover:bg-slate-50  "
    }`;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-screen w-72 bg-white border-r border-slate-100   transition-colors">
        <div className="p-8">
          <Link href="/supplier/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center">
              <img src="/logo/icon.png" alt="H-Phsar" className="h-full w-full object-contain" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 ">H-Phsar</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.path ? (
                <Link href={item.path} className={getNavLinkClass(item.path)}>
                  <item.icon className={`w-5 h-5 ${pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
                  {item.title}
                </Link>
              ) : (
                <button onClick={item.onClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50   transition-all group">
                  <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  {item.title}
                </button>
              )}
            </div>
          ))}

          {/* Submenu: Import */}
          <div className="pt-2">
            <button 
              onClick={() => setIsImportSectionOpen(!isImportSectionOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                isImportSectionOpen ? "text-blue-600  font-bold" : "text-slate-500"
              } hover:bg-slate-50 `}
            >
              <Download className={`w-5 h-5 ${isImportSectionOpen ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
              <span>Import</span>
              <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${isImportSectionOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isImportSectionOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pl-12 space-y-1"
                >
                  <button onClick={() => setIsOpenNewImport(true)} className="w-full text-left py-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    New Import
                  </button>
                  <Link href="/supplier/import-history" className={`block py-2 text-sm transition-colors ${pathname === '/supplier/import-history' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-blue-600'}`}>
                    History
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submenu: Profile */}
          <div>
            <button 
              onClick={() => setIsProfileSectionOpen(!isProfileSectionOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                isProfileSectionOpen ? "text-blue-600  font-bold" : "text-slate-500"
              } hover:bg-slate-50 `}
            >
              <User className={`w-5 h-5 ${isProfileSectionOpen ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
              <span>Settings</span>
              <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${isProfileSectionOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isProfileSectionOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pl-12 space-y-1"
                >
                  <Link href="/supplier/profile" className={`block py-2 text-sm transition-colors ${pathname === '/supplier/profile' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-blue-600'}`}>
                    Account
                  </Link>
                  <Link href="/supplier/store" className={`block py-2 text-sm transition-colors ${pathname === '/supplier/store' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-blue-600'}`}>
                    Store Profile
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-50 ">
          <button 
            onClick={() => setShowSignOut(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50  transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-6 h-16 bg-white  border-b border-slate-100 ">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center">
            <img src="/logo/icon.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 ">H-Phsar</span>
        </div>
        <HamburgerButton setMobileMenu={setMobileMenu} mobileMenu={mobileMenu} />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenu && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenu(false)}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-sm h-full bg-white  shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-50  flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 flex items-center justify-center">
                    <img src="/logo/icon.png" alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <span className="text-lg font-black text-slate-900 ">H-Phsar</span>
                </div>
                <button onClick={() => setMobileMenu(false)} className="p-2 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => (
                  <div key={item.title}>
                    {item.path ? (
                      <Link 
                        href={item.path} 
                        onClick={() => setMobileMenu(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold ${
                          pathname === item.path 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'text-slate-600 '
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${pathname === item.path ? 'text-white' : 'text-slate-400'}`} /> 
                        {item.title}
                      </Link>
                    ) : (
                      <button 
                        onClick={() => { item.onClick(); setMobileMenu(false); }}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold text-slate-600  hover:bg-slate-50  transition-all"
                      >
                        <item.icon className="w-5 h-5 text-slate-400" />
                        {item.title}
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="my-4 h-px bg-slate-50 " />
                
                <Link href="/supplier/profile" onClick={() => setMobileMenu(false)} className="flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold text-slate-600 ">
                  <User className="w-5 h-5 text-slate-400" /> Account Settings
                </Link>
                <Link href="/supplier/store" onClick={() => setMobileMenu(false)} className="flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold text-slate-600 ">
                  <Store className="w-5 h-5 text-slate-400" /> Store Profile
                </Link>
                <button 
                  onClick={() => { setMobileMenu(false); setShowSignOut(true); }}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold text-rose-500 hover:bg-rose-50  transition-all"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Components & Dialogs */}
      <NewImport isOpenNewImport={isOpenNewImport} handleShowImport={() => setIsOpenNewImport(false)} />


      <Dialog open={showSignOut} onOpenChange={setShowSignOut}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 text-center border-none shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 ">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 ">Sign Out?</DialogTitle>
          <p className="mt-4 text-slate-500 leading-relaxed">
            Are you sure you want to end your distributor session? You'll need to sign back in to manage your inventory.
          </p>
          <div className="mt-10 flex gap-3">
            <Button 
              className="h-14 flex-1 rounded-2xl bg-rose-500 font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-[0.98]"
              onClick={handleSignOut}
            >
              Yes, Sign Out
            </Button>
            <Button 
              variant="outline" 
              className="h-14 flex-1 rounded-2xl border-slate-200  font-bold text-slate-600  hover:bg-slate-50  transition-all active:scale-[0.98]"
              onClick={() => setShowSignOut(false)}
            >
              Stay Logged In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;
