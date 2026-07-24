"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import {
  add_new_product_distributor,
  get_all_product_distributor,
  import_product_distributor,
} from "../../redux/services/supplier/product.server";
import {
  addNewImportProduct,
  addNewProduct,
  getAllProduct,
} from "../../redux/slices/supplier/productSlice";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { get_all_category } from "../../redux/services/supplier/category.service";
import { getAllCategoryDistributor } from "../../redux/slices/supplier/categorySlice";
import { toast } from "react-toastify";
import { uploadImage } from "@/lib/uploadImage";
import { CategoryComponent } from "./CategoryComponent";
import {
  Package,
  Plus,
  Image as ImageIcon,
  DollarSign,
  List,
  Layout,
  X,
  Check,
} from "lucide-react";

const importSchema = yup.object().shape({
  id: yup.string().required("Please select a product"),
  qty: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .positive(),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive(),
});

const newProductSchema = yup.object().shape({
  name: yup.string().required("Product name is required"),
  categoryId: yup.string().required("Category is required"),
});

export default function NewImport(props) {
  const dispatch = useDispatch();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [targetImage, setTargetImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isOpenCategory, setIsOpenCategory] = useState(false);

  const productList = useSelector((state) => state.product.product);
  const categoryData = useSelector(
    (state) => state.categoryDistributor.categories,
  );

  const {
    register: registerImport,
    handleSubmit: handleSubmitImport,
    formState: { errors: errorsImport },
    reset: resetImport,
  } = useForm({
    resolver: yupResolver(importSchema),
  });

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    formState: { errors: errorsNew },
    reset: resetNew,
  } = useForm({
    resolver: yupResolver(newProductSchema),
  });

  useEffect(() => {
    get_all_product_distributor(dispatch).then((res) => {
      if (res?.status === 200) dispatch(getAllProduct(res.data.data));
    });
    get_all_category(dispatch).then((r) => {
      if (r?.status === 200) dispatch(getAllCategoryDistributor(r.data.data));
    });
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTargetImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const onImportSubmit = (data) => {
    setLoading(true);
    import_product_distributor(data)
      .then((res) => {
        if (res.status === 200 || res.data?.status === 200) {
          dispatch(addNewImportProduct(data));
          resetImport();
          toast.success("Inventory updated!");
          props.handleShowImport();
        }
      })
      .finally(() => setLoading(false));
  };

  const onNewProductSubmit = async (data) => {
    setLoading(true);
    let uploadedUrl = "";
    try {
      if (targetImage) {
        uploadedUrl = await uploadImage(targetImage);
      }

      const newProduct = {
        ...data,
        image: uploadedUrl,
        isPublish: visible,
        qty: 0,
        price: 0,
      };
      add_new_product_distributor([newProduct]).then((res) => {
        if (res.status === 201 || res.data?.status === 201) {
          dispatch(addNewProduct(res.data.data));
          resetNew();
          setShowAddProduct(false);
          toast.success("New product created!");
        }
      });
    } catch (error) {
      toast.error("Failed to upload image or save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={props.isOpenNewImport}
        onOpenChange={(o) => !o && props.handleShowImport()}
      >
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="bg-blue-700 text-white p-6 relative">
            <DialogTitle className="text-xl font-bold">
              Import Inventory
            </DialogTitle>
            <p className="text-blue-100 text-xs">
              Add stock to your existing products.
            </p>
          </DialogHeader>

          <form
            onSubmit={handleSubmitImport(onImportSubmit)}
            className="p-6 space-y-5"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Select Product
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(true)}
                  className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
                >
                  + New Product
                </button>
              </div>
              <div className="relative">
                <Package className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  {...registerImport("id")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 appearance-none bg-white"
                >
                  <option value="">Choose a product...</option>
                  {(Array.isArray(productList) ? productList : []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              {errorsImport.id && (
                <p className="text-[10px] text-rose-500 font-bold">
                  {errorsImport.id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Quantity
                </label>
                <input
                  {...registerImport("qty")}
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600"
                />
                {errorsImport.qty && (
                  <p className="text-[10px] text-rose-500 font-bold">
                    {errorsImport.qty.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Cost Price ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    {...registerImport("price")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                {errorsImport.price && (
                  <p className="text-[10px] text-rose-500 font-bold">
                    {errorsImport.price.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={props.handleShowImport}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  "Confirm Import"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-slate-900 text-white p-6">
            <DialogTitle className="text-xl font-bold">
              Quick Add Product
            </DialogTitle>
            <p className="text-slate-400 text-xs">
              Create a new product entry before importing stock.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitNew(onNewProductSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                  )}
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${visible ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${visible ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-600">
                    Visible to Retailers
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Product Name
                  </label>
                  <input
                    {...registerNew("name")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g. Premium Coffee"
                  />
                  {errorsNew.name && (
                    <p className="text-[10px] text-rose-500 font-bold">
                      {errorsNew.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOpenCategory(true)}
                      className="text-[10px] font-bold text-blue-600 uppercase"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    {...registerNew("categoryId")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 appearance-none bg-white"
                  >
                    <option value="">Select category...</option>
                    {(Array.isArray(categoryData) ? categoryData : []).map(
                      (c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Description
                  </label>
                  <textarea
                    {...registerNew("description")}
                    rows="3"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    placeholder="Brief details..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowAddProduct(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    {loading ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      "Save Product"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CategoryComponent
        isOpenCategory={isOpenCategory}
        handleShowCategory={() => setIsOpenCategory(false)}
      />
    </>
  );
}
