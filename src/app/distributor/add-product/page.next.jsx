"use client";

import dynamic from "next/dynamic";

const AddProductDistributorPage = dynamic(
  () => import("@/pages/distributor/AddProductDistributor"),
  { ssr: false }
);

export default function DistributorAddProductPage() {
  return <AddProductDistributorPage />;
}
