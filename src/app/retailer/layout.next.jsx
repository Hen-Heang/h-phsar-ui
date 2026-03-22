"use client";

import dynamic from "next/dynamic";

const RetailerShell = dynamic(
  () => import("@/components/retailler/RetailerShell"),
  { ssr: false }
);

export default function RetailerLayout({ children }) {
  return <RetailerShell>{children}</RetailerShell>;
}
