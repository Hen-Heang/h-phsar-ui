import { describe, it, expect } from "vitest";
import { ROLES } from "@/config/roles";
import {
  canPlaceOrder,
  canManageInventory,
  canAcceptOrRejectOrder,
  canDispatchOrder,
  canConfirmReceipt,
  canCancelOrder,
  canManagePlatformUsers,
} from "./index";

describe("permission helpers", () => {
  it("only the buyer can place, confirm receipt for, or cancel an order", () => {
    expect(canPlaceOrder(ROLES.BUYER)).toBe(true);
    expect(canPlaceOrder(ROLES.SUPPLIER)).toBe(false);
    expect(canConfirmReceipt(ROLES.BUYER)).toBe(true);
    expect(canConfirmReceipt(ROLES.SUPPLIER)).toBe(false);
    expect(canCancelOrder(ROLES.BUYER)).toBe(true);
    expect(canCancelOrder(ROLES.SUPPLIER)).toBe(false);
  });

  it("only the supplier can manage inventory, accept/reject, or dispatch", () => {
    expect(canManageInventory(ROLES.SUPPLIER)).toBe(true);
    expect(canManageInventory(ROLES.BUYER)).toBe(false);
    expect(canAcceptOrRejectOrder(ROLES.SUPPLIER)).toBe(true);
    expect(canAcceptOrRejectOrder(ROLES.BUYER)).toBe(false);
    expect(canDispatchOrder(ROLES.SUPPLIER)).toBe(true);
    expect(canDispatchOrder(ROLES.BUYER)).toBe(false);
  });

  it("no role can manage platform users — no backend admin capability exists", () => {
    expect(canManagePlatformUsers(ROLES.SUPPLIER)).toBe(false);
    expect(canManagePlatformUsers(ROLES.BUYER)).toBe(false);
    expect(canManagePlatformUsers(ROLES.ADMIN)).toBe(false);
  });
});
