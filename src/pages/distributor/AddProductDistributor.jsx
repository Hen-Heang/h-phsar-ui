"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storageFirebase } from "../../firebaseUploadImage";
import { v4 } from "uuid";
import { add_new_product_distributor } from "../../redux/services/distributor/product.server";
import { useDispatch, useSelector } from "react-redux";
import { addNewProduct } from "../../redux/slices/distributor/productSlice";
import { CategoryComponent } from "../../components/Distributor/CategoryComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Image as ImageIcon, Check, X, DollarSign, Package, Layout } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

// Static image imports
import dollarIcon from "../../assets/images/distributor/dollar.png";
import downArrowIcon from "../../assets/images/distributor/down_arrow.png";

const AddProductDistributor = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [inputFields, setInputFields] = useState([
    {
      id: v4(),
      name: "",
      qty: "",
      price: "",
      categoryId: "",
      image: null,
      previewUrl: "",
      description: "",
      isPublish: true,
    },
  ]);

  const categoryData = useSelector((state) => state.categoryDistributor.categories);
  const [loading, setLoading] = useState(false);
  const [isOpenCategory, setIsOpenCategory] = useState(false);

  const handleFormChange = (id, event) => {
    const { name, value } = event.target;
    setInputFields(prev => prev.map(field => 
      field.id === id ? { ...field, [name]: value } : field
    ));
  };

  const handleImageChange = (id, event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setInputFields(prev => prev.map(field => 
        field.id === id ? { ...field, image: file, previewUrl } : field
      ));
    }
  };

  const handleToggle = (id) => {
    setInputFields(prev => prev.map(field => 
      field.id === id ? { ...field, isPublish: !field.isPublish } : field
    ));
  };

  const addFields = () => {
    setInputFields([
      ...inputFields,
      {
        id: v4(),
        name: "",
        qty: "",
        price: "",
        categoryId: "",
        image: null,
        previewUrl: "",
        description: "",
        isPublish: true,
      },
    ]);
  };

  const removeFields = (id) => {
    if (inputFields.length > 1) {
      setInputFields(prev => prev.filter(field => field.id !== id));
    } else {
      toast.warn("You must have at least one product.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    const isValid = inputFields.every(f => f.name && f.qty && f.price && f.categoryId);
    if (!isValid) {
      toast.error("Please fill in all required fields for each product.");
      return;
    }

    setLoading(true);
    try {
      const productsToSubmit = await Promise.all(inputFields.map(async (field) => {
        let imageUrl = "";
        if (field.image) {
          const imageRef = ref(storageFirebase, `image/${field.image.name + v4()}`);
          const snapshot = await uploadBytes(imageRef, field.image);
          imageUrl = await getDownloadURL(snapshot.ref);
        }
        
        return {
          name: field.name,
          qty: parseInt(field.qty),
          price: parseFloat(field.price),
          categoryId: field.categoryId,
          image: imageUrl,
          description: field.description,
          isPublish: field.isPublish
        };
      }));

      const res = await add_new_product_distributor(productsToSubmit);
      dispatch(addNewProduct(res.data.data));
      toast.success("Products added successfully!");
      router.push("/distributor/product");
    } catch (error) {
      console.error("Error adding products:", error);
      toast.error("Failed to add products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6 dark:bg-slate-950 min-h-screen"
    >
      <ToastContainer />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Add New Products</h1>
          <p className="text-slate-500">List your items to start selling to retailers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/distributor/product">
            <Button variant="outline" className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </Link>
          <Button onClick={submit} disabled={loading} className="gap-2 px-8 bg-teal-600 hover:bg-teal-700">
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {loading ? "Saving..." : "Save Products"}
          </Button>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <AnimatePresence>
          {inputFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg font-bold">Product Information</CardTitle>
                  </div>
                  {inputFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFields(field.id)}
                      className="text-rose-500 hover:text-rose-700 p-2 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column: Image Upload */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                        {field.previewUrl ? (
                          <img src={field.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-medium">Click to upload product image</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(field.id, e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      
                      <div className="pt-4 space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Visibility</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggle(field.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.isPublish ? 'bg-teal-600' : 'bg-slate-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.isPublish ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                          <span className="text-sm font-medium text-slate-600">{field.isPublish ? "Public" : "Hidden"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Columns: Fields */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Product Name *</label>
                        <div className="relative">
                          <Package className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            name="name"
                            value={field.name}
                            onChange={(e) => handleFormChange(field.id, e)}
                            placeholder="e.g. Organic Jasmine Rice 5kg"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unit Price ($) *</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            name="price"
                            step="0.01"
                            value={field.price}
                            onChange={(e) => handleFormChange(field.id, e)}
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Initial Quantity *</label>
                        <input
                          type="number"
                          name="qty"
                          value={field.qty}
                          onChange={(e) => handleFormChange(field.id, e)}
                          placeholder="0"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Category *</label>
                          <button
                            type="button"
                            onClick={() => setIsOpenCategory(true)}
                            className="text-[10px] font-bold text-teal-600 uppercase hover:underline"
                          >
                            + Add New Category
                          </button>
                        </div>
                        <div className="relative">
                          <Layout className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <select
                            name="categoryId"
                            value={field.categoryId}
                            onChange={(e) => handleFormChange(field.id, e)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none appearance-none transition-all"
                            required
                          >
                            <option value="">Select a category</option>
                            {categoryData.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <img src={downArrowIcon.src || downArrowIcon} alt="" className="w-3" />
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                        <textarea
                          name="description"
                          rows="4"
                          value={field.description}
                          onChange={(e) => handleFormChange(field.id, e)}
                          placeholder="Describe your product features, dimensions, etc."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={addFields}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold">Add Another Product</span>
          </button>
        </div>
      </form>

      <CategoryComponent
        isOpenCategory={isOpenCategory}
        handleShowCategory={() => setIsOpenCategory(false)}
      />
    </motion.div>
  );
};

export default AddProductDistributor;
