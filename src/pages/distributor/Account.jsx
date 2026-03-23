"use client";

import Image from "next/image";
import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAccount,
  getAccountDistributer,
} from "../../redux/slices/distributor/AccountSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import noImage from "../../assets/images/no_image.jpg";
import { uploadImage } from "@/lib/uploadImage";
import {
  add_new_account,
  get_account_distributor,
} from "../../redux/services/distributor/account.service";
import { update_account } from "../../redux/services/distributor/account.service";
import { getDataStore } from "../../redux/slices/distributor/storeSlice";
import { get_store_distributor_profile } from "../../redux/services/distributor/store.service";
import { PulseLoader, RingLoader } from "react-spinners";
import AccountProfileSkeleton from "../../components/retailler/skeletons/AccountProfileSkeleton";
import { ImagePlus } from "lucide-react";

export default function Account() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    document.title = "StockFlow | Account";
    if (typeof window !== "undefined") {
      setEmail(window.localStorage.getItem("email") || "");
    }
  }, []);
  const dispatch = useDispatch();
  //  ========================= CreateObject =======================
  const [newAccount, setNewAccount] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    profileImage: "",
    
  });
  // ========================== validation =========================
  const [errors, setErrors] = useState({});

  // Validation function
  const validateForm = () => {
    let isValid = true;
    const errors = {};

    // Check if firstName field is empty
    if (!newAccount.firstName || newAccount.firstName.trim() === "") {
      errors.firstName = "First name is required";
      isValid = false;
    }

    // Check if lastName field is empty
    if (!newAccount.lastName || newAccount.lastName.trim() === "") {
      errors.lastName = "Last name is required";
      isValid = false;
    }

    // Check if gender field is empty
    if (!newAccount.gender || newAccount.gender.trim() === "") {
      errors.gender = "Gender is required";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };
  // ======================== account image =========================
  const [targetImage, setTargetImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const handleChangeImage = (e) => {
    const uploadImage = e.target.files[0];
    if (uploadImage) {
      setTargetImage(uploadImage);
      setImageUrl(URL.createObjectURL(uploadImage));
    }
  };

  const [loadingAccount, setloadingAccount] = useState(false);
  const [noDataAccount, setNoDataAccount] = useState(false);
  useEffect(() => {
    setloadingAccount(true);
    get_account_distributor().then((res) => {
      if (res.status === 404 || res.status === 409 || res.status === 401) {
        dispatch(
          getAccountDistributer({
            firstName: "",
            lastName: "",
            gender: "",
            address: "",
            primaryPhoneNumber: "",
            profileImage: "",
            additionalPhoneNumber: [],
          })
        );
        setloadingAccount(false);
        setNoDataAccount(true);
      } else {
        dispatch(getAccountDistributer(res.data.data));
        setNewAccount(res.data?.data);
        setImageUrl(res.data.data?.profileImage);
        setloadingAccount(false);
        setNoDataAccount(false);
      }
    });
  }, [dispatch]);

  // useSelector
  const account = useSelector((state) => state.account.data);
  // handleObject
  const handleFormChange = (e) => {
    setNewAccount({ ...newAccount, [e.target.name]: e.target.value });
  };

  // =================================  confirm form =========================
  const [loadingConfirm, setSetLoadingConfirm] = useState(false);
  const submit = async (e) => {
    setSetLoadingConfirm(true);
    e.preventDefault();

    if (!validateForm()) {
      setShowsave(false);
      setSetLoadingConfirm(false);
      return;
    }

    try {
      if (noDataAccount) {
        if (targetImage === null || targetImage === "") {
          const res = await add_new_account(newAccount);
          dispatch(addNewAccount(res.data.data));
          setSetLoadingConfirm(false);
          setEdit(true);
          setIsDisabled(true);
          setSave(false);
          setCancel(false);
          setShowsave(false);
        } else {
          const downloadURL = await uploadImage(targetImage);
          const updatedFields = { ...newAccount, profileImage: downloadURL };
          const res = await add_new_account(updatedFields);
          dispatch(addNewAccount(res.data.data));
          setEdit(true);
          setIsDisabled(true);
          setSave(false);
          setCancel(false);
          setShowsave(false);
          setSetLoadingConfirm(false);
        }
      } else {
        if (targetImage === null || targetImage === "") {
          const res = await update_account(newAccount);
          dispatch(addNewAccount(res.data.data));
          setEdit(true);
          setIsDisabled(true);
          setSave(false);
          setCancel(false);
          setShowsave(false);
          setSetLoadingConfirm(false);
        } else {
          const downloadURL = await uploadImage(targetImage);
          const updatedFields = { ...newAccount, profileImage: downloadURL };
          const res = await update_account(updatedFields);
          dispatch(addNewAccount(res.data.data));
          setEdit(true);
          setIsDisabled(true);
          setSave(false);
          setCancel(false);
          setShowsave(false);
          setSetLoadingConfirm(false);
        }
      }
    } catch (error) {
      setSetLoadingConfirm(false);
    }
  };

  const [isDisabled, setIsDisabled] = useState(true);
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
  const [edit, setEdit] = useState(true);
  const [save, setSave] = useState(false);
  const [cancel, setCancel] = useState(false);

  const [showSave, setShowsave] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div
      className={` transition ${
        isOpen
          ? " transition-all ease-in-out delay-300 duration-1000 "
          : "opacity-0 scale-95 translate-y-1/2 "
      }`}
    >
      <form id="Form">
        {loadingAccount ? (
          <AccountProfileSkeleton />
        ) : (
          <div className="bg-white rounded-lg w-full shadow-md">
            <div className="w-full p-6 space-y-1 md:space-y-2 sm:px-12 sm:py-12">
              {/* Account image and Name*/}
              <div className="flex m-auto flex-row justify-start gap-3 lg:gap-7 items-center w-[100%]">
                <Image
                  src={imageUrl || account?.profileImage || noImage.src || noImage}
                  alt="Profile"
                  width={192}
                  height={192}
                  className="rounded w-36 h-36 sm:w-48 sm:h-48 lg:w-48 lg:h-48 border border-gray-300 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = noImage.src || noImage;
                  }}
                />
                <div className="self-auto w-full">
                  <h1 className="text-3xl lg:text-5xl font-bold text-slate-900">
                    {(!account?.firstName && !account?.lastName) ? "Store Owner" : `${account?.firstName || ""} ${account?.lastName || ""}`}
                  </h1>
                  <p className="text-blue-600 font-medium">{email}</p>

                  <div className="mt-6 flex justify-start gap-3">
                    {edit && (
                      <button
                        type="button"
                        className="py-2 px-8 text-sm font-medium text-white bg-slate-400 rounded shadow hover:bg-slate-500 transition"
                        onClick={handleEdit}
                      >
                        Edit Profile
                      </button>
                    )}
                    {cancel && (
                      <button
                        onClick={handleCancelEdit}
                        type="button"
                        className="py-2 px-8 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition"
                      >
                        Cancel
                      </button>
                    )}
                    {save && (
                      <button
                        type="button"
                        className="py-2 px-8 text-sm font-medium text-white bg-blue-600 rounded shadow-md hover:bg-blue-700 transition"
                        onClick={() => setShowsave(true)}
                      >
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <hr className="my-10 border-gray-100" />
              
              <div className="flex lg:flex-row flex-col gap-8">
                <div className="lg:w-1/3">
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                  <p className="text-sm text-slate-500">Update your account details and identity.</p>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-blue-800 uppercase mb-1">First Name</label>
                      <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 focus:ring-blue-600 focus:border-blue-600 transition disabled:opacity-50"
                        name="firstName"
                        type="text"
                        placeholder={account?.firstName || "First Name"}
                        onChange={handleFormChange}
                        disabled={isDisabled}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-800 uppercase mb-1">Last Name</label>
                      <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 focus:ring-blue-600 focus:border-blue-600 transition disabled:opacity-50"
                        name="lastName"
                        type="text"
                        placeholder={account?.lastName || "Last Name"}
                        onChange={handleFormChange}
                        disabled={isDisabled}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-800 uppercase mb-1">Gender</label>
                    <select
                      disabled={isDisabled}
                      onChange={handleFormChange}
                      name="gender"
                      defaultValue={account?.gender || ""}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 focus:ring-blue-600 focus:border-blue-600 transition disabled:opacity-50"
                    >
                      <option disabled value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                </div>
              </div>

              <hr className="my-10 border-gray-100" />

              <div className="flex lg:flex-row flex-col gap-8">
                <div className="lg:w-1/3">
                  <h2 className="text-lg font-bold text-slate-900">Profile Picture</h2>
                  <p className="text-sm text-slate-500">How you appear to your partners.</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center relative">
                      <Image
                        src={imageUrl || account?.profileImage || noImage.src || noImage}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <label
                      htmlFor="dropzone-file"
                      className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition"
                    >
                      <div className="flex flex-col items-center justify-center py-4">
                        <ImagePlus className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="text-xs text-slate-500">
                          <span className="font-bold text-blue-600">Click to upload</span> new photo
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">SVG, PNG, JPG (max 800x400px)</p>
                      </div>
                      <input id="dropzone-file" type="file" className="hidden" onChange={handleChangeImage} disabled={isDisabled} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      <Dialog open={showSave} onOpenChange={setShowsave}>
        <DialogContent className="max-w-md p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 mb-2">Update Account Profile?</DialogTitle>
            <p className="text-slate-500 mb-8">Confirming will save your updated information to your distributor profile.</p>
            <div className="space-y-3">
              <button
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                onClick={submit}
                disabled={loadingConfirm}
              >
                {loadingConfirm ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : "Confirm & Save"}
              </button>
              <button
                onClick={() => setShowsave(false)}
                className="w-full py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition"
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
