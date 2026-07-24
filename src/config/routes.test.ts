import { describe, it, expect } from "vitest";
import { ROLES } from "./roles";
import { ROLE_HOME_ROUTE } from "./routes";

describe("ROLE_HOME_ROUTE", () => {
  it("has a route for every role", () => {
    expect(Object.keys(ROLE_HOME_ROUTE).sort()).toEqual(
      Object.values(ROLES).sort(),
    );
  });

  it("points supplier/buyer at real (non-legacy) routes", () => {
    expect(ROLE_HOME_ROUTE[ROLES.SUPPLIER]).toBe("/supplier/dashboard");
    expect(ROLE_HOME_ROUTE[ROLES.BUYER]).toBe("/buyer/home");
  });

  it("sends ADMIN to the admin dashboard", () => {
    expect(ROLE_HOME_ROUTE[ROLES.ADMIN]).toBe("/admin/dashboard");
  });
});
