"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
  Loader2,
  RefreshCcw
} from "lucide-react";

import {
  delete_product_distributor,
  get_all_product_distributor,
  publish_product_distributor,
  unPublish_product_distributor,
} from "../../redux/services/distributor/product.server";
import DistributorProductCard from "../../components/Distributor/DistributorProductCard";
import SkeletonCard from "@/shared/components/skeletons/SkeletonCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";

const ProductDistributor = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // TanStack Query for data fetching
  const { data: productList = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['distributorProducts'],
    queryFn: async () => {
      const res = await get_all_product_distributor();
      return res?.data?.data || []; 
    }
  });

  useEffect(() => {
    document.title = "H-Phsar | Products";
  }, []);

  const filteredProducts = (
    Array.isArray(productList) ? productList : []
  ).filter(
    (product: any) =>
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await delete_product_distributor(productToDelete.id);
      if (res.status === 200 || res.status === 204) {
        toast.success("Product deleted successfully");
        queryClient.invalidateQueries({ queryKey: ['distributorProducts'] });
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePublish = async (product: any) => {
    try {
      const res = product.isPublish
        ? await unPublish_product_distributor(product.id)
        : await publish_product_distributor(product.id);
      if (res.status === 200) {
        queryClient.invalidateQueries({ queryKey: ['distributorProducts'] });
        toast.info(
          product.isPublish ? "Product unpublished" : "Product published",
        );
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-slate-500 font-medium">
            Manage and monitor your distributor inventory.
          </p>
        </div>
        <Button
          onClick={() => router.push("/distributor/add-product")}
          className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 gap-2 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </Button>
      </div>

      {/* Toolbar Section */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or category..."
            className="w-full h-14 pl-12 pr-6 rounded-2xl border-none bg-slate-50 focus:ring-2 focus:ring-blue-600 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-white shadow-md text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-white shadow-md text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <Button
            variant="outline"
            className="h-14 px-6 rounded-2xl border-slate-100 bg-slate-50 gap-2 text-slate-600 font-bold hover:bg-slate-100"
            onClick={() => refetch()}
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        ) : filteredProducts.length > 0 ? (
          viewMode === "grid" ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product: any, index: number) => (
                <DistributorProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onEdit={(p: any) =>
                    router.push(`/distributor/update-product?id=${p.id}`)
                  }
                  onDelete={() => {
                    setProductToDelete(product);
                    setShowDeleteConfirm(true);
                  }}
                  onToggleVisibility={() => togglePublish(product)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              layout
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Product Details</th>
                    <th className="px-6 py-6">Category</th>
                    <th className="px-6 py-6">Price</th>
                    <th className="px-6 py-6">Stock</th>
                    <th className="px-6 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map((product: any) => (
                    <tr
                      key={product.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                            <img
                              src={product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              SKU: {product.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold capitalize">
                          {product.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900">
                        ${product.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-sm font-bold ${product.qty < 10 ? "text-rose-500" : "text-slate-700"}`}
                          >
                            {product.qty} units
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${product.qty < 10 ? "bg-rose-500" : "bg-blue-500"}`}
                              style={{
                                width: `${Math.min(product.qty, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            product.isPublish
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${product.isPublish ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                          />
                          {product.isPublish ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/distributor/update-product?id=${product.id}`,
                              )
                            }
                            className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No products found
            </h3>
            <p className="text-slate-500 mb-8">
              Start by adding your first product to the catalog.
            </p>
            <Button
              onClick={() => router.push("/distributor/add-product")}
              className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold"
            >
              Add Product
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md p-8 rounded-[2.5rem] border-none shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 mb-2">
              Delete Product?
            </DialogTitle>
            <p className="text-slate-500 mb-8">
              This action cannot be undone. This product will be permanently
              removed from your catalog.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-slate-200"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-14 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDistributor;
