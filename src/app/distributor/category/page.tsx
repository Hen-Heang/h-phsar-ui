"use client";

import dynamic from "next/dynamic";

const CategoryDistributor = dynamic(
  () => import("@/pages/distributor/CategoryDistributor"),
  { ssr: false },
);

export default function DistributorCategoryPage() {
  return <CategoryDistributor />;
}
