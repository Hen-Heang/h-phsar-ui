"use client";

import dynamic from "next/dynamic";

const OrderPage = dynamic(() => import("@/components/retailler/OrderPage"), {
  ssr: false,
});

export default function RetailerOrderPage() {
  return <OrderPage />;
}
