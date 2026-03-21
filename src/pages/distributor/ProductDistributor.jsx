"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Package, 
  AlertCircle, 
  Trash2, 
  X, 
  Check, 
  Image as ImageIcon,
  DollarSign,
  Layout
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { PropagateLoader } from "react-spinners";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storageFirebase } from "../../firebaseUploadImage";
import { v4 } from "uuid";
import cloneDeep from "lodash/cloneDeep";

import {
  deleteProductDistributor,
  getAllProduct,
  updateProductDistributor,
  setUnpublished,
} from "../../redux/slices/distributor/productSlice";
import {
  delete_product_distributor,
  get_all_product_distributor,
  publish_product_distributor,
  unPublish_product_distributor,
  update_product_distributor,
} from "../../redux/services/distributor/product.server";
import { get_all_category } from "../../redux/services/distributor/category.service";
import { getAllCategoryDistributor } from "../../redux/slices/distributor/categorySlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DistributorProductCard from "../../components/Distributor/DistributorProductCard";
import noImage from "../../assets/images/no_image.jpg";

const ProductDistributor = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // State Management
  const [showDelete, setShowDelete] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  
  const [deleteId, setDeleteId] = useState(null);
  const [deleteImg, setDeleteImg] = useState("");
  const [publishTarget, setPublishTarget] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);
  
  const [loadingAction, setLoadingAction] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 8;

  // Form State for Update
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    image: "",
    description: "",
    isPublish: false,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);

  // Redux Data
  const products = useSelector((state) => state.product.product);
  const categories = useSelector((state) => state.categoryDistributor.categories);

  // Queries
  const productsQuery = useQuery({
    queryKey: queryKeys.distributor.products(),
    queryFn: async () => get_all_product_distributor(dispatch),
  });

  const categoriesQuery = useQuery({
    queryKey: ["distributor", "categories"],
    queryFn: async () => get_all_category(dispatch),
  });

  useEffect(() => {
    if (productsQuery.data?.status === 200) {
      dispatch(getAllProduct(productsQuery.data.data));
    }
    if (categoriesQuery.data?.status === 200) {
      dispatch(getAllCategoryDistributor(categoriesQuery.data.data));
    }
  }, [productsQuery.data, categoriesQuery.data, dispatch]);

  // Handlers
  const handlePageChange = (event) => {
    setItemOffset((event.selected * itemsPerPage) % products.length);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onEditClick = (product) => {
    setUpdateTarget(product);
    setFormData({
      name: product.name,
      price: product.price,
      categoryId: product.category?.id || "",
      image: product.image,
      description: product.description,
      isPublish: product.isPublish,
    });
    setPreviewUrl(product.image);
    setShowUpdate(true);
  };

  const onDeleteClick = (id, image) => {
    setDeleteId(id);
    setDeleteImg(image);
    setShowDelete(true);
  };

  const onToggleVisibilityClick = (id, product) => {
    setPublishTarget(product);
    setShowPublish(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Execution Logic
  const executeDelete = async () => {
    setLoadingAction(true);
    try {
      const res = await delete_product_distributor(deleteId);
      if (res.status === 200) {
        if (deleteImg) {
          try {
            await deleteObject(ref(storageFirebase, deleteImg));
          } catch (e) { console.error("Img delete failed", e); }
        }
        dispatch(deleteProductDistributor(deleteId));
        toast.success("Product removed.");
        setShowDelete(false);
      } else {
        toast.error("Deletion failed. Product may be linked to active orders.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const executeUpdate = async () => {
    setLoadingAction(true);
    const updatedData = cloneDeep(formData);

    try {
      if (newImageFile) {
        const imageRef = ref(storageFirebase, `image/${newImageFile.name + v4()}`);
        await uploadBytes(imageRef, newImageFile);
        updatedData.image = await getDownloadURL(imageRef);
      }

      const res = await update_product_distributor(updatedData, updateTarget.id);
      if (res.status === 200 || !res.response) {
        dispatch(updateProductDistributor({ ...updatedData, id: updateTarget.id }));
        toast.success("Product updated!");
        setShowUpdate(false);
      } else {
        toast.error("Update failed.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const executeToggleVisibility = async () => {
    setLoadingAction(true);
    const action = publishTarget.isPublish ? unPublish_product_distributor : publish_product_distributor;
    try {
      await action(publishTarget.id);
      dispatch(setUnpublished(publishTarget));
      toast.success(publishTarget.isPublish ? "Product hidden" : "Product is now public");
      setShowPublish(false);
    } finally {
      setLoadingAction(false);
    }
  };

  // Filtered & Paginated Data
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentItems = filteredProducts.slice(itemOffset, itemOffset + itemsPerPage);
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 dark:bg-slate-950">
      <ToastContainer />
      
      <div className="mx-auto w-[90%] max-w-7xl pt-12">
        {/* Header Controls */}
        <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Inventory Management
            </h1>
            <p className="mt-2 text-slate-500">Track, edit, and manage your wholesale product catalog.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white sm:w-64"
              />
            </div>
            <Link href="/distributor/add-product">
              <Button className="h-11 rounded-xl bg-teal-600 px-6 font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20">
                <Plus className="mr-2 h-4 w-4" /> Add New Item
              </Button>
            </Link>
          </div>
        </header>

        {/* Product Grid */}
        <div className="min-h-[60vh]">
          {productsQuery.isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <PropagateLoader color="#0f766e" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50">
              <Package className="h-16 w-16 text-slate-200 dark:text-slate-800" />
              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">No products found</h3>
              <p className="mt-2 text-slate-500">Try adjusting your search or add a new product.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {currentItems.map((product, idx) => (
                    <DistributorProductCard
                      key={product.id}
                      product={product}
                      index={idx}
                      onEdit={onEditClick}
                      onDelete={onDeleteClick}
                      onToggleVisibility={onToggleVisibilityClick}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {pageCount > 1 && (
                <div className="mt-16 flex justify-center">
                  <ReactPaginate
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                    previousLabel={<Plus className="h-4 w-4 rotate-90" />}
                    nextLabel={<Plus className="h-4 w-4 -rotate-90" />}
                    className="flex items-center gap-2"
                    pageClassName="h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    activeClassName="!bg-teal-600 !text-white shadow-lg shadow-teal-600/20"
                    previousClassName="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white dark:border-slate-800"
                    nextClassName="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white dark:border-slate-800"
                    breakLabel="..."
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 text-center border-none shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/30">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Delete Product?</h3>
          <p className="mt-4 text-slate-500 leading-relaxed">
            This action cannot be undone. The product will be permanently removed from your inventory and store.
          </p>
          <div className="mt-10 flex gap-3">
            <Button 
              className="h-14 flex-1 rounded-2xl bg-rose-500 font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-[0.98]"
              onClick={executeDelete}
              disabled={loadingAction}
            >
              {loadingAction ? "Deleting..." : "Yes, Delete"}
            </Button>
            <Button 
              variant="outline" 
              className="h-14 flex-1 rounded-2xl border-slate-200 dark:border-slate-800 font-bold"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visibility Toggle Confirmation */}
      <Dialog open={showPublish} onOpenChange={setShowPublish}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 text-center border-none shadow-2xl">
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${publishTarget?.isPublish ? 'bg-amber-50 text-amber-500' : 'bg-teal-50 text-teal-500'}`}>
            <Layout className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {publishTarget?.isPublish ? "Hide Product?" : "Publish Product?"}
          </h3>
          <p className="mt-4 text-slate-500 leading-relaxed">
            {publishTarget?.isPublish 
              ? "Retailers will no longer see this product in your store, but it will remain in your inventory." 
              : "This product will become visible to all retailers in the marketplace."}
          </p>
          <div className="mt-10 flex gap-3">
            <Button 
              className={`h-14 flex-1 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${publishTarget?.isPublish ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'}`}
              onClick={executeToggleVisibility}
              disabled={loadingAction}
            >
              {loadingAction ? "Updating..." : "Confirm"}
            </Button>
            <Button 
              variant="outline" 
              className="h-14 flex-1 rounded-2xl border-slate-200 dark:border-slate-800 font-bold"
              onClick={() => setShowPublish(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Product Dialog */}
      <Dialog open={showUpdate} onOpenChange={setShowUpdate}>
        <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-teal-600 px-8 py-10 text-white flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight">Update Product</h3>
              <p className="text-teal-100 text-sm mt-1">Modify your product details and pricing.</p>
            </div>
            <button onClick={() => setShowUpdate(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Image Column */}
              <div className="space-y-6">
                <div className="relative aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden group">
                  <img src={previewUrl || noImage.src || noImage} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" alt="Preview" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg">Change Photo</div>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Stock Status</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Public Visibility</span>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, isPublish: !prev.isPublish }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPublish ? 'bg-teal-600' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublish ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fields Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
                    <div className="relative">
                      <Package className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Unit Price ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input type="number" name="price" value={formData.price} onChange={handleFormChange} className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <div className="relative">
                      <Layout className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <select name="categoryId" value={formData.categoryId} onChange={handleFormChange} className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none font-bold">
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea name="description" rows="4" value={formData.description} onChange={handleFormChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none text-sm font-medium" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="h-14 flex-1 rounded-2xl bg-teal-600 hover:bg-teal-700 font-bold text-white shadow-lg shadow-teal-600/20" onClick={executeUpdate} disabled={loadingAction}>
                    {loadingAction ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" className="h-14 flex-1 rounded-2xl border-slate-200 dark:border-slate-800 font-bold" onClick={() => setShowUpdate(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDistributor;
