"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Tag,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import noImage from "../../assets/images/no_image.jpg";

const DistributorProductCard = ({
  product,
  onEdit,
  onDelete,
  onToggleVisibility,
  index,
}) => {
  const isOutOfStock = product.qty === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5  "
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 ">
        <img
          src={getSafeImageSrc(product.image, noImage)}
          onError={(e) => applyImageFallback(e, noImage)}
          alt={product.name}
          className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 ${!product.isPublish ? "opacity-40 grayscale" : ""}`}
        />

        {/* Status Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {!product.isPublish && (
            <div className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
              <EyeOff className="h-3 w-3" />
              Hidden
            </div>
          )}
          {isOutOfStock && (
            <div className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-rose-500/20">
              <AlertCircle className="h-3 w-3" />
              Stock Out
            </div>
          )}
        </div>

        {/* Action Menu Trigger */}
        <div className="absolute right-4 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg backdrop-blur-md transition-all hover:bg-white hover:text-blue-600  ">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 overflow-hidden rounded-2xl p-1.5 shadow-2xl"
            >
              <DropdownMenuItem
                onClick={() => onEdit(product)}
                className="gap-3 rounded-xl py-2.5"
              >
                <Edit3 className="h-4 w-4 text-slate-400" />
                <span className="font-bold">Edit Product</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleVisibility(product.id, product)}
                className="gap-3 rounded-xl py-2.5"
              >
                {product.isPublish ? (
                  <>
                    <EyeOff className="h-4 w-4 text-slate-400" />
                    <span className="font-bold">Hide from Shop</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-blue-600">
                      Show in Shop
                    </span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 " />
              <DropdownMenuItem
                onClick={() => onDelete(product.id, product.image)}
                className="gap-3 rounded-xl py-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
                <span className="font-bold">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600  ">
              <Tag className="h-2.5 w-2.5" />
              {product.category?.name || "Uncategorized"}
            </span>
          </div>
          <h3 className="line-clamp-1 text-lg font-black text-slate-900 ">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500  leading-relaxed min-h-[2rem]">
            {product.description || "No description provided."}
          </p>
        </div>

        {/* Meta Info */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-5 ">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Inventory
            </span>
            <div
              className={`flex items-center gap-1.5 font-black ${isOutOfStock ? "text-rose-500" : "text-slate-900 "}`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>{product.qty} Units</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Price
            </span>
            <span className="text-lg font-black text-blue-600">
              ${parseFloat(product.price || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DistributorProductCard;
