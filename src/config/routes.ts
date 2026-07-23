import { ROLES, type Role } from "./roles";

// ADMIN has no route yet since no account can hold that role today.
export const ROLE_HOME_ROUTE: Record<Role, string> = {
  [ROLES.SUPPLIER]: "/supplier/dashboard",
  [ROLES.BUYER]: "/buyer/home",
  [ROLES.ADMIN]: "/sign-in",
};
