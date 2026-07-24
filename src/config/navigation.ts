import { ROLES, type Role } from "./roles";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  FolderTree,
  Gauge,
  Heart,
  History,
  House,
  Package,
  Search,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
}

// Central source of truth for role navigation — keep in sync with the actual
// route folders under src/app/supplier/** and src/app/buyer/**.
export const SUPPLIER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/supplier/dashboard", icon: Gauge },
  { label: "Store", href: "/supplier/store", icon: Store },
  { label: "Categories", href: "/supplier/categories", icon: FolderTree },
  { label: "Products", href: "/supplier/products", icon: Package },
  { label: "Inventory", href: "/supplier/inventory", icon: Boxes },
  { label: "Orders", href: "/supplier/orders", icon: ShoppingBag },
  { label: "Order History", href: "/supplier/order-history", icon: History },
  { label: "Reports", href: "/supplier/reports", icon: BarChart3 },
  { label: "Profile", href: "/supplier/profile", icon: UserRound },
];

export const BUYER_NAV: NavItem[] = [
  { label: "Home", href: "/buyer/home", icon: House },
  { label: "Stores", href: "/buyer/search", icon: Search },
  { label: "Orders", href: "/buyer/orders", icon: Truck },
  { label: "Order History", href: "/buyer/order-history", icon: History },
  { label: "Drafts", href: "/buyer/drafts", icon: ClipboardList },
  { label: "Bookmarks", href: "/buyer/bookmarks", icon: Heart },
  { label: "Reports", href: "/buyer/reports", icon: BarChart3 },
  { label: "Profile", href: "/buyer/profile", icon: UserRound },
];

// Suppliers/Buyers are wired to real pages + backend endpoints (AdminAccountController
// in h-phsar-api-full). Dashboard/Users/Stores/Orders/Reports/Audit Logs/Settings are
// still placeholders — see AdminDashboard.tsx's "future scope" list.
export const ADMIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: Gauge,
    description: "Account-management overview",
  },
  {
    label: "Suppliers",
    href: "/admin/suppliers",
    icon: Store,
    description: "Review and manage supplier accounts",
  },
  {
    label: "Buyers",
    href: "/admin/buyers",
    icon: UsersRound,
    description: "Review and manage buyer accounts",
  },
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
