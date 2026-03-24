import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ClipboardList,
  History,
  LucideIcon,
} from "lucide-react";

/**
 * Centralized order status configurations.
 */
export const ORDER_STATUSES = {
  PENDING: "Pending",
  DRAFT: "Draft",
  PREPARING: "Preparing",
  SHIPPING: "Shipping",
  CONFIRMING: "Confirming",
  COMPLETE: "Complete",
  DECLINED: "Declined",
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

interface StatusConfig {
  color: string;
  bg: string;
  border: string;
  icon: LucideIcon;
  progress: number;
}

export const getStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case ORDER_STATUSES.PENDING:
    case ORDER_STATUSES.DRAFT:
      return {
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        icon: ClipboardList,
        progress: 20,
      };
    case ORDER_STATUSES.PREPARING:
      return {
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        icon: Package,
        progress: 40,
      };
    case ORDER_STATUSES.SHIPPING:
      return {
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
        icon: Truck,
        progress: 60,
      };
    case ORDER_STATUSES.CONFIRMING:
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-100",
        icon: Clock,
        progress: 80,
      };
    case ORDER_STATUSES.COMPLETE:
      return {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        icon: CheckCircle2,
        progress: 100,
      };
    case ORDER_STATUSES.DECLINED:
      return {
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-100",
        icon: XCircle,
        progress: 0,
      };
    default:
      return {
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-100",
        icon: History,
        progress: 0,
      };
  }
};
