import { ROLES, type Role } from "./roles";

export interface NavItem {
  label: string;
  href: string;
}

// Central source of truth for role navigation — keep in sync with the actual
// route folders under src/app/supplier/** and src/app/buyer/**.
export const SUPPLIER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/supplier/dashboard" },
  { label: "Store", href: "/supplier/store" },
  { label: "Categories", href: "/supplier/categories" },
  { label: "Products", href: "/supplier/products" },
  { label: "Inventory", href: "/supplier/inventory" },
  { label: "Orders", href: "/supplier/orders" },
  { label: "Order History", href: "/supplier/order-history" },
  { label: "Reports", href: "/supplier/reports" },
  { label: "Profile", href: "/supplier/profile" },
];

export const BUYER_NAV: NavItem[] = [
  { label: "Home", href: "/buyer/home" },
  { label: "Stores", href: "/buyer/search" },
  { label: "Orders", href: "/buyer/orders" },
  { label: "Order History", href: "/buyer/order-history" },
  { label: "Drafts", href: "/buyer/drafts" },
  { label: "Bookmarks", href: "/buyer/bookmarks" },
  { label: "Reports", href: "/buyer/reports" },
  { label: "Profile", href: "/buyer/profile" },
];

// Suppliers/Buyers are wired to real pages + backend endpoints (AdminAccountController
// in h-phsar-api-full). Dashboard/Users/Stores/Orders/Reports/Audit Logs/Settings are
// still placeholders — see AdminDashboard.tsx's "future scope" list.
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Suppliers", href: "/admin/suppliers" },
  { label: "Buyers", href: "/admin/buyers" },
  { label: "Stores", href: "/admin/stores" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Audit Logs", href: "/admin/audit-logs" },
  { label: "Settings", href: "/admin/settings" },
];

export function getNavForRole(role: Role): NavItem[] {
  switch (role) {
    case ROLES.SUPPLIER:
      return SUPPLIER_NAV;
    case ROLES.BUYER:
      return BUYER_NAV;
    case ROLES.ADMIN:
      return ADMIN_NAV;
  }
}
