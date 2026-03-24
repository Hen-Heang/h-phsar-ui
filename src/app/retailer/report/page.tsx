"use client";

import dynamic from "next/dynamic";

const ReportPageRetailer = dynamic(
  () => import("@/pages/retailer/ReportPageRetailer"),
  { ssr: false },
);

export default function RetailerReportPage() {
  return <ReportPageRetailer />;
}
