import { describe, it, expect } from "vitest";
import { ROLES, roleIdToRole } from "./roles";

describe("roleIdToRole", () => {
  it("maps roleId 1 to SUPPLIER", () => {
    expect(roleIdToRole(1)).toBe(ROLES.SUPPLIER);
  });

  it("maps roleId 2 to BUYER", () => {
    expect(roleIdToRole(2)).toBe(ROLES.BUYER);
  });

  it("throws for any roleId the backend doesn't support (e.g. 3/ADMIN)", () => {
    // Verified against h-phsar-api-full: AppUser.getAuthorities() only
    // branches on 1 and 2 — no roleId maps to ADMIN yet.
    expect(() => roleIdToRole(3)).toThrow();
    expect(() => roleIdToRole(0)).toThrow();
    expect(() => roleIdToRole(NaN)).toThrow();
  });
});
