import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PropagateLoader } from "react-spinners";
import { useSelector } from "react-redux";
export default function ProdunctNewOrder(props) {
  const formatMoney = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : "0.00";
  };

  const productList = useSelector((state) => state.product.product);
  return (
    <div>
      <React.Fragment>
        <Dialog
          open={props.isOpen}
          onOpenChange={(open) => {
            if (!open) props.handlePro();
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader className="text-center bg-primary w-full p-4">
              <DialogTitle className="text-center text-white font-semibold w-full text-xl">
                Products
              </DialogTitle>
            </DialogHeader>
            <div className="">
              <div className="shadow-md sm:rounded-lg mt-4 relative overflow-y-auto h-[400px]">
                <table className="w-full text-sm text-left text-newGray">
                  <thead className="text-xs text-black bg-newWhite shadow-md border-spacint">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        No
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Products
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Qty
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Unitprice
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-black w-full bg-slate-50">
                    {!props.loadingPro ? (
                      productList.map((item, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b text-black  text-sm"
                        >
                          <td
                            scope="row"
                            className="px-6 py-2 0 whitespace-nowrap "
                          >
                            {index + 1}
                          </td>
                          <td
                            scope="row"
                            className="flex items-center px-6 py-2 whitespace-nowrap"
                          >
                            {item.image && item.image !== "String" ? (
                              <img
                                src={item.image}
                                alt="upload image"
                                className="w-10 h-10 rounded-full  p-1"
                              />
                            ) : (
                              <img
                                src={
                                  require("../../../assets/images/image 7.png")
                                    ?.default ||
                                  require("../../../assets/images/image 7.png")
                                }
                                className="w-10 h-10 rounded-full border-primary border p-1"
                                alt="upload"
                              />
                            )}
                            <div className="pl-3">
                              <div className="text-sm">{item.productName}</div>
                              <div className="font-normal text-xs text-newGray">
                                {/* {item.category.name} */}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-2">{item.qty}</td>
                          <td className="px-6 py-2">{item.inStock}</td>
                          <td className="px-6 py-2">
                            ${formatMoney(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4">
                            ${formatMoney(item.subTotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <div className="w-full mx-auto text-center absolute mt-24 ">
                        <PropagateLoader color="#0F766E" />
                      </div>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="w-full justify-end flex mt-8 h-8">
                {!props.loadingPro ? (
                  <div>
                    <button
                      onClick={props.delete}
                      className="text-white text-md mr-2 bg-newRed rounded-md w-20 py-[4px]"
                    >
                      Decline
                    </button>
                    <button
                      onClick={props.handleAccept}
                      className="bg-newGreen text-md text-white rounded-md w-20 py-[4px]"
                    >
                      {" "}
                      Accept
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </React.Fragment>
      {/* delete */}
      <React.Fragment>
        <Dialog
          open={props.isDelete}
          onOpenChange={(open) => {
            if (!open) props.delete();
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="sr-only">Confirm Decline</DialogTitle>
            </DialogHeader>
            <div className=" mx-auto text-center ">
              <div className="mx-auto rounded-full w-20 h-20 justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mx-auto text-white fill-primary w-18 h-18 mb-4 mt-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="w-96 mx-auto">
                <h3 className="mb-2 text-lg  text-black">
                  Are you sure you want to decline ?
                </h3>
                <p className="text-gray-500 text-sm">
                  If you choose confirm order will be decline{" "}
                </p>
                <p className="text-sm text-gray-500">
                  and deleted from your order.{" "}
                </p>
                <div className="flex justify-center gap-2 w-full mt-5 mb-5 p-3 ">
                  <button
                    className="py-1 text-sm rounded w-32 text-white bg-primary hover:bg-[#0f7884] justify-center mr-5"
                    onClick={props.handleDelete}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={props.delete}
                    className="text-semibold text-sm py-1 text-center w-32 item-center rounded border border-primary  text-primary hover:bg-primary hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    </div>
  );
}
