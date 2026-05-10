import React from 'react'
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { get_detail_product } from '../../../redux/services/distributor/product.service';
import { getProductDetail } from '../../../redux/slices/distributor/productSlice';
import { Backdrop,CircularProgress } from '@mui/material';
import { PropagateLoader } from "react-spinners"
export default function Product(props) {
    const formatMoney = (value) => {
        const number = Number(value);
        return Number.isFinite(number) ? number.toFixed(2) : "0.00";
    };
    const [isOpen, setOpen] = useState(false);
    const [decline, setDecline] = useState(false);
    const productList = useSelector((state) => state.product.orderProducts);
    const pageCount = Math.ceil(productList.length / 6);
    const dispatch = useDispatch();
    const detailProduct = (id) => {
        get_detail_product(id).then((r) => dispatch(getProductDetail(r.data.data.products)))
    }
    return (
        <div>
            <React.Fragment>
                <Dialog
                    open={props.isOpen}
                    onOpenChange={(open) => { if(!open) props.handlePro() }}
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
                                    {! props.loadingPro ?
                                    productList.map((item,index) => (
                                        <tr key={index} className="bg-white border-b text-black  text-sm">
                                            <td
                                                scope="row"
                                                className="px-6 py-2 0 whitespace-nowrap "
                                            >
                                                {index+1}
                                            </td>
                                            <td
                                                scope="row"
                                                className="flex items-center px-6 py-2 whitespace-nowrap"
                                            >
                                                {/* <img
                                                className="w-10 h-10 rounded-full border-primary border p-1"
                                                // src={(require("../../../assets/images/Landing/logo.png")?.default || require("../../../assets/images/Landing/logo.png"))}
                                                src={item.image}
                                                alt="images"
                                            /> */}
                                                {item.image && item.image!=="String" ? (
                                                    <img src={item.image} alt="upload image" className="w-10 h-10 rounded-full  p-1" />
                                                ) : (
                                                    // <div className='flex flex-col'>
                                                    <img src={(require("../../../assets/images/image 7.png")?.default || require("../../../assets/images/image 7.png"))} className="w-10 h-10 rounded-full border-primary border p-1" alt="upload" />
                                                    // <p className='text-primary ml-12'>Click to upload <span className='text-newGray font-semibold text-center '><br />or drag to drop</span></p>
                                                    // </div>
                                                )}
                                                <div className="pl-3">
                                                    <div className="text-sm">
                                                        {item.productName}
                                                    </div>
                                                    <div className="font-normal text-xs text-newGray">
                                                        {/* {item.category.name} */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                {item.qty}
                                            </td>
                                            <td className="px-6 py-2">
                                                {item.inStock}
                                            </td>
                                            <td className="px-6 py-2">
                                            ${formatMoney(item.unitPrice)}
                                            </td>
                                            <td className="px-6 py-4">
                                            ${formatMoney(item.subTotal)}
                                            </td>
                                        </tr>
                                    ))
                                    : <tr><td colSpan={7} className="text-center py-10">
                                        <PropagateLoader color="#0F766E" />
                                      </td></tr>
                        }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DialogContent>
                </Dialog>
            </React.Fragment>
        </div>
        
    )
}
