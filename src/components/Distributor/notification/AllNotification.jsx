import React, { useEffect, useState } from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Package, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight,
  Info,
  AlertTriangle,
  X
} from "lucide-react";
import { toast } from "react-toastify";

import {
  get_all_notification,
  read_notification_distributor,
} from "../../../redux/services/distributor/notification.service";
import {
  getAllNotificationsDistributor,
  setUpdateDateNotification,
} from "../../../redux/slices/distributor/notification/notificationSlice";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const AllNotification = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [noDataNotifications, setNoDataNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    get_all_notification(dispatch).then((res) => {
      if (res.status === 200) {
        dispatch(getAllNotificationsDistributor(res.data.data));
        setNoDataNotifications(false);
      } else {
        setNoDataNotifications(true);
      }
    });
  }, [dispatch]);

  const allNotifications = useSelector(
    (state) => state.allDataNotification.dataNotification
  );

  const handleReadNotification = (data) => {
    setSelectedNotification(data);
    if (data.seen) {
      setShowModal(true);
    } else {
      read_notification_distributor(data.id).then((res) => {
        if (res.status === 200) {
          dispatch(setUpdateDateNotification(data));
          setShowModal(true);
        } else {
          toast.error("Failed to mark as read");
        }
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "NEW_ORDER": return <Package className="w-4 h-4 text-blue-500" />;
      case "ORDER_COMPLETE": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "ORDER_CANCELLED": return <XCircle className="w-4 h-4 text-rose-500" />;
      case "OUT_OF_STOCK_NOTIFICATION": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case "NEW_ORDER": return "New Order Received";
      case "ORDER_COMPLETE": return "Order Completed";
      case "ORDER_CANCELLED": return "Order Cancelled";
      case "OUT_OF_STOCK_NOTIFICATION": return "Stock Alert";
      default: return "Notification";
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {noDataNotifications || allNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50  flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-slate-300 " />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No notifications</p>
          </div>
        ) : (
          allNotifications.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => handleReadNotification(item)}
              className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                item.seen 
                  ? "hover:bg-slate-50 " 
                  : "bg-blue-50/50  border-l-4 border-blue-600"
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={item.image}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-slate-100 "
                />
                {!item.seen && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white " />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="text-sm font-black text-slate-900  truncate">
                    {item.store}
                  </h4>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                    {new Date(item.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-xs line-clamp-1 ${!item.seen ? 'text-slate-700  font-bold' : 'text-slate-500'}`}>
                  {item.title}
                </p>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedNotification && (
            <>
              <div className="bg-blue-600 px-8 py-10 text-white relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                    {getNotificationIcon(selectedNotification.notificationType)}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-100">
                    {getNotificationTitle(selectedNotification.notificationType)}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight">{selectedNotification.title}</DialogTitle>
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <img 
                    src={selectedNotification.retailerImage || "https://ui-avatars.com/api/?name=" + selectedNotification.retailerName} 
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                    alt=""
                  />
                  <div>
                    <h4 className="text-lg font-black text-slate-900 ">{selectedNotification.retailerName}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Phone className="w-3 h-3 text-blue-600" /> {selectedNotification.phone}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3 h-3 text-blue-600" /> {selectedNotification.address}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-slate-50  border border-slate-100 ">
                  <p className="text-sm leading-relaxed text-slate-600 ">
                    {selectedNotification.description}
                  </p>
                </div>

                <div className="mt-10">
                  <Button 
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-600/20"
                    onClick={() => setShowModal(false)}
                  >
                    Dismiss Notification
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
