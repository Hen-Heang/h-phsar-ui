"use client";
import dynamic from "next/dynamic";
const ReportDistributor = dynamic(
  () => import("@/pages/distributor/ReportDistributor"),
  { ssr: false },
);
export default function DistributorReportPage() {
  return <ReportDistributor />;
}
