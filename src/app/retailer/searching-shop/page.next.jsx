"use client";

import dynamic from "next/dynamic";

const SearchingRetailer = dynamic(
  () => import("@/components/retailler/SearchingRetailer"),
  { ssr: false }
);

export default function RetailerSearchingPage() {
  return <SearchingRetailer />;
}
