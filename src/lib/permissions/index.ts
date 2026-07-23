import { ROLES, type Role } from "@/config/roles";

// Backend enforces all of this server-side (SecurityConfig hasAuthority
// matchers) — these are UX gates only, never a security boundary.

export function canPlaceOrder(role: Role): boolean {
  return role === ROLES.BUYER;
}

export function canManageInventory(role: Role): boolean {
  return role === ROLES.SUPPLIER;
}

export function canAcceptOrRejectOrder(role: Role): boolean {
  return role === ROLES.SUPPLIER;
}

export function canDispatchOrder(role: Role): boolean {
  return role === ROLES.SUPPLIER;
}

export function canConfirmReceipt(role: Role): boolean {
  return role === ROLES.BUYER;
}

export function canCancelOrder(role: Role): boolean {
  return role === ROLES.BUYER;
}

// No backend capability exists yet (see the migration audit's Admin
// findings) — always false until the backend adds admin support.
export function canManagePlatformUsers(role: Role): boolean {
  return false;
}
