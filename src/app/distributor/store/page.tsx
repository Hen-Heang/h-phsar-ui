"use client";

import dynamic from "next/dynamic";

const StorePage = dynamic(() => import("@/pages/distributor/StorePage"), {
  ssr: false,
});

export default function DistributorStorePage() {
  return <StorePage />;
}
