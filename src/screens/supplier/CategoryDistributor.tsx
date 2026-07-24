// @ts-nocheck -- legacy page, pending UI-11 TypeScript alignment pass
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
  add_new_category,
  delete_category,
  get_all_category,
  update_category,
} from "../../redux/services/supplier/category.service";
import { PropagateLoader } from "react-spinners";
import {
  addNewCategoryDistributor,
  deleteCategoryDistributor,
  getAllCategoryDistributor,
  setLoadingCategory,
  updateCategoryDistributor,
} from "../../redux/slices/supplier/categorySlice";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ReactPaginate from "react-paginate";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Layers,
} from "lucide-react";

const schema = yup.object().shape({
  name: yup.string().required("Category name is required"),
});

export default function CategoryDistributor() {
  const dispatch = useDispatch();
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showUpdateCategory, setShowUpdateCategory] = useState(false);
  const [getDataUpdate, setGetDataUpdate] = useState({});
  const [onChangeDataUpdate, setOnChangeDataUpdate] = useState("");
  const [itemOffset, setItemOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const categoryData = useSelector(
    (state) => state.categoryDistributor.categories,
  );
  const loading = useSelector((state) => state.categoryDistributor.loading);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    dispatch(setLoadingCategory(true));
    get_all_category(dispatch)
      .then((r) => {
        if (r.status === 200) dispatch(getAllCategoryDistributor(r.data.data));
      })
      .finally(() => dispatch(setLoadingCategory(false)));
  }, [dispatch]);

  const filteredCategories = categoryData.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pageCount = Math.ceil(filteredCategories.length / 10);
  const currentCategories = filteredCategories.slice(
    itemOffset,
    itemOffset + 10,
  );

  const handlePagination = (event) => {
    setItemOffset(event.selected * 10);
  };

  const onAddCategory = (data) => {
    add_new_category(data).then((res) => {
      if (res.data?.status === 201) {
        dispatch(addNewCategoryDistributor(res.data.data));
        reset();
        setShowAddCategory(false);
        toast.success("Category added!");
      } else {
        toast.error("Failed to add category.");
      }
    });
  };

  const onUpdateCategory = () => {
    if (!onChangeDataUpdate) return setShowUpdateCategory(false);
    update_category(onChangeDataUpdate, getDataUpdate.id).then((res) => {
      if (res.status === 200) {
        dispatch(
          updateCategoryDistributor({
            name: onChangeDataUpdate,
            id: getDataUpdate.id,
          }),
        );
        setShowUpdateCategory(false);
        toast.success("Category updated!");
      }
    });
  };

  const onDeleteCategory = () => {
    delete_category(getDataUpdate.id)
      .then(() => {
        dispatch(deleteCategoryDistributor(getDataUpdate.id));
        setShowDeleteCategory(false);
        toast.info("Category removed.");
      })
      .catch(() => toast.error("Could not delete category."));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Categories</h1>
            <p className="text-sm text-slate-500">
              Organize your products by category
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddCategory(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search categories..."
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setItemOffset(0);
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Category Name</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-24 text-center">
                  <div className="flex justify-center items-center h-full">
                    <PropagateLoader color="#2563eb" />
                  </div>
                </td>
              </tr>
            ) : currentCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <Layers className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500">
                      {searchQuery
                        ? "No categories match your search."
                        : "No categories yet. Add one to get started."}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => setShowAddCategory(true)}
                        variant="outline"
                        className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Create First Category
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              currentCategories.map((cat, idx) => (
                <tr
                  key={cat.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {itemOffset + idx + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 capitalize">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setGetDataUpdate(cat);
                          setOnChangeDataUpdate(cat.name);
                          setShowUpdateCategory(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setGetDataUpdate(cat);
                          setShowDeleteCategory(true);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <ReactPaginate
          pageCount={pageCount}
          onPageChange={handlePagination}
          previousLabel="←"
          nextLabel="→"
          containerClassName="flex justify-end gap-2 mt-4"
          pageClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-xs hover:bg-blue-50 transition-colors cursor-pointer"
          activeClassName="!bg-blue-600 !text-white !border-blue-600"
          previousClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-xs hover:bg-blue-50 transition-colors cursor-pointer"
          nextClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-xs hover:bg-blue-50 transition-colors cursor-pointer"
        />
      )}

      {/* Add Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onAddCategory)}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Category Name
              </label>
              <input
                {...register("name")}
                placeholder="e.g. Electronics, Clothing..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
              />
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCategory(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={showUpdateCategory} onOpenChange={setShowUpdateCategory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Category Name
              </label>
              <input
                defaultValue={getDataUpdate.name}
                key={getDataUpdate.id}
                onChange={(e) => setOnChangeDataUpdate(e.target.value)}
                placeholder="Enter category name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUpdateCategory(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={onUpdateCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteCategory} onOpenChange={setShowDeleteCategory}>
        <DialogContent className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <DialogTitle className="text-xl font-bold mb-2">
            Delete Category?
          </DialogTitle>
          <p className="text-slate-500 text-sm mb-8">
            This will affect products currently using this category. This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteCategory(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onDeleteCategory}
            >
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
