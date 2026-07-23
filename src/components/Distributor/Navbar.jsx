"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  User,
  Store,
  Settings,
  Search,
  CheckCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AllNotification } from "./notification/AllNotification";
import { NewOrderNotification } from "./notification/NewOrderNotification";
import { OutofStockNotification } from "./notification/OutofStockNortification";
import { CancelNotification } from "./notification/CancelNofitication";
import { getAccountDistributer } from "../../redux/slices/distributor/AccountSlice";
import { get_account_distributor } from "../../redux/services/distributor/account.service";
import { getDataStore } from "../../redux/slices/distributor/storeSlice";
import { get_store_distributor_profile } from "../../redux/services/distributor/store.service";
import { getAllProduct } from "../../redux/slices/distributor/productSlice";
import { getAllCategoryDistributor } from "../../redux/slices/distributor/categorySlice";
import {
  getAllNotificationsDistributor,
  setLoadingNewOrder,
  setReadAllNotificationsDistributor,
} from "../../redux/slices/distributor/notification/notificationSlice";
import {
  get_all_notification,
  get_all_notification_withoutLoading,
  read_all_notification_distributor,
} from "../../redux/services/distributor/notification.service";
import { toast } from "react-toastify";
import useWebSocket from "@/shared/hooks/useWebSocket";

const Navbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emptyAccount, setEmptyAccount] = useState(false);
  const [toggleState, setToggleState] = useState(1);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showReadAll, setShowReadAll] = useState(false);
  const [loadingReadAll, setLoadingReadAll] = useState(false);

  const account = useSelector((state) => state.account.data);
  const storeList = useSelector((state) => state.shop.store);
  const allNotifications = useSelector(
    (state) => state.allDataNotification.dataNotification,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(window.localStorage.getItem("email") || "");
    }

    get_account_distributor().then((res) => {
      if (res.status === 200) {
        dispatch(getAccountDistributer(res.data.data));
        setEmptyAccount(false);
      } else {
        setEmptyAccount(true);
      }
    });

    get_store_distributor_profile().then((res) => {
      if (res.status === 200) dispatch(getDataStore(res.data.data));
    });
  }, [dispatch]);

  const fetchNotifications = useCallback(
    async (withLoading = true) => {
      const res = withLoading
        ? await get_all_notification(dispatch)
        : await get_all_notification_withoutLoading();
      if (res?.data?.data)
        dispatch(getAllNotificationsDistributor(res.data.data));
      dispatch(setLoadingNewOrder(false));
    },
    [dispatch],
  );

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : "";

  const onWebSocketMessage = useCallback(
    (payload) => {
      if (payload.status === "ORDER") fetchNotifications(false);
    },
    [fetchNotifications],
  );

  useWebSocket(userId ? `/user/${userId}/private` : null, onWebSocketMessage);

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const stats = useMemo(() => {
    const unseen = allNotifications.filter((n) => !n.seen);
    return {
      total: unseen.length,
      orders: unseen.filter((n) =>
        ["NEW_ORDER", "ORDER_COMPLETE"].includes(n.notificationType),
      ).length,
      stock: unseen.filter(
        (n) => n.notificationType === "OUT_OF_STOCK_NOTIFICATION",
      ).length,
      cancelled: unseen.filter((n) => n.notificationType === "ORDER_CANCELLED")
        .length,
    };
  }, [allNotifications]);

  const markAllRead = () => {
    setLoadingReadAll(true);
    read_all_notification_distributor()
      .then((res) => {
        if (res.status === 200) {
          dispatch(setReadAllNotificationsDistributor());
          setShowReadAll(false);
        }
      })
      .finally(() => setLoadingReadAll(false));
  };

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/");
  };

  const Badge = ({ count }) =>
    count > 0 ? (
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white ">
        {count > 9 ? "9+" : count}
      </span>
    ) : null;

  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-white/80  backdrop-blur-md sticky top-0 z-30 border-b border-slate-100  transition-colors">
      <div className="flex flex-col">
        <h2 className="text-xl font-black text-slate-900 ">
          {storeList?.name || "Distributor Dashboard"}
        </h2>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2.5 rounded-xl hover:bg-slate-100  transition-colors">
              <Bell className="w-5 h-5 text-slate-600 " />
              <Badge count={stats.total} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 p-0 overflow-hidden rounded-2xl border-slate-100 shadow-2xl"
          >
            <div className="p-4 bg-slate-50  border-b border-slate-100  flex items-center justify-between">
              <h3 className="font-bold text-slate-900 ">Notifications</h3>
              <button
                onClick={() => setShowReadAll(true)}
                className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
              >
                Mark all read
              </button>
            </div>
            <div className="p-2 grid grid-cols-4 gap-1 bg-white  border-b border-slate-50 ">
              {[
                { id: 1, label: "All", count: stats.total },
                { id: 2, label: "Order", count: stats.orders },
                { id: 3, label: "Stock", count: stats.stock },
                { id: 4, label: "X", count: stats.cancelled },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setToggleState(t.id)}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                    toggleState === t.id
                      ? "bg-blue-50 text-blue-700  "
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t.label} {t.count > 0 && `(${t.count})`}
                </button>
              ))}
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
              {toggleState === 1 && <AllNotification />}
              {toggleState === 2 && <NewOrderNotification />}
              {toggleState === 3 && <OutofStockNotification />}
              {toggleState === 4 && <CancelNotification />}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-100  transition-colors group">
              {account?.profileImage ? (
                <img
                  src={account.profileImage}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                  alt=""
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 ring-2 ring-white shadow-sm flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-900  line-clamp-1">
                  {account?.firstName
                    ? `${account.firstName} ${account.lastName}`
                    : "User Profile"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                  {email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl"
          >
            <DropdownMenuItem
              onClick={() => router.push("/supplier/profile")}
              className="rounded-lg gap-3 py-2.5"
            >
              <User className="w-4 h-4 text-slate-400" /> Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/supplier/store")}
              className="rounded-lg gap-3 py-2.5"
            >
              <Store className="w-4 h-4 text-slate-400" /> My Store
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={() => setShowSignOut(true)}
              className="rounded-lg gap-3 py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialogs */}
      <Dialog open={showSignOut} onOpenChange={setShowSignOut}>
        <DialogContent className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8" />
          </div>
          <DialogTitle className="text-xl font-bold mb-2">
            Sign Out?
          </DialogTitle>
          <p className="text-slate-500 text-sm mb-8">
            Are you sure you want to end your session?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowSignOut(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReadAll} onOpenChange={setShowReadAll}>
        <DialogContent className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCheck className="w-8 h-8" />
          </div>
          <DialogTitle className="text-xl font-bold mb-2">
            Mark all as read?
          </DialogTitle>
          <p className="text-slate-500 text-sm mb-8">
            This will clear all unread notification badges.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowReadAll(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={loadingReadAll}
              className="flex-1 bg-blue-600"
              onClick={markAllRead}
            >
              {loadingReadAll ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navbar;
