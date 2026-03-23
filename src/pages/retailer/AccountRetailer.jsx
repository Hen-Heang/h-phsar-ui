"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadImage } from "@/lib/uploadImage";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  create_retailer_profile,
  edit_retailer_profile,
  get_retailer_profile,
} from "../../redux/services/retailer/retailerProfile.service";
import { getRetailerInfo, setLoading, setError } from "../../redux/slices/retailer/retailerProfileSlice";
import { toast } from "react-toastify";
import AccountProfileSkeleton from "../../components/retailler/skeletons/AccountProfileSkeleton";
import Image from "next/image";
import noImage from "../../assets/images/retailer/No_image_available.png";
import { 
  ImagePlus, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Save, 
  X, 
  Edit3, 
  ShieldCheck, 
  Loader2,
  Camera,
  ChevronRight,
  Info
} from "lucide-react";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { cn } from "@/lib/cn";

export default function AccountRetailer() {
  const dispatch = useDispatch();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [isProfileExist, setProfileExist] = useState(false);

  const { retailerInfo: profile, loading } = useSelector((state) => state.retailerProfile);

  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
    primaryPhoneNumber: "",
    profileImage: "",
    additionalPhoneNumber: [],
  });

  const [validationErrors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "StockFlow | Account Settings";
    if (typeof window !== "undefined") {
      setEmail(window.localStorage.getItem("email") || "retailer@stockflow.com");
    }
    fetchProfile();
  }, [dispatch]);

  const fetchProfile = async () => {
    dispatch(setLoading(true));
    try {
      const res = await get_retailer_profile();
      if (res.status === 200) {
        setProfileExist(true);
        const data = res.data.data;
        dispatch(getRetailerInfo(data));
        setFormState(data);
        setPreviewUrl(data.profileImage);
      } else if (res.status === 401) {
        // Token expired — RetailerShell or the response interceptor will redirect
        return;
      } else if (res.status === 404) {
        setProfileExist(false);
        const defaultProfile = {
          firstName: "",
          lastName: "",
          gender: "Male",
          address: "",
          primaryPhoneNumber: "",
          profileImage: "",
          additionalPhoneNumber: [],
        };
        dispatch(getRetailerInfo(defaultProfile));
        setFormState(defaultProfile);
      }
    } catch (err) {
      dispatch(setError("Failed to fetch profile"));
      toast.error("Cloud sync failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG and PNG images are supported");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formState.firstName.trim()) newErrors.firstName = "Required";
    if (!formState.lastName.trim()) newErrors.lastName = "Required";
    if (!formState.primaryPhoneNumber.trim()) {
      newErrors.primaryPhoneNumber = "Required";
    } else if (!/^0\d{8,9}$/.test(formState.primaryPhoneNumber)) {
      newErrors.primaryPhoneNumber = "Invalid format (e.g. 012345678)";
    }
    if (!formState.address.trim()) newErrors.address = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = formState.profileImage;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const payload = { ...formState, profileImage: finalImageUrl };
      const res = isProfileExist 
        ? await edit_retailer_profile(payload)
        : await create_retailer_profile(payload);

      if (res.status === 200 || res.status === 201) {
        dispatch(getRetailerInfo(res.data.data));
        setProfileExist(true);
        setIsEditing(false);
        setShowSaveConfirm(false);
        toast.success("Profile synchronized successfully");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <AccountProfileSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-family-retailer">
      <div className="mx-auto max-w-5xl px-4 pt-12">
        {/* Header Section */}
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-orange-500">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Authorized Access</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Account Settings
            </h1>
            <p className="mt-2 text-slate-500 max-w-md">
              Manage your personal identification and delivery preferences for streamlined procurement.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all"
              >
                <Edit3 className="h-4 w-4" />
                Modify Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormState(profile);
                    setPreviewUrl(profile.profileImage);
                    setErrors({});
                  }}
                  className="h-12 px-6 rounded-2xl border-slate-200 bg-white font-bold"
                >
                  Discard
                </Button>
                <Button 
                  onClick={() => validate() && setShowSaveConfirm(true)}
                  className="h-12 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Avatar Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden sticky top-24">
              <CardContent className="p-0">
                <div className="h-32 bg-slate-900 relative">
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white bg-white shadow-xl">
                        <Image
                          src={previewUrl || noImage}
                          alt="Retailer"
                          fill
                          className="object-cover"
                          onError={(e) => applyImageFallback(e, noImage)}
                        />
                      </div>
                      {isEditing && (
                        <label className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-[2.5rem] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-8 w-8 text-white" />
                          <input type="file" className="hidden" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-20 pb-10 px-8 text-center">
                  <h2 className="text-xl font-black text-slate-900">
                    {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : "Authenticated User"}
                  </h2>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Verified Retailer
                  </div>
                  
                  <div className="mt-10 space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                      <div className="p-2 rounded-xl bg-white text-slate-400 shadow-sm">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Login Identity</span>
                        <span className="text-xs font-bold text-slate-700 truncate block w-40">{email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                      <div className="p-2 rounded-xl bg-white text-slate-400 shadow-sm">
                        <Info className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Account Tier</span>
                        <span className="text-xs font-bold text-slate-700">Premium Operations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: Form Fields */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8"
          >
            <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden">
              <CardContent className="p-10 md:p-14">
                <form className="space-y-12">
                  {/* Identity Group */}
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-8 w-1 bg-orange-500 rounded-full" />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Personal Identity</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                          <User className="h-3 w-3" />
                          First Given Name
                        </label>
                        <input
                          name="firstName"
                          placeholder="Ex: John"
                          value={formState.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={cn(
                            "w-full h-14 px-6 rounded-2xl border transition-all font-bold text-sm",
                            !isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-900",
                            validationErrors.firstName && "border-rose-500 ring-4 ring-rose-500/10"
                          )}
                        />
                        {validationErrors.firstName && (
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider px-1">Verification Required</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Last Surname</label>
                        <input
                          name="lastName"
                          placeholder="Ex: Doe"
                          value={formState.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={cn(
                            "w-full h-14 px-6 rounded-2xl border transition-all font-bold text-sm",
                            !isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-slate-900",
                            validationErrors.lastName && "border-rose-500 ring-4 ring-rose-500/10"
                          )}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Contact Group */}
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-8 w-1 bg-blue-500 rounded-full" />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Communication</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender Identification</label>
                        <div className="relative">
                          <select
                            name="gender"
                            value={formState.gender}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={cn(
                              "w-full h-14 px-6 rounded-2xl border transition-all font-bold text-sm appearance-none",
                              !isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900"
                            )}
                          >
                            <option value="Male">Male Identity</option>
                            <option value="Female">Female Identity</option>
                            <option value="Other">Non-Binary / Other</option>
                          </select>
                          <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          Primary Dispatch Line
                        </label>
                        <input
                          name="primaryPhoneNumber"
                          placeholder="Ex: 012345678"
                          value={formState.primaryPhoneNumber}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={cn(
                            "w-full h-14 px-6 rounded-2xl border transition-all font-bold text-sm",
                            !isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900",
                            validationErrors.primaryPhoneNumber && "border-rose-500 ring-4 ring-rose-500/10"
                          )}
                        />
                        {validationErrors.primaryPhoneNumber && (
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider px-1">{validationErrors.primaryPhoneNumber}</p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Logistics Group */}
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Default Logistics</h3>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        Delivery Distribution Point
                      </label>
                      <textarea
                        name="address"
                        placeholder="Provide precise delivery instructions..."
                        value={formState.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows="4"
                        className={cn(
                          "w-full p-6 rounded-[2rem] border transition-all font-bold text-sm resize-none leading-relaxed",
                          !isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900",
                          validationErrors.address && "border-rose-500 ring-4 ring-rose-500/10"
                        )}
                      />
                    </div>
                  </section>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent className="max-w-md p-10 rounded-[3rem] border-none shadow-2xl overflow-hidden">
          <DialogTitle className="sr-only">Save Confirmation</DialogTitle>
          <div className="text-center relative">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
            
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-orange-500 ">
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="h-12 w-12 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <Save className="h-12 w-12" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <h3 className="text-2xl font-black tracking-tight text-slate-900 ">Synchronize Profile?</h3>
            <p className="mt-4 text-slate-500 leading-relaxed font-medium">
              Confirming this will update your global profile data across the StockFlow platform.
            </p>
            
            <div className="mt-10 flex flex-col gap-3">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="h-16 rounded-[1.5rem] bg-orange-500 font-black text-sm uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all"
              >
                {isSubmitting ? "Uploading Data..." : "Confirm & Update"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowSaveConfirm(false)}
                className="h-14 font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel Synchronization
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
