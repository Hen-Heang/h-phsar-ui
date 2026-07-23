// @ts-nocheck -- legacy page, pending UI-11 TypeScript alignment pass
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";
import { uploadImage } from "@/lib/uploadImage";
import {
  add_new_product_distributor,
  get_all_product_distributor,
} from "../../redux/services/distributor/product.server";
import {
  addNewProduct,
  getAllProduct,
} from "../../redux/slices/distributor/productSlice";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { get_all_category } from "../../redux/services/distributor/category.service";
import { getAllCategoryDistributor } from "../../redux/slices/distributor/categorySlice";
import { toast } from "react-toastify";
import { CategoryComponent } from "../../components/Distributor/CategoryComponent";
import {
  Package,
  Tag,
  FileText,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Save,
  X,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const schema = yup.object().shape({
  name: yup.string().required("Product name is required"),
  description: yup.string().required("Description is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive(),
  categoryId: yup.string().required("Category is required"),
  qty: yup
    .number()
    .typeError("Stock must be a number")
    .required("Stock is required")
    .min(0),
});

const AddProductDistributor = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [imageUrl, setImageUrl] = useState("");
  const [targetImage, setTargetImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isOpenCategory, setIsOpenCategory] = useState(false);

  const categoryData = useSelector(
    (state) => state.categoryDistributor.categories,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    document.title = "StockFlow | Add Product";
    get_all_category(dispatch).then((res) => {
      if (res?.status === 200)
        dispatch(getAllCategoryDistributor(res.data.data));
    });
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTargetImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    let uploadedUrl = "";
    try {
      if (targetImage) {
        uploadedUrl = await uploadImage(targetImage);
      } else {
        toast.warning("Please select a product image");
        setLoading(false);
        return;
      }

      const newProduct = {
        ...data,
        image: uploadedUrl,
        isPublish: visible,
      };

      const res = await add_new_product_distributor([newProduct]);
      if (res.status === 200) {
        dispatch(addNewProduct(res.data.data));
        toast.success("Product successfully added to catalog");
        router.push("/supplier/products");
      }
    } catch (error) {
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-10 px-4"
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 shadow-sm transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Create Product
          </h1>
          <p className="text-slate-500 font-medium">
            Add a new item to your distributor inventory.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Upload Column */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
              <CardContent className="p-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 px-1">
                  Product Media
                </label>
                <div className="relative aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group hover:border-blue-400 transition-colors cursor-pointer">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <>
                      <div className="p-4 rounded-2xl bg-white shadow-sm mb-3">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Upload Image
                        <br />
                        (800x800px)
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
              <CardContent className="p-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 px-1">
                  Visibility
                </label>
                <div
                  onClick={() => setVisible(!visible)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    visible
                      ? "border-emerald-100 bg-emerald-50/50"
                      : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {visible ? (
                      <Eye className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-slate-400" />
                    )}
                    <span
                      className={`text-sm font-bold ${visible ? "text-emerald-700" : "text-slate-600"}`}
                    >
                      {visible ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full relative transition-colors ${visible ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${visible ? "left-5" : "left-1"}`}
                    />
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-slate-400 font-medium px-1 leading-relaxed">
                  Controls whether this product is visible to retailers in the
                  marketplace.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form Fields Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
              <CardContent className="p-8 md:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Product Name
                    </label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register("name")}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        placeholder="e.g. Premium Arabica Coffee"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-rose-500 text-[10px] font-bold px-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Category
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsOpenCategory(true)}
                        className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                      >
                        + New
                      </button>
                    </div>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        {...register("categoryId")}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
                      >
                        <option value="">Select category...</option>
                        {categoryData.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.categoryId && (
                      <p className="text-rose-500 text-[10px] font-bold px-1">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Unit Price ($)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        step="0.01"
                        {...register("price")}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-black"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-rose-500 text-[10px] font-bold px-1">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Opening Stock (Qty)
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        {...register("qty")}
                        className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-black"
                        placeholder="0"
                      />
                    </div>
                    {errors.qty && (
                      <p className="text-rose-500 text-[10px] font-bold px-1">
                        {errors.qty.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Full Description
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-5 w-4 h-4 text-slate-400" />
                    <textarea
                      rows="5"
                      {...register("description")}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
                      placeholder="Detailed product information, specifications, and storage instructions..."
                    />
                  </div>
                  {errors.description && (
                    <p className="text-rose-500 text-[10px] font-bold px-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset()}
                className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </div>
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
