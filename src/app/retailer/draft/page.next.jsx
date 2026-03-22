"use client";

import dynamic from "next/dynamic";

const DraftHistory = dynamic(
  () => import("@/components/retailler/DraftHistory"),
  { ssr: false }
);

export default function RetailerDraftPage() {
  return <DraftHistory />;
}
