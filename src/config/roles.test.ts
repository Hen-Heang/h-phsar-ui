import { describe, it, expect } from "vitest";
import { ROLES, roleIdToRole } from "./roles";

describe("roleIdToRole", () => {
  it("maps roleId 1 to SUPPLIER", () => {
    expect(roleIdToRole(1)).toBe(ROLES.SUPPLIER);
  });

  it("maps roleId 2 to BUYER", () => {
    expect(roleIdToRole(2)).toBe(ROLES.BUYER);
  });

  it("maps roleId 3 to ADMIN", () => {
    expect(roleIdToRole(3)).toBe(ROLES.ADMIN);
  });

  it("throws for any roleId the backend doesn't support", () => {
    expect(() => roleIdToRole(0)).toThrow();
    expect(() => roleIdToRole(NaN)).toThrow();
  });
});
