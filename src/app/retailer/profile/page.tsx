"use client";

import dynamic from "next/dynamic";

const AccountRetailer = dynamic(
  () => import("@/pages/retailer/AccountRetailer"),
  { ssr: false },
);

export default function RetailerProfilePage() {
  return <AccountRetailer />;
}
