"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  add_new_store,
  get_store_distributor_profile,
  update_store_distributor,
} from "../../redux/services/distributor/store.service";
import { getDataStore } from "../../redux/slices/distributor/storeSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import noImage from "@/assets/images/no_image.jpg";
import { uploadImage } from "@/lib/uploadImage";
import { PulseLoader } from "react-spinners";
import StoreSkeleton from "@/shared/components/skeletons/StoreSkeleton";
import { ImagePlus } from "lucide-react";

export default function StorePage() {
  const dispatch = useDispatch();
  const [newShop, setNewShop] = useState({
    name: "",
    address: "",
    primaryPhone: "",
    additionalPhone: "",
    bannerImage: "",
    isPublish: true,
  });

  const [errors, setErrors] = useState({});
  const validateForm = () => {
    let isValid = true;
    const errors = {};

    if (!newShop.name || newShop.name.trim() === "") {
      errors.name = "Store name is required";
      isValid = false;
    }
    if (!newShop.address || newShop.address.trim() === "") {
      errors.address = "Address is required";
      isValid = false;
    }
    if (!newShop.primaryPhone || newShop.primaryPhone.trim() === "") {
      errors.primaryPhone = "Primary phone is required";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const [targetImage, setTargetImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTargetImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const [loadingStore, setLoadingStore] = useState(false);
  const [noDataStore, setNoDataStore] = useState(false);

  useEffect(() => {
    setLoadingStore(true);
    get_store_distributor_profile().then((res) => {
      if (res.status === 404 || !res.data?.data) {
        setNoDataStore(true);
        setLoadingStore(false);
      } else {
        dispatch(getDataStore(res.data.data));
        setNewShop(res.data.data);
        setImageUrl(res.data.data.bannerImage);
        setNoDataStore(false);
        setLoadingStore(false);
      }
    });
  }, [dispatch]);

  const storeList = useSelector((state) => state.shop.store);

  const handleFormChange = (e) => {
    setNewShop({ ...newShop, [e.target.name]: e.target.value });
  };

  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [showSave, setShowsave] = useState(false);

  const submit = async (e) => {
    setLoadingConfirm(true);
    e.preventDefault();

    if (!validateForm()) {
      setLoadingConfirm(false);
      setShowsave(false);
      return;
    }

    try {
      if (noDataStore) {
        if (targetImage === null || targetImage === "") {
          const res = await add_new_store(newShop);
          dispatch(getDataStore(res.data.data));
          setEdit(true);
          setIsDisabled(true);
          setCancel(false);
          setSave(false);
          setShowsave(false);
          setLoadingConfirm(false);
        } else {
          const downloadURL = await uploadImage(targetImage);
          const updatedFields = { ...newShop, bannerImage: downloadURL };
          const res = await add_new_store(updatedFields);
          dispatch(getDataStore(res.data.data));
          setShowsave(false);
          setEdit(true);
          setIsDisabled(true);
          setCancel(false);
          setSave(false);
          setLoadingConfirm(false);
        }
      } else {
        if (targetImage === null || targetImage === "") {
          const res = await update_store_distributor(newShop);
          dispatch(getDataStore(res.data.data));
          setEdit(true);
          setIsDisabled(true);
          setCancel(false);
          setSave(false);
          setShowsave(false);
          setLoadingConfirm(false);
        } else {
          const downloadURL = await uploadImage(targetImage);
          const updatedFields = { ...newShop, bannerImage: downloadURL };
          const res = await update_store_distributor(updatedFields);
          dispatch(getDataStore(res.data.data));
          setShowsave(false);
          setEdit(true);
          setIsDisabled(true);
          setCancel(false);
          setSave(false);
          setLoadingConfirm(false);
        }
      }
    } catch (error) {
      setLoadingConfirm(false);
    }
  };

  const [isDisabled, setIsDisabled] = useState(true);
  const [edit, setEdit] = useState(true);
  const [save, setSave] = useState(false);
  const [cancel, setCancel] = useState(false);

  const handleEdit = () => {
    setIsDisabled(false);
    setEdit(false);
    setSave(true);
    setCancel(true);
  };

  const handleCancelEdit = () => {
    setIsDisabled(true);
    setEdit(true);
    setSave(false);
    setCancel(false);
  };

  if (loadingStore) return <StoreSkeleton />;

  return (
    <div className="space-y-6">
      <form id="Form">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          {/* Banner Section */}
          <div className="relative h-64 md:h-80 bg-slate-100 group">
            <Image
              src={imageUrl || storeList?.bannerImage || noImage}
              alt="Store Banner"
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = noImage.src || noImage;
              }}
            />
            {!isDisabled && (
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <ImagePlus className="w-12 h-12 mb-2 text-white" />
                <span className="font-bold">Change Banner Photo</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleChangeImage}
                />
              </label>
            )}
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                  {storeList?.name || "My Store"}
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                  Active Distributor Account
                </p>
              </div>
              <div className="flex gap-3">
                {edit && (
                  <Button
                    type="button"
                    onClick={handleEdit}
                    className="h-12 px-8 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Edit Store Details
                  </Button>
                )}
                {cancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-12 px-8 rounded-xl font-bold border-slate-200"
                  >
                    Cancel
                  </Button>
                )}
                {save && (
                  <Button
                    type="button"
                    onClick={() => setShowsave(true)}
                    className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Changes
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  General Information
                </h3>
                <p className="text-sm text-slate-500">
                  This information will be visible to retailers browsing the
                  platform.
                </p>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Store Name
                    </label>
                    <input
                      name="name"
                      value={newShop.name}
                      onChange={handleFormChange}
                      disabled={isDisabled}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      placeholder="Enter store name"
                    />
                    {errors.name && (
                      <p className="text-rose-500 text-xs font-bold">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Location / Address
                    </label>
                    <input
                      name="address"
                      value={newShop.address}
                      onChange={handleFormChange}
                      disabled={isDisabled}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      placeholder="Physical store location"
                    />
                    {errors.address && (
                      <p className="text-rose-500 text-xs font-bold">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Primary Phone
                    </label>
                    <input
                      name="primaryPhone"
                      value={newShop.primaryPhone}
                      onChange={handleFormChange}
                      disabled={isDisabled}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      placeholder="Contact number"
                    />
                    {errors.primaryPhone && (
                      <p className="text-rose-500 text-xs font-bold">
                        {errors.primaryPhone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Secondary Phone (Optional)
                    </label>
                    <input
                      name="additionalPhone"
                      value={newShop.additionalPhone}
                      onChange={handleFormChange}
                      disabled={isDisabled}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      placeholder="Backup contact"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <Dialog open={showSave} onOpenChange={setShowsave}>
        <DialogContent className="max-w-md p-8 rounded-[2.5rem] border-none shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 mb-2">
              Update Store Profile?
            </DialogTitle>
            <p className="text-slate-500 mb-8">
              Confirming will update your public store information for all
              retail partners.
            </p>
            <div className="space-y-3">
              <button
                className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                onClick={submit}
                disabled={loadingConfirm}
              >
                {loadingConfirm ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Updating...
                  </>
                ) : (
                  "Confirm & Save"
                )}
              </button>
              <button
                onClick={() => setShowsave(false)}
                className="w-full h-14 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
