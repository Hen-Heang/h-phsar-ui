"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  add_new_category,
  delete_category,
  get_all_category,
  update_category,
} from "../../redux/services/distributor/category.service";
import { PropagateLoader } from "react-spinners";
import {
  addNewCategoryDistributor,
  deleteCategoryDistributor,
  getAllCategoryDistributor,
  setLoadingCategory,
  updateCategoryDistributor,
} from "../../redux/slices/distributor/categorySlice";
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
  Check,
  X,
} from "lucide-react";

const schema = yup.object().shape({
  name: yup.string().required("Category name is required"),
});

export const CategoryComponent = (prop) => {
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
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    dispatch(setLoadingCategory(true));
    get_all_category(dispatch)
      .then((r) => {
        if (r.status === 200) {
          dispatch(getAllCategoryDistributor(r.data.data));
        }
      })
      .finally(() => dispatch(setLoadingCategory(false)));
  }, [dispatch]);

  const filteredCategories = categoryData.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pageCount = Math.ceil(filteredCategories.length / 5);
  const currentCategories = filteredCategories.slice(
    itemOffset,
    itemOffset + 5,
  );

  const handlePagination = (event) => {
    setItemOffset(event.selected * 5);
  };

  const onAddCategory = async (data) => {
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
    <>
      <Dialog
        open={prop.isOpenCategory}
        onOpenChange={(open) => !open && prop.handleShowCategory()}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="bg-blue-700 text-white p-6 relative">
            <DialogTitle className="text-2xl font-bold text-white">
              Categories
            </DialogTitle>
            <p className="text-blue-100 text-sm">
              Organize your products by category.
            </p>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
              <Button
                onClick={() => setShowAddCategory(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Add New
              </Button>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Category Name</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="py-12 text-center">
                        <PropagateLoader color="#0f766e" />
                      </td>
                    </tr>
                  ) : currentCategories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-12 text-center text-slate-400"
                      >
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    currentCategories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 capitalize">
                          {cat.name}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setGetDataUpdate(cat);
                                setShowUpdateCategory(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setGetDataUpdate(cat);
                                setShowDeleteCategory(true);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
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

            {pageCount > 1 && (
              <ReactPaginate
                pageCount={pageCount}
                onPageChange={handlePagination}
                previousLabel="←"
                nextLabel="→"
                containerClassName="flex justify-end gap-2 mt-4"
                pageClassName="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-xs hover:bg-blue-50 transition-colors"
                activeClassName="bg-blue-600 text-white border-blue-600"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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
            <input
              {...register("name")}
              placeholder="Category name"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
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
            <input
              defaultValue={getDataUpdate.name}
              onChange={(e) => setOnChangeDataUpdate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600"
            />
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
    </>
  );
};
