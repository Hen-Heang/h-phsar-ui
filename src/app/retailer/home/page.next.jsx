"use client";

import dynamic from "next/dynamic";

const HomeComponent = dynamic(
  () => import("@/pages/retailer/homepage/HomeComponent"),
  { ssr: false }
);

export default function RetailerHomePage() {
  return <HomeComponent />;
}
