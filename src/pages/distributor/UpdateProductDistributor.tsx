"use client";

import React, { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import Switch from "react-switch";
import { CircleDollarSign, ChevronDown, Save, X } from "lucide-react";

const UpdateProductDistributor = () => {
  const [storeDataUpdate, setStoreDataUpdate] = useState([]);
  const [checked, setChecked] = useState(false);
  const handleChange = (nextChecked) => {
    setChecked(nextChecked);
  };

  // get data update
  const { DataUpdateProduct } = useSelector((state) => state.DataUpdateProduct);

  return (
    <div>
      <div className="border-0  rounded-lg relative  flex flex-col w-full bg-white outline-none focus:outline-none">
        {/*header*/}
        {/*body*/}
        <div className="relative flex-auto">
          <div className="">
            <h1 className="text-primaryColor text-3xl text-center font-medium py-5">
              Add New Product
            </h1>
          </div>
          <hr className="border border-gray-200" />
          <div className="justify-center items-center m-auto ">
            <form className="w-full m-auto mt-10 ">
              <div className="grid grid-cols-6 gap-5 border border-1 rounded-lg  p-10 ">
                {/* Field input */}
                <div className="col-span-4">
                  {/* Product */}
                  <div>
                    <label
                      className="block uppercase tracking-wide text-gray-700 text-sm  font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Product Name
                    </label>
                    <input
                      className="appearance-none block w-full text-gray-700 border border-gray-400 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      name="productName"
                      type="text"
                      // value={DataUpdateProduct.product_name}
                      placeholder="Product Name"
                    />
                  </div>
                  {/* qty & price */}
                  <div className="flex flex-wrap -mx-3 ">
                    {/* qty */}
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-sm  font-bold mb-2"
                        htmlFor="grid-first-name"
                      >
                        Quantity
                      </label>
                      <input
                        className="appearance-none block w-full text-gray-700 border border-gray-400 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        type="text"
                        name="qty"
                        // value={DataUpdateProduct.qty}
                        placeholder="Quantity"
                      />
                    </div>
                    {/* Price */}
                    <div className="w-full md:w-1/2 px-3 relative">
                      <CircleDollarSign className="absolute top-10 left-6 text-gray-400 w-5 h-5" />
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-sm  font-bold mb-2"
                        htmlFor="grid-last-name"
                      >
                        Price
                      </label>
                      <input
                        className="appearance-none block w-full text-gray-700 border border-gray-400 rounded py-2 px-4 pl-10 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        type="text"
                        name="price"
                        // value={DataUpdateProduct.unit_price}
                        placeholder="00.00"
                      />
                    </div>
                  </div>
                  {/* category */}
                  <div className="flex flex-wrap -mx-3">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-sm  font-bold mb-2"
                        htmlFor="grid-state"
                      >
                        Category
                      </label>
                      <div className="relative">
                        <select
                          className="appearance-none block w-full text-gray-700 border border-gray-400 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          id="grid-state"
                          name="category"
                          defaultValue=""
                        >
                          <option disabled value="">
                            {/* {DataUpdateProduct.category} */}
                          </option>
                          <option value="Beverage">Beverage</option>
                          <option value="Water">Water</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-2 text-gray-700">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    {/* button add new category */}
                    <div className="w-full md:w-1/2 px-3 mt-1 md:mb-0">
                      <button
                        type="button"
                        data-te-ripple-init
                        data-te-ripple-color="light"
                        className="inline-block rounded bg-primary mt-6 px-9 py-[8px]  font-medium  leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] 0_4px_9px_-4px_rgba(59,113,202,0.5)] 0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] 0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] 0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                      >
                        Add new
                      </button>
                    </div>
                  </div>
                  {/* description */}
                  <div className="relative">
                    <label
                      className="block uppercase tracking-wide text-gray-700 text-sm  font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      description
                    </label>
                    <textarea
                      value={DataUpdateProduct.description}
                      className="appearance-none block w-full text-gray-700 border border-gray-400 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      name="description"
                      rows="10"
                      placeholder="Description..."
                    />
                  </div>
                </div>
                {/* image */}
                <div className=" col-span-2">
                  <div className="flex items-center justify-center w-full">
                    <img
                      src={
                        require("../../assets/images/distributor/test_product.png")
                          ?.default ||
                        require("../../assets/images/distributor/test_product.png")
                      }
                      className="flex flex-col items-center justify-center w-full h-64  rounded-lg cursor-pointer bg-gray-50   hover:bg-gray-100   "
                    />
                  </div>
                  <input
                    className="mt-10 block w-full text-sm text-[#777] border border-gray-300 rounded-lg cursor-pointer bg-gray-50  focus:outline-none   "
                    id="file_input"
                    type="file"
                  />

                  {/* visibility */}
                  <div className="relative mt-[78px]">
                    <label
                      className="block text-3xl  tracking-wide text-primaryColor font-bold mb-2"
                      htmlFor="grid-password"
                    >
                      Visibility
                    </label>
                    <div className="hs-tooltip flex items-center">
                      <Switch
                        // onChange={(event) => handleFormChange(index, event)}
                        onChange={handleChange}
                        checked={checked}
                        className="react-switch"
                      />

                      <label
                        htmlFor="hs-tooltip-example"
                        className="text-sm text-gray-500 ml-3 "
                      >
                        {/* Allow push notifications {checked ? "on" : "off"} */}
                      </label>
                    </div>{" "}
                  </div>
                </div>
              </div>
              {/* button save and cancel */}
              <div className="mt-3 w-full flex justify-end gap-3 mb-3">
                <button
                  type="submit"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                  className="col-span-2 flex text-lg items-center gap-3 rounded-lg bg-primary px-3 py-2 font-medium leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] 0_4px_9px_-4px_rgba(59,113,202,0.5)] 0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] 0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] 0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
                <Link
                  href="/distributor/product"
                  className="col-span-2 flex text-lg items-center gap-3 rounded-lg bg-[#FF7272] px-3 py-2 font-medium leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] 0_4px_9px_-4px_rgba(59,113,202,0.5)] 0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] 0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] 0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                >
                  <X className="w-5 h-5" />
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

export default UpdateProductDistributor;
