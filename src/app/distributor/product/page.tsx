"use client";

import dynamic from "next/dynamic";

const ProductDistributorPage = dynamic(
  () => import("@/pages/distributor/ProductDistributor"),
  { ssr: false },
);

export default function DistributorProductPage() {
  return <ProductDistributorPage />;
}
