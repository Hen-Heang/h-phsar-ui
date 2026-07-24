"use client";

import React from "react";
import ReactPaginate from "react-paginate";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface DataTablePaginationProps {
  pageCount: number;
  onPageChange: (selectedItem: { selected: number }) => void;
  theme?: "blue" | "orange";
  className?: string;
  /** Zero-indexed current page, for callers that reset pageNumber externally (e.g. on search change). */
  forcePage?: number;
}

/**
 * A standardized pagination component for use across both Distributor and Retailer views.
 * Supports different styles (Blue for Distributor, Orange for Retailer).
 */
const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  pageCount,
  onPageChange,
  theme = "blue",
  className = "",
  forcePage,
}) => {
  if (pageCount <= 1) return null;

  const isBlue = theme === "blue";
  const activeClass = isBlue
    ? "!bg-blue-600 !text-white shadow-lg shadow-blue-600/20"
    : "!bg-orange-500 !text-white shadow-lg shadow-orange-500/20";

  const hoverClass = isBlue ? "hover:text-blue-500" : "hover:text-orange-500";

  return (
    <div className={cn("mt-12 flex justify-center", className)}>
      <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
        <ReactPaginate
          pageCount={pageCount}
          onPageChange={onPageChange}
          forcePage={forcePage}
          previousLabel={
            isBlue ? (
              <Plus className="h-4 w-4 rotate-90" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )
          }
          nextLabel={
            isBlue ? (
              <Plus className="h-4 w-4 -rotate-90" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )
          }
          className="flex items-center gap-2"
          pageClassName="h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all hover:bg-slate-50 text-slate-400"
          pageLinkClassName="h-full w-full flex items-center justify-center rounded-xl"
          activeClassName={activeClass}
          previousClassName={cn(
            "h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all",
            hoverClass,
          )}
          nextClassName={cn(
            "h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all",
            hoverClass,
          )}
          disabledClassName="opacity-30 cursor-not-allowed"
          breakLabel="..."
          breakClassName="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 font-bold"
        />
      </div>
    </div>
  );
};

export default DataTablePagination;
