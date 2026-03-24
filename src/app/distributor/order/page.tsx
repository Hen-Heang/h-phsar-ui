"use client";
import dynamic from "next/dynamic";
const Order = dynamic(
  () => import("@/components/Distributor/OrderPage/Order"),
  { ssr: false },
);
export default function DistributorOrderPage() {
  return <Order />;
}
