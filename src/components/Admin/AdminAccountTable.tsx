"use client";

import React, { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { toast } from "react-toastify";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import DataTablePagination from "@/shared/components/DataTablePagination";
import type { AdminUserSummary } from "@/types/admin";
import type { AdminUserListApiResponse, AdminUserApiResponse, ListParams } from "@/lib/admin/adminAccount.service";

const PAGE_SIZE = 10;

interface AdminAccountTableProps {
  title: string;
  searchPlaceholder: string;
  emptyLabel: string;
  fetchList: (params: ListParams) => Promise<AdminUserListApiResponse>;
  updateStatus: (id: number, isActive: boolean) => Promise<AdminUserApiResponse>;
}

export default function AdminAccountTable({
  title,
  searchPlaceholder,
  emptyLabel,
  fetchList,
  updateStatus,
}: AdminAccountTableProps) {
  const [rows, setRows] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchList({ search: search || undefined, pageNumber, pageSize: PAGE_SIZE }).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setRows(res.data.data);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error("Failed to load list.");
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchList, search, pageNumber]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageNumber(1);
  };

  const handleToggleActive = async (row: AdminUserSummary) => {
    setUpdatingId(row.id);
    try {
      const res = await updateStatus(row.id, !row.isActive);
      if (res.ok) {
        setRows((prev) => prev.map((r) => (r.id === row.id ? res.data.data : r)));
        toast.success(row.isActive ? "Account deactivated" : "Account activated");
      } else {
        toast.error("Failed to update status.");
      }
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{title}</h1>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full h-14 pl-12 pr-6 rounded-2xl border-none bg-slate-50 focus:ring-2 focus:ring-blue-600 transition-all font-medium"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <EmptyState icon={Users} title={emptyLabel} description="Try a different search term." />
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Account</th>
                <th className="px-6 py-6">Phone</th>
                <th className="px-6 py-6">Verified</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((row) => (
                <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 line-clamp-1">{row.fullName || "(no name)"}</p>
                    <p className="text-xs text-slate-400">{row.email}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">{row.phone || "-"}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        row.isVerified ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {row.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        row.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${row.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {row.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => handleToggleActive(row)}
                      disabled={updatingId === row.id}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                        row.isActive
                          ? "text-rose-600 hover:bg-rose-50"
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {updatingId === row.id ? "..." : row.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DataTablePagination
        pageCount={totalPages}
        forcePage={pageNumber - 1}
        onPageChange={({ selected }) => setPageNumber(selected + 1)}
      />
    </div>
  );
}
