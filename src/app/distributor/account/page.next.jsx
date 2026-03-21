"use client";

import dynamic from "next/dynamic";

const AccountPage = dynamic(() => import("@/pages/distributor/Account"), {
  ssr: false,
});

export default function DistributorAccountPage() {
  return <AccountPage />;
}
