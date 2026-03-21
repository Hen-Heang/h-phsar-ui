"use client";

import dynamic from "next/dynamic";

const UpdateProductDistributorPage = dynamic(
  () => import("@/pages/distributor/UpdateProductDistributor"),
  { ssr: false }
);

export default function DistributorUpdateProductPage() {
  return <UpdateProductDistributorPage />;
}
