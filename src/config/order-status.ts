import {
  CheckCircle2,
  CircleX,
  ClipboardList,
  Clock3,
  PackageCheck,
  PackageOpen,
  ShoppingCart,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { BackendOrderStatus } from "@/types/order";

export type StatusTone =
  | "neutral"
  | "info"
  | "warning"
  | "success"
  | "danger";

export type BuyerOrderAction =
  | "CHECKOUT"
  | "CANCEL_REQUEST"
  | "CONFIRM_RECEIPT";
export type SupplierOrderAction = "ACCEPT" | "REJECT" | "DISPATCH";

export interface OrderStatusMeta {
  label: string;
  description: string;
  tone: StatusTone;
  icon: LucideIcon;
  progress: number;
  terminal: boolean;
  buyerActions: readonly BuyerOrderAction[];
  supplierActions: readonly SupplierOrderAction[];
}

export const ORDER_STATUS_META: Record<
  BackendOrderStatus,
  OrderStatusMeta
> = {
  CART: {
    label: "Cart",
    description: "Items are still in the cart.",
    tone: "neutral",
    icon: ShoppingCart,
    progress: 0,
    terminal: false,
    buyerActions: ["CHECKOUT"],
    supplierActions: [],
  },
  DRAFT: {
    label: "Draft",
    description: "The order has been saved for later.",
    tone: "neutral",
    icon: ClipboardList,
    progress: 10,
    terminal: false,
    buyerActions: ["CHECKOUT"],
    supplierActions: [],
  },
  PENDING: {
    label: "Pending",
    description: "The supplier is reviewing the order.",
    tone: "warning",
    icon: Clock3,
    progress: 25,
    terminal: false,
    buyerActions: ["CANCEL_REQUEST"],
    supplierActions: ["ACCEPT", "REJECT"],
  },
  PROCESSING: {
    label: "Preparing",
    description: "The supplier is preparing the order.",
    tone: "info",
    icon: PackageOpen,
    progress: 55,
    terminal: false,
    buyerActions: [],
    supplierActions: ["DISPATCH"],
  },
  DISPATCHED: {
    label: "Dispatched",
    description: "The order is on its way to the buyer.",
    tone: "info",
    icon: Truck,
    progress: 80,
    terminal: false,
    buyerActions: ["CONFIRM_RECEIPT"],
    supplierActions: [],
  },
  COMPLETED: {
    label: "Completed",
    description: "The buyer confirmed receipt.",
    tone: "success",
    icon: PackageCheck,
    progress: 100,
    terminal: true,
    buyerActions: [],
    supplierActions: [],
  },
  REJECTED: {
    label: "Rejected",
    description: "The supplier rejected the order.",
    tone: "danger",
    icon: CircleX,
    progress: 0,
    terminal: true,
    buyerActions: [],
    supplierActions: [],
  },
  CANCELLED: {
    label: "Cancelled",
    description: "The order was cancelled.",
    tone: "danger",
    icon: CircleX,
    progress: 0,
    terminal: true,
    buyerActions: [],
    supplierActions: [],
  },
};

export function getOrderStatusMeta(
  status: BackendOrderStatus,
): OrderStatusMeta {
  return ORDER_STATUS_META[status];
}

export function isBuyerActionAllowed(
  status: BackendOrderStatus,
  action: BuyerOrderAction,
): boolean {
  return ORDER_STATUS_META[status].buyerActions.includes(action);
}

export function isSupplierActionAllowed(
  status: BackendOrderStatus,
  action: SupplierOrderAction,
): boolean {
  return ORDER_STATUS_META[status].supplierActions.includes(action);
}
