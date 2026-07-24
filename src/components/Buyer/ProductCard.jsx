import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Package, AlertCircle, ShoppingCart } from "lucide-react";
import { getSafeImageSrc, applyImageFallback } from "@/lib/images";
import noImage from "../../assets/images/no_image.jpg";

export default function ProductCard({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onInputChange,
  isLoadingIncrement,
  isLoadingDecrement,
  isLoadingInput,
  disabled,
}) {
  const isOutOfStock = product.qty === 0;
  const isUnpublished = product.isPublish === false;
  const isUnavailable = isOutOfStock || isUnpublished;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10   ${
        isUnavailable ? "opacity-75 grayscale-[0.5]" : ""
      }`}
    >
      {/* Badge for Status */}
      {isUnavailable && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-red-500/20">
          {isOutOfStock ? "Out of Stock" : "Unavailable"}
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-6 ">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          src={getSafeImageSrc(product.image, noImage)}
          onError={(e) => applyImageFallback(e, noImage)}
          alt={product.name}
          className="h-full w-full object-contain mix-blend-multiply transition-transform "
        />

        {/* Quick Add Overlay (Mobile/Hover) */}
        {!isUnavailable && quantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition-all group-hover:bg-slate-900/5 group-hover:opacity-100">
            <button
              onClick={() => onIncrement(product.id)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl transition hover:bg-orange-600 active:scale-90"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="line-clamp-1 text-base font-bold text-slate-900 ">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-black text-orange-500">
              ${product.price}
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              / pack
            </span>
          </div>
        </div>

        {/* Stock Info */}
        <div className="mt-4 flex items-center gap-2">
          {isOutOfStock ? (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider">
              <AlertCircle className="h-3 w-3" />
              Stock Exhausted
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Package className="h-3 w-3" />
              {product.qty} Units Available
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5">
          {quantity > 0 ? (
            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-1  ">
              <button
                disabled={disabled || isLoadingDecrement}
                onClick={() => onDecrement(product.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition hover:text-orange-500 disabled:opacity-50 "
              >
                {isLoadingDecrement ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"
                  />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) =>
                    !isUnavailable && onInputChange(product.id, e)
                  }
                  className="w-full bg-transparent text-center text-sm font-black text-slate-900 outline-none "
                />
                {isLoadingInput && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] ">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full"
                    />
                  </div>
                )}
              </div>

              <button
                disabled={disabled || isLoadingIncrement}
                onClick={() => onIncrement(product.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition hover:text-orange-500 disabled:opacity-50 "
              >
                {isLoadingIncrement ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full"
                  />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : (
            <Button
              disabled={isUnavailable || disabled || isLoadingIncrement}
              onClick={() => onIncrement(product.id)}
              className={`h-12 w-full rounded-2xl font-bold transition-all active:scale-[0.98] ${
                isUnavailable
                  ? "bg-slate-200 text-slate-400  "
                  : "bg-slate-900 text-white hover:bg-orange-500  "
              }`}
            >
              {isLoadingIncrement ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Button({ children, className, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
