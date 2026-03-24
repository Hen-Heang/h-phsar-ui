"use client";

import dynamic from "next/dynamic";

const HomeDistributorPage = dynamic(
  () => import("@/pages/distributor/HomeDistributor"),
  { ssr: false },
);

export default function DistributorHomePage() {
  return <HomeDistributorPage />;
}
