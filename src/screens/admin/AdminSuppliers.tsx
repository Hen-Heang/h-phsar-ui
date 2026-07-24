"use client";

import AdminAccountTable from "@/components/Admin/AdminAccountTable";
import { listSuppliers, updateSupplierActiveStatus } from "@/lib/admin/adminAccount.service";

export default function AdminSuppliers() {
  return (
    <AdminAccountTable
      title="Suppliers"
      searchPlaceholder="Search by name or email..."
      emptyLabel="No suppliers found"
      fetchList={listSuppliers}
      updateStatus={updateSupplierActiveStatus}
    />
  );
}
