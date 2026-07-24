import type { BackendOrderStatus } from "@/types/order";
import {
  ORDER_STATUS_META,
  getOrderStatusMeta,
} from "@/config/order-status";

/**
 * Compatibility exports for legacy imports. New UI should import directly
 * from `@/config/order-status`.
 */
export const ORDER_STATUSES: Record<BackendOrderStatus, BackendOrderStatus> = {
  CART: "CART",
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  DISPATCHED: "DISPATCHED",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

export type OrderStatus = BackendOrderStatus;

export function getStatusConfig(status: BackendOrderStatus) {
  return getOrderStatusMeta(status);
}

export { ORDER_STATUS_META };
