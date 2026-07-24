"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();
  const [rows, setRows] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchList({ search: search || undefined, pageNumber, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setRows(res.data.data);
          setTotalPages(res.data.totalPages);
        } else {
          toast.error("Failed to load list.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setTotalPages(0);
          toast.error("Failed to load list.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
    <motion.section
      aria-labelledby="admin-account-title"
      className="space-y-6 pb-20 md:space-y-8"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
    >
      <div>
        <h1
          id="admin-account-title"
          className="mb-2 text-3xl font-black tracking-tight text-foreground"
        >
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Search accounts and manage their access to H-Phsar.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm">
        <div className="group relative max-w-md">
          <Search
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-admin"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label={`Search ${title.toLowerCase()}`}
            placeholder={searchPlaceholder}
            className="h-14 w-full rounded-2xl border border-transparent bg-muted pl-12 pr-6 font-medium text-foreground transition-all placeholder:text-muted-foreground focus:border-admin focus:outline-none focus:ring-2 focus:ring-admin/20"
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
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-border bg-muted/60 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-8 py-6">Account</th>
                <th className="px-6 py-6">Phone</th>
                <th className="px-6 py-6">Verified</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="group transition-colors hover:bg-muted/50">
                  <td className="px-8 py-5">
                    <p className="line-clamp-1 font-bold text-foreground">{row.fullName || "(no name)"}</p>
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-muted-foreground">{row.phone || "-"}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        row.isVerified ? "bg-slate-100 text-admin" : "bg-slate-100 text-slate-500"
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
                      type="button"
                      onClick={() => handleToggleActive(row)}
                      disabled={updatingId === row.id}
                      aria-label={`${row.isActive ? "Deactivate" : "Activate"} ${row.fullName || row.email}`}
                      className={`min-h-11 rounded-xl px-4 py-2 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-admin disabled:cursor-not-allowed disabled:opacity-50 ${
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
        </div>
      )}

      <DataTablePagination
        pageCount={totalPages}
        forcePage={pageNumber - 1}
        onPageChange={({ selected }) => setPageNumber(selected + 1)}
        theme="admin"
      />
    </motion.section>
  );
}
