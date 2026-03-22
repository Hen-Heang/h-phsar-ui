"use client";

import dynamic from "next/dynamic";

const DistributorStoreRetailer = dynamic(
  () => import("@/pages/retailer/DistributorStoreRetailer"),
  { ssr: false }
);

export default function RetailerDistributorShopPage() {
  return <DistributorStoreRetailer />;
}
