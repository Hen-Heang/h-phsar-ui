import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { PropagateLoader } from "react-spinners";
export default function Invoice(props) {
  const invoiceList = useSelector((state) => state.invoiceDis.data);
  const invoiceOrder = useSelector((state) => state.invoiceDis.dataOrder);
  const dispatch = useDispatch();
  const safeInvoiceList = Array.isArray(invoiceList) ? invoiceList : [];
  const formatMoney = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
  };
  const invoiceDate = invoiceOrder?.date
    ? new Date(invoiceOrder.date).toLocaleDateString("en-US")
    : "";
  return (
    <div>
      <React.Fragment>
        <Dialog
          open={props.invoice}
          onOpenChange={(open) => {
            if (!open) props.handleInvoice();
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="sr-only">Invoice</DialogTitle>
            </DialogHeader>
            <div>
              {!props.loadingInvoice ? (
                <div style={{ width: "100%" }}>
                  <div ref={props.invoiceRef} className="p-4 py-6">
                    <div className="flex  bg-white -mt-5">
                      <div className="w-2/3 flex flex-wrap text-black">
                        <div className="w-16 h-16 rounded-lg ">
                          <img
                            className="w-full h-full rounded-lg"
                            src={invoiceOrder?.storeImage}
                            alt="store image"
                          />
                        </div>
                        <div className="w-30 text-black font-medium ml-2 ">
                          <p className="text-lg font-semibold">
                            {invoiceOrder?.storeName}
                          </p>
                          <p className="text-xs">
                            {invoiceOrder?.storeAddress}
                          </p>
                        </div>
                      </div>
                      <div className="w-1/3 justify-between font-medium text-xs">
                        <h1 className="text-primary lg:text-2xl text-xl">
                          INVOICE
                        </h1>
                        <p className="">Invoice Number: #{invoiceOrder?.id}</p>
                        <p>Invoice Date: {invoiceDate}</p>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-primary mt-4"></div>
                    <div className="flex bg-white mt-4">
                      <div className="w-2/3 text-xs  text-black">
                        <p className="text-xs text-primary">Invoice To:</p>
                        <p className="text-sm font-semibold">
                          {invoiceOrder?.name}
                        </p>
                        <p className="text-xs">
                          Phone: {invoiceOrder?.retailerPhone}
                        </p>
                        <p>Email: {invoiceOrder?.retailerEmail} </p>
                      </div>
                      <div className="w-1/3 justify-between text-xs">
                        <h1 className="text-primary text-xs">Invoice From:</h1>
                        <p className="text-sm font-semibold">
                          {invoiceOrder?.storeName}
                        </p>
                        <p>Phone: {invoiceOrder?.storePrimaryPhone}</p>
                        <p className="text-xs  line-clamp-3 w-full ">
                          Email:{invoiceOrder?.storeEmail}
                        </p>
                      </div>
                    </div>
                    <div className="relative mt-4">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-white bg-primary uppercase ">
                          <tr>
                            <th
                              scope="col"
                              className="px-2 py-3 bg-primary text-white"
                            >
                              No
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 bg-primary text-white "
                            >
                              Product
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Price
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Qty
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {safeInvoiceList.map((item, index) => (
                            <tr className=" border-b text-black " key={index}>
                              <td
                                scope="row"
                                className="px-3 py-4 text-black whitespace-nowrap "
                              >
                                {index + 1}
                              </td>
                              <td className="px-6 py-4">{item.productName}</td>
                              <td className="px-6 py-4 ">
                                ${formatMoney(item.unitPrice)}
                              </td>
                              <td className="px-6 py-4">{item.qty}</td>
                              <td className="px-6 py-4">
                                ${formatMoney(item.subTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end mt-4 px-4"></div>
                    <hr className="border border-dashed text-black" />
                    <div className="flex justify-end mt-4">
                      <div className="w-1/2 text-black font-semibold">
                        Total price
                      </div>
                      <div className="w-1/2 flex text-end justify-end font-semibold text-primary">
                        ${formatMoney(invoiceOrder?.total)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end px-4">
                    <button
                      onClick={props.hanldePrint}
                      className="text-center text-white py-1.5 w-24 rounded-sm bg-newGreen items-center text-xs "
                    >
                      Export invoice
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative h-[580px]">
                  <div className="flex  bg-white -mt-5]">
                    <div className="w-2/3 flex flex-wrap text-black">
                      <div className="w-16 h-16 rounded-lg bg-slate-300"></div>
                      <div className="w-30 text-black font-medium ml-2 mt-1">
                        <p className="text-sm font-semibold w-24 h-2 bg-slate-300 rounded-lg"></p>
                        <p className="text-xs element w-28 h-2 bg-slate-300 rounded-lg mt-2"></p>
                      </div>
                    </div>
                    <div className="w-1/3 justify-between font-medium text-xs">
                      <h1 className="text-primary text-2xl">INVOICE</h1>
                      <p>
                        Invoice Number:
                        <span className="w-28 h-2 bg-slate-300 rounded-lg "></span>
                      </p>
                      <p>Invoice Date:</p>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-primary mt-2"></div>
                  <div className="flex bg-white mt-2">
                    <div className="w-2/3 text-xs  text-black">
                      <p className="text-xs text-primary">Invoice To:</p>
                      <p className="text-sm text-semibold"></p>
                      <p className="text-xs">Phone: </p>
                      <p>Email: </p>
                    </div>
                    <div className="w-1/3 justify-between text-xs">
                      <h1 className="text-primary text-xs">Invoice From:</h1>
                      <p className="text-sm"></p>
                      <p>Phone: </p>
                      <p className="line-clamp-1 overflow-hidden">Email:</p>
                    </div>
                  </div>
                  <div className="relative overflow-x-auto h-[400px] mt-2">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-white bg-primary uppercase ">
                        <tr>
                          <th scope="col" className="px-2 py-3  text-white">
                            No
                          </th>
                          <th scope="col" className="px-6 py-3 text-white ">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Price
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Qty
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Total
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div className="w-full mx-auto top-64 absolute text-center ">
                    <PropagateLoader color="#0F766E" />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    </div>
  );
}
