"use client";

import dynamic from "next/dynamic";

const CategoryBeverages = dynamic(
  () => import("@/pages/retailer/CategoryBeverages"),
  { ssr: false }
);

export default function RetailerBeveragePage() {
  return <CategoryBeverages />;
}
