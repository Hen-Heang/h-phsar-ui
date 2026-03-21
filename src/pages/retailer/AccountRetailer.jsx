import React, { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  create_retailer_profile,
  edit_retailer_profile,
  get_retailer_profile,
} from "../../redux/services/retailer/retailerProfile.service";
import { getRetailerInfo } from "../../redux/slices/retailer/retailerProfileSlice";
import { storageFirebase } from "../../firebaseUploadImage";
import { v4 } from "uuid";
import { PulseLoader } from "react-spinners";
import { toast } from "react-toastify";
import AccountProfileSkeleton from "../../components/retailler/skeletons/AccountProfileSkeleton";
import noImage from "../../assets/images/retailer/No_image_available.png";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
export default function AccountRetailer() {
  // Show Popup
  const [showSave, setShowsave] = useState(false);
  // console.log(file);

  // Add more
  // const handleClick = () => {
  //   let newfield = { phone: " " }
  //   setNewProfile([...newProfile, newfield])
  // }
  // CreateObject
  const noProfile =
    "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:ring-primaryColorRetailer focus:border-primaryColorRetailer placeholder:text-gray-400";
  const hasProfile =
    "appearance-none block w-full bg-white text-gray-700 border border-gray-300 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:ring-primaryColorRetailer focus:border-primaryColorRetailer placeholder:text-gray-400";

  const profile = useSelector((state) => state.retailerProfile.retailerInfo);
  const dispatch = useDispatch();
  // Add phone number
  const [inputNewPhoneNumber, setInputNewPhoneNumber] = useState([
    { additionalPhone: "" },
  ]);

  const [newProfile, setNewProfile] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
    primaryPhoneNumber: "",
    profileImage: "",
    // firstName: 'unknown',
    // lastName: 'guest',
    // gender: 'unknown',
    // address: 'unknown',
    // primaryPhoneNumber: '0XXXXXXXX',
    // profileImage: 'https://firebasestorage.googleapis.com/v0/b/wm-file-upload.appspot.com/o/image%2Fno_image.jpg?alt=media&token=04771945-6cce-4223-931c-42ab83332cab',
    additionalPhoneNumber: [],
  });

  // get data on load
  // const [accountLoading, setAccountLoading]=useState(false)
  // const [isProfileExist, setProfilExist] = useState(false);
  // useEffect(() => {
  //   get_retailer_profile().then((res) => {
  //     if (res.status === 404) {
  //       setProfilExist(false)
  //       console.log("error", res.status)
  //       dispatch(
  //         getRetailerInfo({
  //           id: null,
  //           retailerAccountId: null,
  //           firstName: "unknown",
  //           lastName: "guest",
  //           gender: "unknown",
  //           address: "unknown",
  //           primaryPhoneNumber: "0XXXXXXXX",
  //           profileImage:
  //             "https://firebasestorage.googleapis.com/v0/b/wm-file-upload.appspot.com/o/image%2Fno_image.jpg?alt=media&token=04771945-6cce-4223-931c-42ab83332cab",
  //           createdDate: null,
  //           updatedDate: null,
  //           additionalPhoneNumber: null,
  //         })
  //       );

  //     }
  //     if (res.status === 200) {
  //       setProfilExist(true);
  //       console.log("ttttttttttttt", res.data.data);
  //       dispatch(getRetailerInfo(res.data.data));
  //       setNewProfile((prevProfile) => ({
  //         ...prevProfile,
  //         ...res.data.data,
  //       }));
  //       setPrimaryPhoneNumber(res.data.data.primaryPhoneNumber);
  //       console.log("asdasdadas", newProfile);
  //     }
  //   });
  const [accountLoading, setAccountLoading] = useState(false);
  const [isProfileExist, setProfilExist] = useState(false);

  useEffect(() => {
    setAccountLoading(true); // Set accountLoading to true before fetching data

    get_retailer_profile()
      .then((res) => {
        if (res.status === 404) {
          setProfilExist(false);
          console.log("error", res.status);
          dispatch(
            getRetailerInfo({
              id: null,
              retailerAccountId: null,
              firstName: "unknown",
              lastName: "guest",
              gender: "unknown",
              address: "unknown",
              primaryPhoneNumber: "0XXXXXXXX",
              profileImage:
                "https://firebasestorage.googleapis.com/v0/b/wm-file-upload.appspot.com/o/download.png?alt=media&token=f3aa8608-77b4-4437-af13-993de6ac2e84",
              createdDate: null,
              updatedDate: null,
              additionalPhoneNumber: null,
            })
          );
        }
        if (res.status === 200) {
          setProfilExist(true);
          console.log("ttttttttttttt", res.data.data);
          dispatch(getRetailerInfo(res.data.data));
          setNewProfile((prevProfile) => ({
            ...prevProfile,
            ...res.data.data,
          }));
          setPrimaryPhoneNumber(res.data.data.primaryPhoneNumber);
          console.log("asdasdadas", newProfile);
        }
      })
      .finally(() => {
        setAccountLoading(false); // Set accountLoading to false after fetching data
      });
  }, []);

  // }, []);
  // console.log(isProfileExist)

  // useEffect(() => {
  //   get_retailer_profile().then((res) => {
  //     dispatch(getRetailerInfo(res.data.data))
  //   })
  // }, profile.id)

  const [file, setFile] = useState();
  const [imageUrl, setImageUrl] = useState("");
  const [targetImage, setTargetImage] = useState(null);
  const [errorExtension,setErrorExtension] = useState(false)
  // Upload image
  const handleChange = (e) => {
    const uploadImage = e.target.files[0];
    setTargetImage(uploadImage);
    const allowedExtensions = ["jpg", "jpeg", "png"]; // Add the allowed file extensions here

    // Check if the file extension is allowed
    const fileExtension = uploadImage.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      // Display an error message or take appropriate action for invalid file extension
      setErrorExtension(true)
      return;
    }
    setErrorExtension(false)
    console.log(URL.createObjectURL(e.target.files[0]));
    setImageUrl(URL.createObjectURL(e.target.files[0]));
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
  };
  console.log(newProfile);

  // ================== validation =================
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
    primaryPhoneNumber: "",
    additionalPhoneNumber : [],
  });

  const validateForm = () => {
    let formIsValid = true;
    const newErrors = {
      firstName: "",
      lastName: "",
      gender: "",
      address: "",
      primaryPhoneNumber: "",
      additionalPhoneNumber : [],
    };

    // Validate firstName
    if (!newProfile.firstName) {
      formIsValid = false;
      newErrors.firstName = "First name is required";
    }

    // Validate lastName
    if (!newProfile.lastName) {
      formIsValid = false;
      newErrors.lastName = "Last name is required";
    }

    // Validate gender
    if (!newProfile.gender) {
      formIsValid = false;
      newErrors.gender = "Gender is required";
    }

    // Validate address
    if (!newProfile.address) {
      formIsValid = false;
      newErrors.address = "Address is required";
    }
    if (newProfile.primaryPhoneNumber.trim() === "") {
      newErrors.primaryPhoneNumber = "Primary phone number is required";
      formIsValid = false;
    } else if (!/^0\d{8,}$/.test(newProfile.primaryPhoneNumber)) {
      newErrors.primaryPhoneNumber =
        "Primary phone number must start with a zero (0) and have at least 9 digits";
      formIsValid = false;
    } else if (parseInt(newProfile.primaryPhoneNumber, 10) < 0) {
      newErrors.primaryPhoneNumber = "Primary phone number cannot be negative";
      formIsValid = false;
    } else if (!/^\d+$/.test(newProfile.primaryPhoneNumber)) {
      newErrors.primaryPhoneNumber =
        "Primary phone number must contain only numbers";
      formIsValid = false;
    } else {
      newErrors.primaryPhoneNumber = "";
    }

    // // Validate primaryPhoneNumber
    // if (!newProfile.primaryPhoneNumber) {
    //   formIsValid = false;
    //   newErrors.primaryPhoneNumber = "Primary phone number is required";
    // }

    // Check if gender field is empty
    if (newProfile.gender.trim() === "") {
      errors.gender = "Gender is required";
      formIsValid = false;
    }
    // if (newProfile.objectImage.trim() === "") {
    //   errors.gender = "Image is required";
    //   formIsValid = false;
    // }

    // Check if gender field contains a valid value
    const validGenders = ["Male", "Female", "Other"]; // Modify this array according to your valid gender options
    if (!validGenders.includes(newProfile.gender)) {
      errors.gender = "Invalid gender selected";
      formIsValid = false;
    }
    

    setErrors(newErrors);
    return formIsValid;
  };

  // confirm form
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  // const submit = async (e) => {
  //   if (!validateForm()) {
  //     toast.error("Please enter a valid");
  //     setShowsave(false);
  //   }
  //   if (validateForm()) {
  //     setLoadingConfirm(true);
  //     // e.preventDefault();
  //     const additionalPhoneArray = [];
  //     for (const objectArray of inputNewPhoneNumber) {
  //       if (objectArray !== inputNewPhoneNumber[0]) {
  //         additionalPhoneArray.push(objectArray.phone);
  //       }
  //     }
  //     console.log("abc", additionalPhoneArray);
  //     const updatedFields = {
  //       ...newProfile,
  //       primaryPhoneNumber: primaryPhone,
  //       // additionalPhoneNumber: inputNewPhoneNumber ===null ? [] : inputNewPhoneNumber.phone.splice(0, 1),
  //       additionalPhoneNumber:
  //         inputNewPhoneNumber.length < 1 ? [] : additionalPhoneArray,
  //     };
  //     console.log(updatedFields);
  //     if (targetImage === null) {
  //       // setNewProfile({...newProfile, primaryPhoneNumber: primaryPhone})
  //       // setNewProfile({...newProfile, additionalPhoneNumber: inputNewPhoneNumber.phone})
  //       // console.log("Input number : ", inputNewPhoneNumber);
  //       // console.log("Primary phone number : ", primaryPhone)

  //       // const updatedFields = newProfile
  //       if (isProfileExist) {
  //         console.log("Already have profile , no image ");
  //         edit_retailer_profile(updatedFields)
  //           .then((res) => dispatch(getRetailerInfo(res.data.data)))
  //           .then(() => setShowsave(false))
  //           .then(() => setLoadingConfirm(false))
  //           // .then(() => navigate("/distributor/product"))
  //           .catch((error) => {
  //             console.log(error);
  //             toast.error("Something went wrong");
  //             setLoadingConfirm(false);
  //           });
  //       } else {
  //         console.log("npo and image have profile");
  //         create_retailer_profile(updatedFields)
  //           .then((res) => dispatch(getRetailerInfo(res.data.data)))
  //           .then(() => setShowsave(false))
  //           .then(() => setLoadingConfirm(false))
  //           // .then(() => navigate("/distributor/product"))
  //           .catch((error) => {
  //             console.log(error);
  //             setLoadingConfirm(false);
  //             toast.error("Something went wrong");
  //           });
  //       }
  //     } else {
  //       // setNewProfile({...newProfile, primaryPhoneNumber: primaryPhone.key})
  //       // setNewProfile({...profile, additionalPhoneNumber: inputNewPhoneNumber.key})
  //       const imageRef = ref(
  //         storageFirebase,
  //         `image/${targetImage.name + v4()}`
  //       );
  //       await uploadBytes(imageRef, targetImage)
  //         .then(() => getDownloadURL(imageRef))
  //         .then((downloadUrl) => {
  //           console.log("Download url: ", downloadUrl);
  //           const updatedFields2 = {
  //             ...updatedFields,
  //             profileImage: downloadUrl,
  //           };
  //           console.log("update: ", updatedFields2);
  //           if (isProfileExist) {
  //             console.log("Already have profile");
  //             edit_retailer_profile(updatedFields2)
  //               .then((res) => dispatch(getRetailerInfo(res.data.data)))
  //               .then(() => setShowsave(false))
  //               .then(() => setLoadingConfirm(false))
  //               // .then(() => navigate("/distributor/product"))
  //               .catch((error) => {
  //                 console.log(error);
  //                 setLoadingConfirm(false);
  //               });
  //           } else {
  //             console.log("no have profile");
  //             create_retailer_profile(updatedFields2)
  //               .then((res) => dispatch(getRetailerInfo(res.data.data)))
  //               .then(() => setShowsave(false))
  //               .then(() => setLoadingConfirm(false))
  //               // .then(() => navigate("/distributor/product"))
  //               .catch((error) => {
  //                 console.log(error);
  //                 setLoadingConfirm(false);
  //                 toast.error("Something went wrong");
  //               });
  //           }
  //         });
  //     }
  //     // create_retailer_profile(e);
  //     console.log(newProfile);
  //     setEdit(true);
  //     setIsDisabled(true);
  //     setSave(false);
  //     setCancel(false);
  //   }
  // };
  const [errorNoImage, setErrorNoImage] = useState(false);
  const submit = async (e) => {
    setLoadingConfirm(true);
    e.preventDefault();
    // console.log("profile :", targetImage === null);
    // console.log("profile :", !validateForm());
    // console.log("profile :", !validateForm() || targetImage === null);
    if (!validateForm()) {
      console.log("error ");
      setLoadingConfirm(false);
      setShowsave(false);
     
    }
    // condition if store data null
    console.log("first : ", validateForm() && targetImage !== null);
    if (validateForm()) {
      setErrorNoImage(false);
      // Perform form submission logic
      if (!isProfileExist) {
        console.log("No data shop : ");
        // if shop doesn't have
        console.log("image url : ", targetImage);
        if (targetImage === null || targetImage === "" || errorExtension) {
          setErrorNoImage(true);
          setLoadingConfirm(false);
          setShowsave(false);
          return;
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
              const updatedFields = { ...newProfile, profileImage: downloadURL };
              console.log(updatedFields);
              // Submit the form data after the image upload is complete
              create_retailer_profile(updatedFields)
                .then((res) => {
                  if (res.status === 401 || res.status === 409) {
                    console.log("Hello");
                    setLoadingConfirm(false);
                    setShowsave(!showSave);
                    toast.error("Something went wrong");
                  } else {
                    dispatch(getRetailerInfo(res.data.data));
                    setShowsave(!showSave);
                    setEdit(true);
                    setIsDisabled(true);
                    setCancel(false);
                    setSave(false);
                    setLoadingConfirm(false);
                  }
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
          edit_retailer_profile(newProfile).then((res) => {
            if (res.status === 409 || res.status === 404 || res.status === 401) {
              setLoadingConfirm(false);
              setShowsave(false);
            } else {
              setShowsave(false);
              dispatch(getRetailerInfo(res.data.data));
              setLoadingConfirm(false);
              setEdit(true);
              setIsDisabled(true);
              setCancel(false);
              setSave(false);
            }
          });
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
              const updatedFields = { ...newProfile, profileImage: downloadURL };
              console.log(updatedFields);
              // Submit the form data after the image upload is complete
              console.log("Hello from");
              edit_retailer_profile(updatedFields)
                .then((res) => {
                  if (
                    res.status === 409 ||
                    res.status === 404 ||
                    res.status === 401
                  ) {
                    setLoadingConfirm(false);
                    setShowsave(false);
                  } else {
                    setShowsave(false);
                    dispatch(getRetailerInfo(res.data.data));
                    setLoadingConfirm(false);
                    setEdit(true);
                    setIsDisabled(true);
                    setCancel(false);
                    setSave(false);
                  }
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
  const handleCancel = () => {
    document.getElementById("Form").reset();
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

  const [primaryPhone, setPrimaryPhoneNumber] = useState("");

  //handleObject
  // const handleFormChange = (e) => {
  //   setNewProfile({ ...newProfile, [e.target.name]: e.target.value });
  // };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewProfile((prevShop) => ({
      ...prevShop,
      [name]: value,
    }));
  };
  // handle phone number
  // const [phones, setPhone] = useState([])
  // const handleInputNewPhoneNumber = phone => e => {
  //   const oldPhone = phones
  //   const phones = [...oldPhone, phone]
  //   console.log(phone)
  // }
  const handleInputNewPhoneNumber = (index, event) => {
    const data = [...newProfile.additionalPhoneNumber];

    // Update the value at the specified index
    data[index] = event.target.value;

    setNewProfile((prevShop) => ({
      ...prevShop,
      additionalPhoneNumber: data,
    }));
  };

  // Add more button
  const handleClick = () => {
    let newPhoneNumber = { phadditionalPhoneNumberone: "" };
    setInputNewPhoneNumber([...inputNewPhoneNumber, newPhoneNumber]);
  };
  // Delete phone number
  const removePhoneNumber = (index) => {
    let data = [...inputNewPhoneNumber];
    data.splice(index, 1);
    setInputNewPhoneNumber(data);
  };
  return accountLoading ? (
    <div className="bg-white rounded-lg  w-[94%] sm:w-[80%]  mx-auto">
      <AccountProfileSkeleton />
    </div>
  ) : (
    <div className="bg-white rounded-lg  w-[94%] sm:w-[80%]  mx-auto">
      <div className="w-full sm:p-6 p-4 space-y-1 md:space-y-2 sm:px-12 sm:py-12">
        <div>
          <h1 className="text-xl sm:text-3xl font-medium leading-normal text-primaryColorRetailer">
            My Account
          </h1>
          <p className=" text-xs sm:text-xl text-gray-600">
            Update your photo and personal details here.
          </p>
          <div className="border border-gray-200 w-96 mt-2"></div>
        </div>
        {/* Form */}
        <form id="Form">
          <div className="bg-white rounded-lg w-full shadow-md">
            <div className=" w-full sm:w-[94%] lg:w-[90%] mx-auto p-4 sm:p-6 space-y-1 md:space-y-2 sm:px-12 sm:py-12">
              {/* Profile image and Name*/}
              <div className="flex m-auto flex-row justify-start gap-5 items-center">
                <img
                  className="rounded w-32 h-32 lg:w-48 lg:h-48"
                  src={getSafeImageSrc(
                    imageUrl === "" || imageUrl === null
                      ? profile?.profileImage
                      : imageUrl,
                    noImage
                  )}
                  alt=""
                  onError={(e) => applyImageFallback(e, noImage)}
                ></img>
                <div className="w-full">
                  <h1 className="text-base sm:text-lg lg:text-4xl font-medium leading-tight">
                    {profile?.firstName} {profile?.lastName}
                  </h1>
                  <p className="text-2xl text-gray-600">{profile?.address}</p>
                  <div className="p-2 mt-4 flex flex-row justify-end -mx-3">
                    {edit ? (
                      <button
                        className="top-7 h-10 py-2.5 w-20 lg:w-32 mb-2 text-[10px] lg:text-sm font-medium text-white focus:outline-none bg-gray-400 rounded border border-gray-300 hover:bg-gray-500 focus:z-10 focus:ring-1 focus:ring-gray-400 "
                        type="button"
                        onClick={handleEdit}
                      >
                        Edit
                      </button>
                    ) : null}
                    {cancel ? (
                      <a
                        className="text-center mr-3 top-7 py-2.5 w-20 lg:w-32 mb-2 text-[10px] lg:text-sm font-medium text-white focus:outline-none bg-gray-400 rounded border border-gray-300 hover:bg-gray-500 focus:z-10 focus:ring-1 focus:ring-gray-400 "
                        type="button"
                        onClick={handleCancel}
                      >
                        Cancel
                      </a>
                    ) : null}
                    {save ? (
                      <button
                        className="top-7 py-2.5 w-20 lg:w-32 mb-2 text-[10px] lg:text-sm font-medium text-white focus:outline-none bg-primaryColorRetailer rounded border border-gray-300 focus:z-10 focus:ring-1 focus:ring-gray-400 "
                        type="button"
                        onClick={() => setShowsave(!showSave)}
                      >
                        Save Changes
                      </button>
                    ) : null}
                    {/* Popup */}
                    <Dialog
                      open={showSave}
                      onOpenChange={(open) => {
                        if (!open) setShowsave(false);
                      }}
                    >
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="sr-only">
                            Update Confirmation
                          </DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                          <div className="absolute bg-white top-2 right-0 h-14 w-12"></div>
                          <div className="w-full mx-auto text-center -mt-6">
                            <div className="mx-auto rounded-full w-20 h-20 justify-center">
                              <svg
                                className="text-white fill-primaryColorRetailer w-18 h-18"
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
                            <div className="w-full mx-auto">
                              <h3 className="mb-2 text-lg text-black">
                                Are you sure you want to update ?
                              </h3>
                              <p className="text-gray-500 text-sm">
                                If you choose confirm it would change your{" "}
                              </p>
                              <p className="text-sm text-gray-500">
                                information.
                              </p>
                              <div className="flex flex-col justify-center gap-3 w-full">
                                <Button
                                  className="relative mt-5 w-3/4 mx-auto hover:bg-primaryColorRetailer bg-primaryColorRetailer text-white border-gray-300 justify-center"
                                  type="submit"
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
                                          Conforming...
                                        </span>
                                      </span>
                                      &nbsp; Conforming
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
                                </Button>
                                <button
                                  className="w-3/4 mx-auto text-semibold text-sm font-medium text-center w-18 h-10 item-center rounded-lg border-2 border-primaryColorRetailer text-gray-800"
                                  type="button"
                                  onClick={() => setShowsave(!showSave)}
                                >
                                  Keep Updating
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <br /> <hr className="border border-gray-200" /> <br />
              {/* div 1 */}
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="mb-2 lg:mb-0">
                  <h1 className="font-medium sm:text-lg text-primaryColorRetailer">
                    User Information
                  </h1>
                  <p className="leading-loose text-sm sm:text-base text-gray-500">
                    Update your information here
                  </p>
                </div>
                <div className="w-full max-w-lg">
                  <div className="flex flex-wrap lg:-mx-3 mb-2">
                    {/* Firstname */}
                    <div className="w-full md:w-1/2 pr-3 -mb-1 lg:mb-6 md:mb-0">
                      <label
                        className="block tracking-wide text-primaryColorRetailer text-sm font-medium"
                        htmlFor="grid-first-name"
                      >
                        First Name
                      </label>
                      <input
                        className={isDisabled ? noProfile : hasProfile}
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder={profile.firstName}
                        onChange={handleFormChange}
                        disabled={isDisabled}
                      />
                      {errors.firstName && (
                        <p className="text-primary text-sm">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    {/* LastName */}
                    <div className="w-full  lg:mb-0 md:w-1/2">
                      <label
                        className="block tracking-wide text-primaryColorRetailer text-sm font-medium"
                        htmlFor="lastName"
                      >
                        Last Name
                      </label>
                      <input
                        className={isDisabled ? noProfile : hasProfile}
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder={profile?.lastName}
                        onChange={handleFormChange}
                        disabled={isDisabled}
                      />
                      {errors.lastName && (
                        <p className="text-primary text-sm">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Gender */}
                  <div className="flex flex-wrap lg:-mx-3 sm:mb-1 lg:mb-6">
                    <label
                      className="block tracking-wide text-primaryColorRetailer text-sm font-medium"
                      htmlFor="grid-gender"
                    >
                      Gender
                    </label>
                    {isDisabled ? (
                      <input
                        className={isDisabled ? noProfile : hasProfile}
                        id="grid-address"
                        type="text"
                        name="address"
                        placeholder={profile?.gender}
                        onChange={handleFormChange}
                        disabled={isDisabled}
                      />
                    ) : (
                      <select
                        className={isDisabled ? noProfile : hasProfile}
                        name="gender"
                        id="grid-gender"
                        onChange={handleFormChange}
                        disabled={isDisabled}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select Gender
                        </option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    )}
                    {errors.gender && (
                      <p className="text-primary text-sm">{errors.gender}</p>
                    )}
                  </div>
                  {/* Address */}
                  <div className="flex flex-wrap lg:-mx-3 mb-2 relative">
                    <img
                      src={(require("../../assets/images/address retailer (2).png")?.default || require("../../assets/images/address retailer (2).png"))}
                      alt=""
                      className="absolute left-16 top-1"
                    />
                    <label
                      className="tracking-wide text-primaryColorRetailer text-sm font-medium"
                      htmlFor="grid-address"
                    >
                      Address
                    </label>
                    <input
                      className={isDisabled ? noProfile : hasProfile}
                      id="grid-address"
                      type="text"
                      name="address"
                      placeholder={profile.address}
                      onChange={handleFormChange}
                      disabled={isDisabled}
                    />
                    {errors.address && (
                      <p className="text-primary text-sm">{errors.address}</p>
                    )}
                  </div>
                </div>
              </div>
              <br /> <hr className="border border-gray-200" /> <br />
              {/* div 2*/}
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="mb-2 lg:mb-0">
                  <h1 className="font-medium text-primaryColorRetailer">
                    User Profile
                  </h1>
                  <p className="leading-loose text-sm text-gray-500">
                    Update your warehouse profile here
                  </p>
                </div>
                <div className="w-full max-w-lg ">
                  {/* image upload */}
                  <div className="flex flex-row lg:-mx-3  justify-end">
                    <div className="w-36 sm:w-1/4 mb-6 md:mb-0 flex flex-col justify-between items-center sm:mr-5">
                      <img
                        className="rounded w-24 h-24 lg:w-32"
                        name="objectImage"
                        alt=""
                        src={getSafeImageSrc(
                          imageUrl === "" || imageUrl === null
                            ? profile?.profileImage
                            : imageUrl,
                          noImage
                        )}
                        onError={(e) => applyImageFallback(e, noImage)}
                      />
                      {errorNoImage && (
                        <p className="text-primary text-sm">Image is require</p>
                      )}
                      {errorExtension && (
                        <p className="text-primary text-sm">Image accept only jpg, png</p>
                      )}
                    </div>
                    <div className=" h-40 w-4/6  lg:ml-0  sm:w-3/5 justify-end">
                      <label
                        className="flex flex-col items-center justify-center w-full h-40 border border-gray-300 rounded-lg cursor-pointer bg-gray-200 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                        htmlFor="dropzone-file"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <img
                            className="h-12 w-12"
                            alt=""
                            src={(require("../../assets/images/image retailer (1).png")?.default || require("../../assets/images/image retailer (1).png"))}
                          />
                          <p className="my-2  text-center text-gray-500 dark:text-gray-400 text-sm">
                            <span className="font-semibold underline text-primaryColorRetailer">
                              Click to upload
                            </span>{" "}
                            <br />
                            SVG, PNG, JPG, or gif
                          </p>
                        </div>
                        <input
                          className="hidden"
                          id="dropzone-file"
                          name="image"
                          type="file"
                          onChange={handleChange}
                          disabled={isDisabled}
                          accept=".png, .jpg, .jpeg"
                        />
                      </label>
                     
                    </div>
                  </div>
                </div>
              </div>
              <br />
              <p></p>
              <hr className="border border-gray-200" /> <br />
              {/* div 3*/}
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="">
                  <h1 className="font-medium text-primaryColorRetailer">
                    Contact information
                  </h1>
                  <p className="leading-loose text-sm text-gray-500">
                    Please fill in the required informations
                  </p>
                </div>
                <div className="w-full max-w-lg">
                  <div className="flex flex-wrap lg:-mx-3 relative sm:mb-2">
                    <label
                      htmlFor="phone"
                      className="block mb-1 tracking-wide text-sm font-medium text-primaryColorRetailer dark:text-white"
                    >
                      Primary Phone number
                    </label>
                    <input
                      type="number"
                      pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                      id="phone"
                      name="primaryPhoneNumber"
                      onChange={handleFormChange}
                      disabled={isDisabled}
                      className={isDisabled ? noProfile : hasProfile}
                      placeholder={
                        profile?.primaryPhoneNumber === "" ||
                        profile?.primaryPhoneNumber === null
                          ? "0xxxxxxxxx"
                          : profile?.primaryPhoneNumber
                      }
                      // value={input.phone}
                      // value={profile.primaryPhone}
                      // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    />
                    {errors.primaryPhoneNumber && (
                      <p className="text-primary text-sm ">
                        {errors.primaryPhoneNumber}
                      </p>
                    )}
                  </div>
                  {/* phone number */}
                  <div className="flex flex-wrap lg:-mx-3 relative">
                    <button
                      type="button"
                      className="absolute top-6 right-0 py-3 px-4 mb-2 text-sm font-medium text-primaryColorRetailer focus:outline-none bg-gray-200 rounded border border-gray-300 hover:bg-gray-300 focus:z-10 focus:ring-1 focus:ring-primaryColor"
                      onClick={handleClick}
                      disabled={isDisabled}
                    >
                      Add more
                    </button>

                    <label
                      htmlFor="phone"
                      className="block mb-1 tracking-wide text-sm font-medium text-primaryColorRetailer dark:text-white"
                    >
                      Phone number
                    </label>
                    {inputNewPhoneNumber.map((input, index) => {
                      return (
                        <div key={index} className="w-full pb-5">
                          <input
                            type="number"
                            id="phone"
                            name="additionalPhoneNumber"
                            onChange={(event) =>
                              handleInputNewPhoneNumber(index, event)
                            }
                            disabled={isDisabled}
                            className={isDisabled ? noProfile : hasProfile}
                            placeholder={
                              profile?.additionalPhoneNumber === "" ||
                              profile?.additionalPhoneNumber === null
                                ? "0xxxxxxxxx"
                                : profile.additionalPhoneNumber
                            }
                            // value={input.phone}
                            // value={profile.primaryPhone}
                            // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                          />
                          {index ? (
                            <button
                              type="button"
                              onClick={() => removePhoneNumber(index)}
                              disabled={isDisabled}
                            >
                              <svg
                                className="absolute -mt-4 right-4 w-5 fill-primaryColorRetailer"
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
                  {/* <div className="flex flex-wrap  lg:-mx-3 relative">
                    <button
                      type="button"
                      className="absolute top-5 right-0 py-3 px-4 mb-2 text-sm font-medium text-primaryColorRetailer focus:outline-none bg-gray-200 rounded border border-gray-300 hover:bg-gray-300 focus:z-10 focus:ring-1 focus:ring-primaryColorRetailer"
                      onClick={handleClick}
                      disabled={isDisabled}
                    >
                      Add more
                    </button>
                   
                    <label
                      htmlFor="phone"
                      className="block tracking-wide text-sm font-medium text-primaryColorRetailer dark:text-white"
                    >
                      Additional Phone number
                    </label>
                    
                    {inputNewPhoneNumber.map((input, index) => {
                      return (
                        <div key={index} className="w-full lg:pb-5">
                          <input
                            type="number"
                            id="phone"
                            name="phone"
                            onChange={
                              (event) => handleInputNewPhoneNumber(index, event)
                              // handleInputNewPhoneNumber(event)
                            }
                            // onChange={handleFormChange}
                            disabled={isDisabled}
                            className={isDisabled ? noProfile : hasProfile}
                            placeholder={profile.additionalPhoneArray}
                            // value={input.phone}
                            // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                          />
                    </div>
                      )}
          
                        
                      )
                    }
                  </div> */}
                  {/* Email */}
                  <div className="flex flex-wrap   lg:-mx-3 mt-5 mb-5 sm:mb-10">
                    <label
                      className="block tracking-wide text-sm font-medium text-primaryColorRetailer dark:text-white"
                      htmlFor="email"
                    >
                      Email address
                    </label>
                    <input
                      className={noProfile}
                      id="email"
                      placeholder={
                        localStorage.getItem("email")
                          ? localStorage.getItem("email")
                          : "example@gmail.com"
                      }
                      type="email"
                      name="email"
                      onChange={handleFormChange}
                      disabled={true}
                    />
                  </div>
                  {/* Button Edit */}
                </div>
              </div>
              {/*---*/}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
