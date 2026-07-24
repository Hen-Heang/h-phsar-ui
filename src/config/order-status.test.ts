import { describe, expect, it } from "vitest";
import {
  ORDER_STATUS_META,
  isBuyerActionAllowed,
  isSupplierActionAllowed,
} from "./order-status";

describe("order status metadata", () => {
  it("covers every backend status", () => {
    expect(Object.keys(ORDER_STATUS_META)).toEqual([
      "CART",
      "DRAFT",
      "PENDING",
      "PROCESSING",
      "DISPATCHED",
      "COMPLETED",
      "REJECTED",
      "CANCELLED",
    ]);
  });

  it("allows only backend-supported role actions", () => {
    expect(isSupplierActionAllowed("PENDING", "ACCEPT")).toBe(true);
    expect(isSupplierActionAllowed("PROCESSING", "DISPATCH")).toBe(true);
    expect(isSupplierActionAllowed("DISPATCHED", "DISPATCH")).toBe(false);
    expect(isBuyerActionAllowed("PENDING", "CANCEL_REQUEST")).toBe(true);
    expect(isBuyerActionAllowed("DISPATCHED", "CONFIRM_RECEIPT")).toBe(true);
    expect(isBuyerActionAllowed("PROCESSING", "CONFIRM_RECEIPT")).toBe(false);
  });
});
