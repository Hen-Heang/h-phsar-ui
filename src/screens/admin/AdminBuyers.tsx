"use client";

import AdminAccountTable from "@/components/Admin/AdminAccountTable";
import { listBuyers, updateBuyerActiveStatus } from "@/lib/admin/adminAccount.service";

export default function AdminBuyers() {
  return (
    <AdminAccountTable
      title="Buyers"
      searchPlaceholder="Search by name or email..."
      emptyLabel="No buyers found"
      fetchList={listBuyers}
      updateStatus={updateBuyerActiveStatus}
    />
  );
}
