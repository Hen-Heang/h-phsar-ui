"use client";

import dynamic from "next/dynamic";

const FavoriteProduct = dynamic(
  () => import("@/pages/retailer/FavoriteProduct"),
  { ssr: false }
);

export default function RetailerFavoritePage() {
  return <FavoriteProduct />;
}
