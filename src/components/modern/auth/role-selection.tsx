"use client";

import React from "react";
import { Loader2, Store, Truck } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "@/lib/cn";

interface RoleSelectionProps {
  selectedRole: number | null;
  onSelect: (roleId: number) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ROLES = [
  {
    id: 1,
    label: "Supplier",
    description: "Manage products, inventory, and fulfill buyer orders.",
    icon: Truck,
  },
  {
    id: 2,
    label: "Buyer",
    description: "Browse suppliers and place orders for your store.",
    icon: Store,
  },
] as const;

export function RoleSelection({
  selectedRole,
  onSelect,
  onConfirm,
  isLoading,
}: RoleSelectionProps) {
  return (
    <div className="space-y-4">
      {ROLES.map(({ id, label, description, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={cn(
            "w-full flex items-start gap-4 rounded-lg border p-4 text-left transition-all",
            selectedRole === id
              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
          )}
        >
          <div
            className={cn(
              "mt-0.5 rounded-md p-2",
              selectedRole === id
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-500",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{label}</p>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </button>
      ))}

      <Button
        onClick={onConfirm}
        className="w-full mt-2"
        disabled={selectedRole === null || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Confirm & Continue"
        )}
      </Button>
    </div>
  );
}
