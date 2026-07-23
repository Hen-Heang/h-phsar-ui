// Verified directly against the backend (h-phsar-api-full):
// model/order/OrderStatus.java and docs/ORDER_WORKFLOW.md. This is the full,
// current set — there is no DELIVERED, CONFIRMED, or SHIPPING status; those
// were a pre-migration seed the backend has since corrected.
export type OrderStatus =
  | "CART"
  | "DRAFT"
  | "PENDING"
  | "PROCESSING"
  | "DISPATCHED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return status === "COMPLETED" || status === "REJECTED" || status === "CANCELLED";
}
