"use client";

import { motion } from "framer-motion";
import { Calendar, Eye, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { isSupplierActionAllowed } from "@/config/order-status";
import SafeImage from "@/shared/components/SafeImage";
import photoDefault from "../../../assets/images/supplier/photo.png";

const formatMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
};

export default function OrderCard({
  item,
  status,
  onViewDetails,
  onAction,
  actionType,
  actionLabel,
  actionIcon: ActionIcon,
  actionVariant = "default",
  onReject,
  isLoading = false,
  index = 0,
}) {
  const actionAllowed =
    onAction &&
    actionLabel &&
    (!actionType || isSupplierActionAllowed(status, actionType));
  const rejectAllowed =
    onReject && isSupplierActionAllowed(status, "REJECT");

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface p-6 transition-all hover:border-teal-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
            <SafeImage
              src={
                item.retailerImage && item.retailerImage !== "String"
                  ? item.retailerImage
                  : photoDefault.src || photoDefault
              }
              fallback={photoDefault}
              className="h-full w-full object-cover"
              alt={`${item.name || "Buyer"} profile`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-foreground">
              {item.name || "Buyer"}
            </h3>
            <p className="truncate text-xs font-semibold text-muted-foreground">
              Order #{String(item.id).slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-3 text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-supplier" aria-hidden="true" />
          <p className="line-clamp-2 text-sm font-medium leading-relaxed">
            {item.address || "Address unavailable"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0 text-supplier" aria-hidden="true" />
          <p className="text-sm font-medium">
            {item.date
              ? new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Date unavailable"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between gap-3 border-t border-border pt-6">
        <div className="min-w-0">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Total amount
          </span>
          <p className="text-lg font-bold text-foreground">${formatMoney(item.total)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(item.id, item)}
            aria-label={`View order ${item.id} details`}
          >
            <Eye className="h-5 w-5" aria-hidden="true" />
          </Button>

          {rejectAllowed && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onReject(item.id, item)}
              disabled={isLoading}
              aria-label={`Reject order ${item.id}`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Reject
            </Button>
          )}

          {actionAllowed && (
            <Button
              size="sm"
              variant={actionVariant}
              onClick={() => onAction(item.id, item)}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                ActionIcon && <ActionIcon className="h-4 w-4" aria-hidden="true" />
              )}
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
