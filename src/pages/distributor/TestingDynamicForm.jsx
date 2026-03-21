import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import "firebase/storage";
import { v4 } from "uuid";
import { add_new_product_distributor } from "../../redux/services/distributor/product.server";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storageFirebase } from "../../firebaseUploadImage";
import {
  getAllCategoryDistributor,
  setLoadingCategory,
} from "../../redux/slices/distributor/categorySlice";
import { get_all_category } from "../../redux/services/distributor/category.service";
import { addNewProduct } from "../../redux/slices/distributor/productSlice";
import { useDropzone } from "react-dropzone";
import { CategoryComponent } from "../../components/Distributor/CategoryComponent";
const AddProductForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [targetImage, setTargetImage] = useState(null);
  const [imageShow, setImageShow] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFields, setInputFields] = useState([
    {
      name: "",
      qty: "",
      price: "",
      categoryId: "",
      image: "",
      description: "",
      isPublish: true,
      imageUrl: "",
    },
  ]);
  // =================== drag and drop =================
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone([
    {
      multiple: true,
    },
  ]);
  // useEffect(() => {
  //   setInputFields((prevFields) => {
  //     const updatedFields = [...prevFields];
  //     updatedFields[index] = {
  //       ...updatedFields[index],
  //       targetImage: acceptedFiles,
  //     }});
  // },acceptedFiles)
  console.log(acceptedFiles);
  const [errors, setErrors] = useState([]);
  const handleFormChange = (index, event) => {
    const { name, value, type } = event.target;
    if (type === "file") {
      const uploadImage = event.target.files[0];
      const imageUrl = URL.createObjectURL(uploadImage);
      setInputFields((prevFields) => {
        const updatedFields = [...prevFields];
        updatedFields[index] = {
          ...updatedFields[index],
          imageUrl: imageUrl,
          targetImage: uploadImage,
        };
        return updatedFields;
      });
    } else {
      setInputFields((prevFields) => {
        const updatedFields = [...prevFields];
        updatedFields[index][name] = value;
        return updatedFields;
      });
    }
  };

  const handleToggle = (index) => {
    setInputFields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields[index] = {
        ...updatedFields[index],
        isPublish: !updatedFields[index].isPublish,
      };
      return updatedFields;
    });
  };

  const addFields = () => {
    setInputFields((prevFields) => [
      ...prevFields,
      {
        name: "",
        qty: "",
        price: "",
        categoryId: "",
        image: "",
        description: "",
        isPublish: true,
      },
    ]);
  };

  const removeFields = (index) => {
    setInputFields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields.splice(index, 1);
      return updatedFields;
    });
  };

  const validateFields = () => {
    const newErrors = [];

    inputFields.forEach((input, index) => {
      // if (!input.name.trim()) {
      //   newErrors.push(`Product name is required for entry ${index + 1}`);
      // }
      // if (!input.qty) {
      //   newErrors.push(`Quantity is required for entry ${index + 1}`);
      // }
      // if (!input.price) {
      //   newErrors.push(`Price is required for entry ${index + 1}`);
      // }
      // if (input.price < 0) {
      //   newErrors.push(`Price is  ${index + 1}`);
      // }
      // if (!input.categoryId.trim()) {
      //   newErrors.push(`Category ID is required for entry ${index + 1}`);
      // }
      if (!input.name.trim()) {
        newErrors.push(`Product name is required for entry ${index + 1}`);
      } else if (!input.qty) {
        newErrors.push(`Quantity is required for entry ${index + 1}`);
      } 
      else if (!input.price) {
        newErrors.push(`Price is required for entry ${index + 1} `);
      } 
      else if (input.qty <= 0) {
        newErrors.push(`You cannot input quantity negative value ${index + 1}`);
      } 
      else if (input.price <= 0) {
        newErrors.push(`You cannot input price negative value ${index + 1}`);
      } 
     
      else if (!input.categoryId.trim()) {
        newErrors.push(`Category ID is required for entry ${index + 1}`);
      } else if (!input.imageUrl) {
        newErrors.push(`Image is required for choose ${index + 1}`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  //   =================== handle submit =================
  const submit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const isValid = validateFields();
    if (!isValid) {
      setLoading(false);
    }
    if (isValid) {
      console.log("Form data:", inputFields);

      if (
        inputFields.some(
          (field) => field.imageUrl === null || field.imageUrl === ""
        )
      ) {
        setLoading(true);
        console.log("Loading image", loading);
        console.log("data no image: ", inputFields);
        add_new_product_distributor(inputFields)
          .then((res) => dispatch(addNewProduct(res.data.data)))
          .then(() => navigate("/distributor/product"))
          .then(() => setLoading(false))
          .catch((error) => {
            console.log(error);
            setLoading(false);
          });
      }

      const uploadTasks = inputFields.map(async (input) => {
        const storageRef = ref(
          storageFirebase,
          `image/${input.targetImage.name + v4()}`
        );
        await uploadBytes(storageRef, input.targetImage).then((response) => {
          console.log(" uploaded successfully");
        });
        console.log("Hello upload bytes");
        const downloadURL = await getDownloadURL(storageRef);
        console.log(downloadURL);
        return downloadURL;
      });
      //   console.log("upload task :",uploadTasks);
      try {
        const downloadUrls = await Promise.all(uploadTasks);
        console.log("Download URLs:", downloadUrls);

        const updatedFields = inputFields.map((field, index) => ({
          ...field,
          image: downloadUrls[index],
        }));

        console.log("Updated fields:", updatedFields);

        add_new_product_distributor(updatedFields)
          .then((res) =>{
            if(res.status === 409 || res.status === 404 || res.status ===401){
              toast.error("Duplicate product...!")
              setLoading(false)
            }else {
              dispatch(addNewProduct(res.data.data))
              navigate("/distributor/product")
              setLoading(false)
            }
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
          });
      } catch (error) {
        console.log(error);
      }
    }

    // console.log(loading);
  };

  //   category
  const categoryData = useSelector(
    (state) => state.categoryDistributor.categories
  );
  useEffect(() => {
    get_all_category(dispatch)
      .then((r) => {
        if (r.status === 400) {
          // toast.error("This store have no category");
        }
        if (r.status === 404) {
          // toast.error("Please create a new category");
        }
        if (r.status === 200) {
          dispatch(getAllCategoryDistributor(r.data.data));
        }
      })
      .catch((error) => {
        dispatch(setLoadingCategory(false));
      })
      .finally(() => {
        // console.log("finally finished");
        dispatch(setLoadingCategory(false));
      });
  }, [dispatch]);

  // const [imageUrl, setImageUrl] = useState([""]);
  // const [targetImage, setTargetImage] = useState(null);
  // const handleChangeImage = (e, index) => {
  //   const uploadImage = e.target.files[0];
  //   setTargetImage(uploadImage);
  //   console.log(URL.createObjectURL(e.target.files[0]));
  //   setImageUrl(URL.createObjectURL(e.target.files[0]));
  //   const formData = new FormData();
  //   formData.append("image", e.target.files[0]);
  // };

  for (var i = 0; i < inputFields.length; i++) {
    console.log(inputFields[i].image);
  }
  // ============================= open category =============================
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const handleShowCategory = () => {
    setIsOpenCategory(!isOpenCategory);
  };
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000); // Delay of 500 milliseconds

    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      className={`dark:text-white transition ${
        isOpen
          ? " transition-all ease-in-out delay-300 duration-1000 "
          : "opacity-0 scale-95 translate-y-1/2 "
      }`}
    >
      <div className="bg-white h-min-screen rounded-lg w-full shadow-md">
        <div className="w-[90%] h-min-screen m-auto relative pb-10">
          {/* Header */}
          <div className="">
            <h1 className="text-primaryColor text-4xl text-center font-medium py-8">
              Add New Product
            </h1>
          </div>
          <hr className="border border-gray-200" />
          {/* form */}
          <div className="">
            <form onSubmit={submit}>
              {inputFields.map((input, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-5 border border-1 rounded-lg  p-10 mb-5"
                >
                  {/* Field input */}
                  <div className="col-span-4">
                    {/* Product */}
                    <div>
                      <label
                        className="block relative uppercase tracking-wide text-gray-700 font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Product Name
                        {/* {errorAdd === '' ? null : <span className="text-sm lowercase font-medium text-red-600 absolute right-1 top-10">{errorAdd}</span>} */}
                      </label>
                      <input
                        value={input.name}
                        onChange={(event) => handleFormChange(index, event)}
                        className="appearance-none block w-full  text-gray-700 border border-gray-300 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:ring-primary focus:bg-white focus:border-primary"
                        // className={`${errorAdd === '' ? " appearance-none block w-full text-gray-700 border border-gray-300 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:ring-primary focus:bg-white focus:border-gray-500" :"appearance-none block w-full text-gray-700 border border-red-600 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:ring-red-600 focus:bg-white focus:border-gray-500"}`}
                        name="name"
                        type="text"
                        placeholder="Product Name"
                      />
                    </div>
                    {/* qty & price */}
                    <div className="flex flex-wrap -mx-3 ">
                      {/* qty */}
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <label
                          className="relative block uppercase tracking-wide text-gray-700  font-bold mb-2"
                          htmlFor="grid-first-name"
                        >
                          Quantity
                        </label>
                        <input
                          className="appearance-none block w-full text-gray-700 border border-gray-300 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:ring-primary focus:bg-white focus:border-primary"
                          name="qty"
                          type="number"
                          // pattern="[0-9]*"
                          value={
                            input.qty === "" || Number.isNaN(Number(input.qty))
                              ? ""
                              : input.qty
                          }
                          onChange={(event) => handleFormChange(index, event)}
                          placeholder="Quantity"
                        />
                      </div>
                      {/* Price */}
                      <div className="w-full md:w-1/2 px-3 relative">
                        {/* <img
                            src={(require("../../assets/images/distributor/dollar.png")?.default || require("../../assets/images/distributor/dollar.png"))}
                            className="absolute top-11 left-6 "
                            alt=""
                          /> */}
                        <label
                          className="block uppercase tracking-wide text-gray-700  font-bold mb-2"
                          htmlFor="grid-last-name"
                        >
                          Price
                        </label>
                        <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 fill-white text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                  <div className="w-full">
                    <input
                       name="price"
                       type="number"
                       value={input.price}
                       onChange={(event) => handleFormChange(index, event)}
                       placeholder="Price"
                      className="rounded-none rounded-r border text-gray-900 focus:ring-primary focus:border-primary block flex-1 min-w-0 w-full text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />
                  </div>
                </div>
                        {/* <input
                          className="appearance-none block w-full text-gray-700 border border-gray-300 rounded py-2 px-4 pl-10 mb-3 leading-tight focus:outline-none focus:ring-primary focus:bg-white focus:border-primary"
                          name="price"
                          type="number"
                          value={input.price}
                          onChange={(event) => handleFormChange(index, event)}
                          placeholder="Price"
                        /> */}
                      </div>
                    </div>
                    {/* category */}
                    <div className="flex flex-wrap -mx-3">
                      <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <label
                          className="block uppercase tracking-wide text-gray-700  font-bold mb-2"
                          htmlFor="grid-state"
                        >
                          Category
                        </label>
                        <div className="relative">
                          <select
                            className="appearance-none capitalize block w-full text-gray-700 border border-gray-300 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:ring-primary focus:bg-white focus:border-primary"
                            name="categoryId"
                            type="text"
                            value={input.categoryId}
                            onChange={(event) => handleFormChange(index, event)}
                            placeholder="Category ID"
                            // value={input.categoryId}
                          >
                            <option disabled value="">
                              -- please select --
                            </option>
                            {categoryData.map((item, index) => (
                              <option
                                key={item.id ?? `${item.name}-${index}`}
                                value={item.id}
                                className="hover:bg-primary"
                              >
                                {item.name}
                              </option>
                            ))}
                          </select>

                          <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-2 text-gray-700">
                            {/* <img
                                src={(require("../../assets/images/distributor/down_arrow.png")?.default || require("../../assets/images/distributor/down_arrow.png"))}
                                alt=""
                              /> */}
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 px-3 mt-2 md:mb-0">
                        <button
                          type="button"
                          onClick={handleShowCategory}
                          className="inline-block rounded bg-primary mt-6 px-9 py-[8px]  font-medium  leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                        >
                          Add new{" "}
                        </button>
                      </div>
                      <CategoryComponent
                        isOpenCategory={isOpenCategory}
                        handleShowCategory={handleShowCategory}
                      />
                    </div>
                    <div className="relative mb-6">
                      <label
                        className="block uppercase tracking-wide text-gray-700  font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        description
                      </label>
                      <textarea
                        className="appearance-none block w-full text-gray-700 border border-gray-300 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:ring-primary focus:bg-white focus:border-primary"
                        name="description"
                        value={input.description}
                        onChange={(event) => handleFormChange(index, event)}
                        rows="10"
                        placeholder="Description..."
                      />
                    </div>
                  </div>
                  {/* image */}
                  <div className=" col-span-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor={`dropzone-file${index}`}
                        // {...getRootProps({ className: "dropzone" })}
                        className="flex flex-col items-center justify-center  bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                      >
                        {input.imageUrl === "" || input.imageUrl === null ? (
                          <>
                            <div className="flex flex-col items-center justify-center w-full px-14 h-64 border-2 border-primaryColor border-dashed rounded-lg cursor-pointer">
                              <img
                                src={(require("../../assets/images/distributor/image.png")?.default || require("../../assets/images/distributor/image.png"))}
                                alt=""
                              />
                              <p className="mb-2  text-center text-gray-500 dark:text-gray-400">
                                <span className="font-semibold text-primaryColor">
                                  Click to upload &nbsp;
                                </span>
                                or <br />
                                drag and drop
                              </p>
                            </div>
                          </>
                        ) : (
                          <img
                            src={input.imageUrl}
                            className="h-[260px] w-auto rounded-lg "
                          />
                        )}
                        {/* <p className=" text-gray-500 dark:text-gray-400">
                          SVG, PNG, JPG or GIF (MAX. 800x400px)
                        </p> */}

                        <input
                          id={`dropzone-file${index}`}
                          // {...getInputProps()}
                          name="image"
                          type="file"
                          value={input.image}
                          onChange={(event) => handleFormChange(index, event)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* visibility */}
                    <div className="mt-44 relative">
                      <label
                        className="block text-3xl  tracking-wide text-primaryColor font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Visibility
                      </label>
                      <div className="hs-tooltip flex items-center">
                        {/* visible */}
                        <label
                          key={index}
                          className="relative inline-flex items-center mr-5 cursor-pointer"
                        >
                          <input
                            className="sr-only peer border border-primary"
                            name="isPublish"
                            type="checkbox"
                            checked={input.isPublish}
                            onChange={() => handleToggle(index)}
                          />
                          <div className="w-11 h-6 rounded-full peer bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primaryColor"></div>
                          {input.isPublish ? (
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              Visibility
                            </span>
                          ) : (
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              Invisibility
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFields(index)}
                      type="button"
                      className="float-right -mb-10 flex text-lg items-center rounded-lg bg-[#FF7272] px-2 py-2 font-medium leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    >
                      <img
                        src={(require("../../assets/images/distributor/delete_white.png")?.default || require("../../assets/images/distributor/delete_white.png"))}
                        alt=""
                      />
                    </button>
                  </div>
                  {/* <input
                    name="image"
                    type="file"
                    value={input.image}
                    onChange={(event) => handleFormChange(index, event)}
                    placeholder="Image URL"
                  /> */}
                  {/* <label>
                    <input
                      name="isPublish"
                      type="checkbox"
                      checked={input.isPublish}
                      onChange={() => handleToggle(index)}
                    />
                    Publish
                  </label> */}
                  {/* <button type="button" onClick={() => removeFields(index)}>
                    Remove
                  </button> */}
                </div>
              ))}
              {errors.length > 0 && (
                <div>
                  <ul>
                    {errors.map((error, index) => (
                      <li key={index}>
                        {/* {toast.error(error)} */}

                        <div
                          
                          className="text-white py-2 rounded-lg bg-red-600 flex justify-center"
                        >
                          {error}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <ToastContainer />
              {/* add more button */}
              <div
                className="border border-1 rounded-lg py-3 px-5 cursor-pointer w-52"
                onClick={addFields}
              >
                <div className="flex items-center justify-center gap-3">
                  <img
                    className=""
                    src={(require("../../assets/images/distributor/add_more.png")?.default || require("../../assets/images/distributor/add_more.png"))}
                    alt=""
                  />
                  <p className="text-[#777777] font-medium">Add more</p>
                </div>
              </div>
              {/* <button type="submit">Submit</button> */}
              <div className="w-full flex justify-end gap-3 mb-5">
                {loading ? (
                  <button
                    type="button"
                    className="col-span-2 flex text-lg justify-center  items-center gap-3 rounded-lg bg-primary w-32  px-2 py-2 font-medium leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    href="#"
                  >
                    <span
                      className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
                      role="status"
                      aria-label="loading"
                    >
                      <span className="sr-only">Loading...</span>
                    </span>
                    Saving...
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="col-span-2 flex justify-center text-lg items-center gap-3 rounded-lg bg-primary w-32 px-2 py-2 font-medium leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  >
                    <img
                      src={(require("../../assets/images/distributor/save.png")?.default || require("../../assets/images/distributor/save.png"))}
                      alt=""
                    />{" "}
                    Save
                  </button>
                )}

                <Link
                  to="/distributor/product"
                  type="button"
                  className="col-span-2 flex text-lg justify-center items-center gap-3 rounded-lg bg-[#FF7272] w-32 px-2 py-2 font-medium leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                >
                  <img
                    src={(require("../../assets/images/distributor/close_white.png")?.default || require("../../assets/images/distributor/close_white.png"))}
                    alt=""
                  />{" "}
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
