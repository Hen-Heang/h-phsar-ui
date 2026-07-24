"use client";

import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ORDER_STATUS_META } from "@/config/order-status";
import { get_all_orders } from "../../../redux/services/supplier/allOrders.service";

const ITEMS_PER_PAGE = 10;

const formatMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
};

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    get_all_orders()
      .then((res) => {
        if (res?.data?.data) setOrders(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const pageCount = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const currentItems = orders.slice(
    itemOffset,
    itemOffset + ITEMS_PER_PAGE,
  );

  if (loading) return <LoadingState />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No orders found"
        description="Supplier orders will appear here when buyers place them."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="min-w-[760px] w-full text-left text-sm">
          <caption className="sr-only">All Supplier orders</caption>
          <thead className="border-b border-border bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-4">Number</th>
              <th scope="col" className="px-5 py-4">Order ID</th>
              <th scope="col" className="px-5 py-4">Buyer</th>
              <th scope="col" className="px-5 py-4">Store</th>
              <th scope="col" className="px-5 py-4 text-right">Total</th>
              <th scope="col" className="px-5 py-4">Status</th>
              <th scope="col" className="px-5 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentItems.map((order, index) => (
              <tr key={order.id} className="hover:bg-muted/60">
                <td className="px-5 py-4 text-xs font-semibold text-muted-foreground">
                  {itemOffset + index + 1}
                </td>
                <td className="px-5 py-4 font-bold text-supplier">
                  #{String(order.id).slice(-8).toUpperCase()}
                </td>
                <td className="max-w-48 truncate px-5 py-4 font-medium text-foreground">
                  {order.name || "—"}
                </td>
                <td className="max-w-48 truncate px-5 py-4 text-muted-foreground">
                  {order.storeName || "—"}
                </td>
                <td className="px-5 py-4 text-right font-bold text-foreground">
                  ${formatMoney(order.total)}
                </td>
                <td className="px-5 py-4">
                  {ORDER_STATUS_META[order.status] ? (
                    <StatusBadge status={order.status} />
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">
                      Unknown status
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                  {order.date
                    ? new Date(order.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex justify-end">
          <ReactPaginate
            pageCount={pageCount}
            onPageChange={(event) =>
              setItemOffset(event.selected * ITEMS_PER_PAGE)
            }
            previousLabel={<ChevronLeft className="h-4 w-4" />}
            nextLabel={<ChevronRight className="h-4 w-4" />}
            className="flex items-center gap-1"
            pageClassName="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
            activeClassName="!bg-brand-primary !text-white"
            previousClassName="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
            nextClassName="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
            disabledClassName="cursor-not-allowed opacity-30"
            breakLabel="…"
          />
        </div>
      )}
    </div>
  );
}
