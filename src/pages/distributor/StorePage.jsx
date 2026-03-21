"use client";

import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import noImage from "../../assets/images/distributor/store.png";
import { useEffect } from "react";
import {
  add_new_store,
  get_store_distributor_profile,
  update_store_distributor,
} from "../../redux/services/distributor/store.service";
import {
  addNewShop,
  getDataStore,
} from "../../redux/slices/distributor/storeSlice";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storageFirebase } from "../../firebaseUploadImage";
import { v4, validate } from "uuid";
import cloneDeep from "lodash/cloneDeep";
import { PulseLoader, RingLoader } from "react-spinners";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { StoreSkeleton } from "../../components/Skeletons/StoreSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Static image imports
import AddressIcon from "../../assets/images/Address.png";
import InscriptionIcon from "../../assets/images/Inscription.png";
import addImageIcon from "../../assets/images/add-image 2.png";

export default function StorePage() {
  const [loadingPage, setLoadingPage] = useState(false);
  const noData =
    "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:ring-primaryColor focus:border-primaryColor placeholder:text-gray-400";
  const hasData =
    "appearance-none block w-full bg-white text-gray-700 border border-gray-300 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:ring-primaryColor focus:border-primaryColor placeholder:text-gray-400";

  const dispatch = useDispatch();

  const storeList = useSelector((state) => state.shop.store);
  console.log("storeList", storeList);
  const [targetImage, setTargetImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [defaultImage, setDefaultImage] = useState("");
  const handleChangeImage = (e, index) => {
    const uploadImage = e.target.files[0];
    setTargetImage(uploadImage);
    setImageUrl(URL.createObjectURL(e.target.files[0]));
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
  };
  // get data from api
  console.log("image url : ", imageUrl);
  // useEffect(() => {
  //   setLoadingPage(true);
  //   get_store_distributor_profile()
  //     .then((res) => {
  //       dispatch(getDataStore(res.data.data));
  //       setNewShop(res.data.data);
  //       setVisible(res.data.data.isPublish);
  //       setImageUrl(res.data.data.bannerImage);

  //     })
  //     .then(() => setLoadingPage(false));
  // }, [dispatch]);

  const [noDataStore, setNoDataStore] = useState(false);
  useEffect(() => {
    setLoadingPage(true);
    get_store_distributor_profile().then((res) => {
      if (res.status === 404 || res.status === 409 || res.status === 401) {
        setLoadingPage(false);
        setNoDataStore(true);
        dispatch(
          getDataStore({
            name: "",
            bannerImage: "",
            address: "",
            primaryPhone: "",
            additionalPhone: [],
            description: "",
            isPublish: true,
          })
        );
      } else {
        setNoDataStore(false);
        dispatch(getDataStore(res.data.data));
        setNewShop(res.data.data);
        setVisible(res.data.data.isPublish);
        setLoadingPage(false);
        setImageUrl(res.data.data.bannerImage);
      }
    });
  }, []);

  const [visible, setVisible] = useState(true);

  const handleToggle = (e) => {
    const newValue = !visible;
    setVisible(newValue);
    setNewShop((prevShop) => ({
      ...prevShop,
      isPublish: newValue,
    }));
  };
  const [inputNewPhoneNumber, setInputNewPhoneNumber] = useState([
    { additionalPhone: "" },
  ]);
  const [newShop, setNewShop] = useState({
    name: "",
    bannerImage: "",
    address: "",
    primaryPhone: "",
    additionalPhone: [], // Update the initialization to include inputNewPhoneNumber
    description: "",
    isPublish: true,
  });

  // useEffect(() => {
  //   setVisible(storeList.isPublish);
  // }, visible);

  //handleObject
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewShop((prevShop) => ({
      ...prevShop,
      [name]: value,
    }));
    console.log(newShop.isPublish);
  };

  console.log("form handle change input : ", newShop);

  //  ============================ handle validation ============================
  const [showSave, setShowsave] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    primaryPhone: "",
  });

  const validateForm = () => {
    let isValid = true;
    const errorFields = { ...errors };

    if (newShop.name.trim() === "") {
      errorFields.name = "Name is required";
      isValid = false;
    } else {
      errorFields.name = "";
    }

    if (newShop.address.trim() === "") {
      errorFields.address = "Address is required";
      isValid = false;
    } else {
      errorFields.address = "";
    }
    if (newShop.description.trim() === "") {
      errorFields.address = "Description is required";
      isValid = false;
    } else {
      errorFields.description = "";
    }

    if (newShop.primaryPhone.trim() === "") {
      errorFields.primaryPhone = "Primary phone number is required";
      isValid = false;
    } else if (!/^0\d{8,}$/.test(newShop.primaryPhone)) {
      errorFields.primaryPhone =
        "Primary phone number must start with a zero (0) and have at least 9 digits";
      isValid = false;
    } else if (parseInt(newShop.primaryPhone, 10) < 0) {
      errorFields.primaryPhone = "Primary phone number cannot be negative";
      isValid = false;
    } else if (!/^\d+$/.test(newShop.primaryPhone)) {
      errorFields.primaryPhone =
        "Primary phone number must contain only numbers";
      isValid = false;
    }else if (!/^\d{9,10}$/.test(newShop.primaryPhone)) {
      errorFields.primaryPhone =
        "Primary phone number must have 9 or 10 digits";
      isValid = false;
    } else {
      errorFields.primaryPhone = "";
    }

    setErrors(errorFields);
    return isValid;
  };

  // ==========================  confirm form ===============================
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const submit = async (e) => {
    setLoadingConfirm(true);
    e.preventDefault();
    console.log("storeList :", storeList);
    if (!validateForm()) {
      setLoadingConfirm(false);
      setShowsave(false);
    }
    // condition if store data null
    if (validateForm()) {
      // Perform form submission logic
      if (noDataStore) {
        console.log("No data shop : ");
        // if shop doesn't have
        console.log("image url : ", targetImage);
        if (targetImage === null || targetImage === "") {
          console.log("No Image url ...");
          // if user did not input image
          add_new_store(newShop)
            .then((res) => {
              dispatch(getDataStore(res.data.data));
            })
            .then(() => setLoadingConfirm(false))
            .then(() => {
              setEdit(true);
              setIsDisabled(true);
              setCancel(false);
              setSave(false);
            })

            .then(() => setShowsave(!showSave));
        } else {
          // if use input image
          const imageRef = ref(
            storageFirebase,
            `store_image/${targetImage.name + v4()}`
          );
          await uploadBytes(imageRef, targetImage)
            .then(() => getDownloadURL(imageRef))
            .then((downloadURL) => {
              console.log("downloadURL : ", downloadURL);
              const updatedFields = { ...newShop, bannerImage: downloadURL };
              console.log(updatedFields);
              // Submit the form data after the image upload is complete
              add_new_store(updatedFields)
                .then((res) => dispatch(getDataStore(res.data.data)))
                .then(() => setLoadingConfirm(false))
                .then(() => {
                  setShowsave(!showSave);
                  setEdit(true);
                  setIsDisabled(true);
                  setCancel(false);
                  setSave(false);
                })
                // .then(() => navigate("/distributor/product"))
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      } else {
        console.log("Already have account...!");
        // if shop already create, so update shop
        if (targetImage === null || targetImage === "") {
          // if user did not input image
          console.log("No target image");
          update_store_distributor(newShop)
            .then((res) => {
              setShowsave(false);
              dispatch(getDataStore(res.data.data));
              setLoadingConfirm(false);
            })
            .then(() => {
              setLoadingConfirm(false);
              setEdit(true);
              setIsDisabled(true);
              setCancel(false);
              setSave(false);
            })
            .then(() => setShowsave(false));
        } else {
          // if use input image
          const imageRef = ref(
            storageFirebase,
            `store_image/${targetImage.name + v4()}`
          );
          await uploadBytes(imageRef, targetImage)
            .then(() => getDownloadURL(imageRef))
            .then((downloadURL) => {
              console.log("downloadURL : ", downloadURL);
              const updatedFields = { ...newShop, bannerImage: downloadURL };
              console.log(updatedFields);
              // Submit the form data after the image upload is complete
              console.log("Hello from");
              update_store_distributor(updatedFields)
                .then((res) => dispatch(getDataStore(res.data.data)))
                .then(() => {
                  setLoadingConfirm(false);
                  setEdit(true);
                  setIsDisabled(true);
                  setCancel(false);
                  setSave(false);
                })
                .then(() => setShowsave(false))
                // .then(() => navigate("/distributor/product"))
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
      // console.log('Form submitted successfully');
    }
  };

  // Disable Form
  const [isDisabled, setIsDisabled] = useState(true);
  // Handle Edit Form
  const handleEdit = () => {
    setIsDisabled(!isDisabled);
    setEdit(false);
    setSave(true);
    setCancel(true);
  };

  //Handle Cancel Form
  const handleCancelEdit = (e) => {
    // document.getElementById("Form").reset();
    //clear image
    setTargetImage(null);
    setImageUrl("");
    setDefaultImage(storeList.bannerImage);
    //
    e.preventDefault();
    document.querySelector('form').reset();
    setVisible(false);
    setIsDisabled(!isDisabled);
    setEdit(true);
    setSave(false);
    setCancel(false);
  };

  // Edit Button
  const [edit, setEdit] = useState(true);
  // Save Button
  const [save, setSave] = useState(false);
  // Cancel Button
  const [cancel, setCancel] = useState(false);
  // Show Popup

  const handleInputNewPhoneNumber = (index, event) => {
    const data = [...newShop.additionalPhone];

    // Update the value at the specified index
    data[index] = event.target.value;

    setNewShop((prevShop) => ({
      ...prevShop,
      additionalPhone: data,
    }));
  };

  console.log(newShop.additionalPhone);

  // Add more button
  const handleClick = () => {
    setInputNewPhoneNumber((prevState) => [
      ...prevState,
      { additionalPhone: "" }, // Change the property name to "additionalPhone"
    ]);
  };

  // Delete phone number
  const removePhoneNumber = (index) => {
    let data = [...inputNewPhoneNumber];
    data.splice(index, 1);
    setInputNewPhoneNumber(data);
  };

  //update data
  // const handleAddNewShop=(()=> {
  //   add_store_distributor_profile(name).then((res)=>dispatch(addNewShop(res.data.data)))
  // });
  const [isOpenR, setIsOpenR] = useState(false);
  useEffect(() => {
    setIsOpenR(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpenR(true);
    }, 1000); // Delay of 500 milliseconds

    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      className={`dark:text-white transition ${
        isOpenR
          ? " transition-all ease-in-out delay-300 duration-1000 "
          : "opacity-0 scale-95 translate-y-1/2 "
      }`}
    >
      {/* note sm:w-[640px] md:w-[768px] */}
      {/* Form */}
      <form id="Form">
        {loadingPage ? (
          <StoreSkeleton />
        ) : (
          <div className="bg-white rounded-lg w-full shadow-md ">
            <div className="w-full p-6 space-y-1 md:space-y-2 sm:px-12 sm:py-12 ">
              {/* Store image and Name*/}
              <div className="flex flex-row justify-start gap-3 lg:gap-7 w-full">
                {imageUrl === null || imageUrl === "" ? (
                  <img
                    src={
                      defaultImage === "" ||
                      defaultImage === null
                        ? noImage
                        : defaultImage
                    }
                    alt=""
                    className="rounded w-36 h-36 lg:w-48 lg:h-48 sm:w-48 sm:h-48 "
                  />
                ) : (
                  <img
                    src={
                      imageUrl === "" || imageUrl === null ? noImage : imageUrl
                    }
                    alt=""
                    className="rounded w-36 h-36 lg:w-48 lg:h-48 sm:w-48 sm:h-48 "
                  />
                )}
                {/* <img src={storeList.bannerImage === '' || storeList.bannerImage===null ? noImage  : storeList.bannerImage} className="rounded w-48 h-48" alt=""/> */}
                <div className=" flex flex-col lg:gap-2">
                  {/* active */}
                  <label className="relative inline-flex items-center mr-5 cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={handleToggle}
                      className="sr-only peer border border-primary"
                      disabled={isDisabled}
                      checked={visible}
                      name="isPublish"
                      // onClick={handleToggle}
                    />
                    <div className="w-11 h-6 rounded-full peer bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primaryColor"></div>
                    {visible ? (
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        Publish
                      </span>
                    ) : (
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        Unpublish
                      </span>
                    )}
                  </label>
                  <h1 className="text-xl lg:text-4xl sm:text-4xl font-medium leading-loose">
                    {noDataStore ? "Store Name" : storeList.name}
                  </h1>
                  <p className="text-gray-600 text-sm lg:text-lg sm:text-lg sm:leading-loose">
                    {noDataStore ? "Address" : storeList.address}
                  </p>
                </div>
              </div>
              {/* Button Edit */}
              <div className="w-full flex justify-end sm:max-w-xl lg:max-w-6xl sm:mx-auto ">
                    <div className="">
                      {edit ? (
                        <button
                          type="button"
                          className="top-7  py-2 w-20 lg:py-2.5 lg:w-32 mb-2 text-xs lg:text-sm sm:w-32 sm:py-2.5 sm:text-sm font-medium text-white focus:outline-none bg-gray-400 rounded border border-gray-300 hover:bg-gray-500 focus:z-10 focus:ring-1 focus:ring-gray-400 "
                          onClick={handleEdit}
                        >
                          Edit
                        </button>
                      ) : null}
                    </div> 
              </div>
              <br /> <hr className="border border-gray-200" /> <br />
              {/* div 1 */}
              <div className="flex lg:flex-row flex-col justify-start">
                <div className="lg:w-2/5 sm:w-4/6 w-full mb-4">
                  <h1 className="font-medium sm:text-lg">Store Information</h1>
                  <p className="leading-loose  sm:text-base text-xs lg:text-sm text-gray-500 ">
                    Update your information here
                  </p>
                </div>
                <div className="w-full max-w-xl sm:mx-auto lg:mt-3">
                  {/* Name */}
                  <div className="flex flex-wrap lg:-mx-3 mb-2">
                    <label
                      className="block mb-1 tracking-wide text-primaryColor text-sm font-medium"
                      htmlFor="grid-first-name"
                    >
                      Name
                    </label>
                    <input
                      className={isDisabled ? noData : hasData}
                      id="grid-first-name"
                      name="name"
                      type="text"
                      placeholder={
                        storeList.name === "" ? "Store Name" : storeList.name
                      }
                      onChange={handleFormChange}
                      disabled={isDisabled}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm -mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  {/* Address */}
                  <div className="flex flex-wrap lg:-mx-3 mb-5 relative">
                    <img
                      src={(require("../../assets/images/Address.png")?.default || require("../../assets/images/Address.png"))}
                      alt=""
                      className="absolute left-16"
                    />
                    <label
                      className="tracking-wide mb-1 text-primaryColor text-sm font-medium"
                      htmlFor="grid-address"
                    >
                      Address
                    </label>
                    <input
                      className={isDisabled ? noData : hasData}
                      id="grid-address"
                      type="text"
                      name="address"
                      // value={storeList.address}
                      placeholder={
                        storeList.address === ""
                          ? "Store Address"
                          : storeList.address
                      }
                      onChange={handleFormChange}
                      disabled={isDisabled}
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm ">{errors.address}</p>
                    )}
                  </div>
                  {/* Bio */}
                  <div className="flex flex-wrap lg:-mx-3 relative">
                    <img
                      src={(require("../../assets/images/Inscription.png")?.default || require("../../assets/images/Inscription.png"))}
                      alt=""
                      className="absolute left-6 top-1"
                    />
                    <label
                      htmlFor="grid-bio"
                      className="tracking-wide mb-1 text-sm font-medium text-primaryColor"
                    >
                      Bio
                      <span className="ml-6">
                        (up to 50 characters) &nbsp;&nbsp;&nbsp;
                        <span className="mt-2 text-sm text-gray-500">
                          Brief description about your shop.
                        </span>
                      </span>
                    </label>
                    <textarea
                      id="grid-bio"
                      rows="5"
                      name="description"
                      // value={storeList.description}
                      onChange={handleFormChange}
                      disabled={isDisabled}
                      className={isDisabled ? noData : hasData}
                      placeholder={
                        noDataStore
                          ? "Store description...."
                          : storeList.description
                      }
                    ></textarea>
                    {errors.address && (
                      <p className="text-red-600 text-sm ">{errors.address}</p>
                    )}
                  </div>
                </div>
              </div>
              <br />
              <hr className="border border-gray-200 " /> <br />
              {/* div 2*/}
              <div className="flex lg:flex-row justify-start  flex-col">
                <div className="lg:w-2/5 sm:w-3/6 w-full mb-4  ">
                  <h1 className="font-medium sm:text-lg">
                    Contact information
                  </h1>
                  <p className="leading-loose  text-xs sm:text-base text-gray-500 flex md:w-full">
                    Please fill in the required informations
                  </p>
                </div>

                <div className="w-full max-w-xl sm:mx-auto ">
                  <div className="flex flex-wrap lg:-mx-3 relative sm:mb-2">
                    <label
                      htmlFor="phone"
                      className="block mb-1 tracking-wide text-sm font-medium text-primaryColor dark:text-white"
                    >
                      Primary Phone number
                    </label>
                    <input
                      type="number"
                      pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                      id="phone"
                      name="primaryPhone"
                      onChange={handleFormChange}
                      disabled={isDisabled}
                      className={isDisabled ? noData : hasData}
                      placeholder={
                        noDataStore ? "0xxxxxxxxx" : storeList.primaryPhone
                      }
                      // value={input.phone}
                      // value={storeList.primaryPhone}
                      // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    />
                    {errors.primaryPhone && (
                      <p className="text-red-600 text-sm ">
                        {errors.primaryPhone}
                      </p>
                    )}
                  </div>
                  {/* phone number */}
                  <div className="flex flex-wrap lg:-mx-3 relative">
                    <button
                      type="button"
                      className="absolute top-6 right-0 py-3 px-4 mb-2 text-sm font-medium text-primaryColor focus:outline-none bg-gray-200 rounded border border-gray-300 hover:bg-gray-300 focus:z-10 focus:ring-1 focus:ring-primaryColor"
                      onClick={handleClick}
                      disabled={isDisabled}
                    >
                      Add more
                    </button>

                    <label
                      htmlFor="phone"
                      className="block mb-1 tracking-wide text-sm font-medium text-primaryColor dark:text-white"
                    >
                      Phone number
                    </label>
                    {inputNewPhoneNumber.map((input, index) => {
                      return (
                        <div key={index} className="w-full pb-5">
                          <input
                            type="number"
                            id="phone"
                            name="additionalPhone"
                            onChange={(event) =>
                              handleInputNewPhoneNumber(index, event)
                            }
                            disabled={isDisabled}
                            className={isDisabled ? noData : hasData}
                            placeholder={
                              noDataStore
                                ? "0xxxxxxxxx"
                                : storeList.additionalPhone
                            }
                            // value={input.phone}
                            // value={storeList.primaryPhone}
                            // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                          />
                          {index ? (
                            <button
                              type="button"
                              onClick={() => removePhoneNumber(index)}
                              disabled={isDisabled}
                            >
                              <svg
                                className="absolute -mt-4 right-4 w-5 fill-primaryColor"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <br />
              <hr className="border border-gray-200" /> <br />
              {/* div 3*/}
              <div className="flex lg:flex-row justify-start flex-col ">
                <div className="lg:w-2/5 sm:w-2/5 w-full mb-4">
                  <h1 className="font-medium sm:text-lg ">Store Picture</h1>
                  <p className="leading-loose text-xs sm:text-base text-gray-500 lg:mb-5 sm:mb-5">
                    Update your shop image here
                  </p>
                </div>
                <div className="w-full max-w-xl sm:mx-auto">
                  {/* Upload image */}
                  <div className="flex flex-wrap lg:-mx-3 mb-6 lg:mb-10">
                    <div className="w-2/5 mb-6 lg:mb-0 sm:mb-4 flex flex-col justify-between items-center">
                    {imageUrl === null || imageUrl === "" ? (
                        <img
                          src={
                            defaultImage === "" ||
                            defaultImage === null
                              ? noImage
                              : defaultImage
                          }
                          alt=""
                          className="rounded w-24 h-24 sm:w-32 sm:h-32 border border-gray-300"
                        />
                      ) : (
                        <img
                          src={
                            imageUrl === "" || imageUrl === null
                              ? noImage
                              : imageUrl
                          }
                          alt=""
                          className="rounded w-24 h-24 sm:w-32 sm:h-32 border border-gray-300"
                        />
                      )}
                      {/* {imageUrl === null || imageUrl === "" ? (
                      <img
                        src={
                          storeList.bannerImage === "" ||
                          storeList.bannerImage === null
                            ? noImage
                            : storeList.bannerImage
                        }
                        alt=""
                        className="rounded w-28 h-28"
                      />
                    ) : (
                      
                    )} */}
                    </div>
                    <div className="w-3/5">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-28 sm:h-40 border border-gray-300 rounded-lg cursor-pointer bg-gray-200 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                      >
                        <div className="flex flex-col  items-center justify-center pt-5 pb-6">
                          <img
                            src={(require("../../assets/images/add-image 2.png")?.default || require("../../assets/images/add-image 2.png"))}
                            alt=""
                            className="h-7 w-7 sm:h-10 sm:w-10"
                          />
                          <p className="mb-2  text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                            <span className="font-semibold underline text-primaryColor">
                              Click to upload
                            </span>{" "}
                            <br />
                            SVG, PNG, JPG, or gif
                            <br />
                            (max, 800x400px)
                          </p>
                        </div>
                        <input
                          onChange={handleChangeImage}
                          disabled={isDisabled}
                          id="dropzone-file"
                          name="image"
                          type="file"
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {/* Button cancel and save */}
                  <div className="flex flex-wrap justify-end lg:-mx-3">
                  {cancel ? (
                        <button
                          onClick={handleCancelEdit}
                          type="button"
                          className="mr-3 top-7 py-2 w-20 lg:py-2.5 lg:w-32 sm:mb-2 text-[10px] lg:text-sm sm:w-32 sm:py-2.5 sm:text-sm font-medium text-white focus:outline-none bg-gray-400 rounded border border-gray-300 hover:bg-gray-500 focus:z-10 focus:ring-1 focus:ring-gray-400 "
                        >
                          Cancel
                        </button>
                      ) : null}
                      {save ? (
                        <button
                          type="button"
                          className="top-7 py-2 w-20 lg:py-2.5 lg:w-32 sm:mb-2 text-[10px] lg:text-sm sm:w-32 sm:py-2.5 sm:text-sm font-medium text-white focus:outline-none bg-primaryColor rounded border border-gray-300 focus:z-10 focus:ring-1 focus:ring-gray-400 "
                          onClick={() => setShowsave(!showSave)}
                        >
                          Save Changes
                        </button>
                      ) : null}
                      {/* Popup */}
                      <Dialog open={showSave} onOpenChange={setShowsave}>
                        <DialogContent className="max-w-md">
                          <DialogHeader className="items-center text-center">
                            <div className="mx-auto rounded-full w-16 h-16 sm:w-20 sm:h-20 justify-center">
                              <svg
                                className="text-white fill-primaryColor w-18 h-18"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                                />
                              </svg>
                            </div>
                            <DialogTitle className="text-base sm:text-lg text-black">
                              Are you sure you want to update?
                            </DialogTitle>
                          </DialogHeader>
                          <div className="w-full mx-auto text-center">
                            <p className="text-gray-500 text-xs sm:text-sm">
                              If you choose confirm it would change your
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              information.
                            </p>
                            <div className="flex flex-col justify-center gap-3 w-full mt-5">
                              <button
                                className="relative w-3/4 mx-auto h-10 rounded-lg bg-primaryColor text-sm font-medium text-white hover:bg-primaryColor"
                                type="button"
                                onClick={submit}
                              >
                                {loadingConfirm ? (
                                  <>
                                    <span
                                      className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
                                      role="status"
                                      aria-label="loading"
                                    >
                                      <span className="sr-only">
                                        Confirming...
                                      </span>
                                    </span>
                                    &nbsp; Confirming
                                    <span className="mt-2 absolute right-[62px]">
                                      <PulseLoader
                                        size="3px"
                                        color="#ffffff"
                                      />
                                    </span>
                                  </>
                                ) : (
                                  "Confirm"
                                )}
                              </button>
                              <button
                                onClick={() => setShowsave(false)}
                                type="button"
                                className="w-3/4 mx-auto text-sm font-medium text-center h-10 rounded-lg border-2 border-primaryColor text-gray-800"
                              >
                                Keep Updating
                              </button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                  </div>

                </div>
              </div>
              {/*--- */}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
