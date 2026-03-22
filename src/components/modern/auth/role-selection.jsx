import React from "react";
import { Package, ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { cn } from "@/lib/cn";

export function RoleSelection({ selectedRole, onSelect, onConfirm, isLoading }) {
  const roles = [
    {
      id: 1,
      title: "Distributor",
      description: "Manage products, track orders, and grow your business network.",
      icon: Package,
      color: "blue",
    },
    {
      id: 2,
      title: "Retailer",
      description: "Browse products, place orders, and manage your store inventory.",
      icon: ShoppingCart,
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <Card
              key={role.id}
              className={cn(
                "relative flex cursor-pointer items-start gap-4 p-4 transition-all hover:border-blue-500",
                isSelected ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" : "border-slate-200"
              )}
              onClick={() => onSelect(role.id)}
            >
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                role.id === 1 ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900">{role.title}</h3>
                <p className="text-sm text-slate-500 leading-snug">{role.description}</p>
              </div>
              {isSelected && (
                <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Button
        onClick={onConfirm}
        className="w-full"
        disabled={isLoading || !selectedRole}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
}
