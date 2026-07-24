import { ROLES, type Role } from "./roles";

export const ROLE_HOME_ROUTE: Record<Role, string> = {
  [ROLES.SUPPLIER]: "/supplier/dashboard",
  [ROLES.BUYER]: "/buyer/home",
  [ROLES.ADMIN]: "/admin/dashboard",
};
