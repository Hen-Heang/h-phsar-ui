import { describe, expect, it } from "vitest";
import { ADMIN_NAV, BUYER_NAV, SUPPLIER_NAV, getNavForRole } from "./navigation";
import { ROLES } from "./roles";

describe("role navigation", () => {
  it("returns the centralized navigation for each role", () => {
    expect(getNavForRole(ROLES.BUYER)).toBe(BUYER_NAV);
    expect(getNavForRole(ROLES.SUPPLIER)).toBe(SUPPLIER_NAV);
    expect(getNavForRole(ROLES.ADMIN)).toBe(ADMIN_NAV);
  });

  it("exposes only implemented Admin routes", () => {
    expect(ADMIN_NAV.map((item) => item.href)).toEqual([
      "/admin/dashboard",
      "/admin/suppliers",
      "/admin/buyers",
    ]);
  });
});
