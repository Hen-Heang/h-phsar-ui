import React from 'react'
import { useSelector } from 'react-redux';
import { PropagateLoader } from 'react-spinners';
import noImage from "../../assets/images/retailer/No_image_available.png";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export default function ProductDetail(props) {
    const orderList = useSelector((state) => state.orderDetail.data);
    return (
        <div>
            <React.Fragment>
                <Dialog
                    open={props.isOpen}
                    onOpenChange={(open) => { if(!open) props.handleOpen() }}
                >
                    <DialogContent className="max-w-2xl">
                        <DialogHeader className="bg-retailerPrimary w-full p-4">
                            <DialogTitle className="text-center text-white font-semibold w-full text-xl">
                                Products
                            </DialogTitle>
                        </DialogHeader>
                        <div className="sm:rounded-lg mt-4 relative h-[400px] overflow-y-auto">
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
                                <tbody className="text-black">
                                    {! props.loadingPro ?
                                    orderList.map((item, index) => (
                                        <tr key={item.id ?? index} className="bg-white border-b text-black  text-sm">
                                        <td
                                            scope="row"
                                            className="px-6 py-3 0 whitespace-nowrap "
                                        > { (index+1)}  
                                        </td>
                                        <td
                                            scope="row"
                                            className="flex items-center px-6 py-3 whitespace-nowrap"
                                        >
                                            {item.image ? (
                                                <img
                                                  src={getSafeImageSrc(item.image, noImage)}
                                                  onError={(e) => applyImageFallback(e, noImage)}
                                                  alt="upload image"
                                                  className="w-10 h-10 rounded-full p-1"
                                                />
                                            ) : (
                                                <img
                                                  className="w-10 h-10 rounded-full p-1"
                                                  alt="upload"
                                                  src={noImage}
                                                />
                
                                            )}
                                            <div className="pl-3">
                                                <div className="text-sm">
                                                    {item.productName}
                                                </div>
                                                <div className="font-normal text-xs text-newGray">
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            {(item.qty)}
                                        </td>
                                        <td className="px-6 py-3">
                                            {item.inStock}
                                        </td>
                                        <td className="px-6 py-3">
                                            ${(item.unitPrice).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3">
                                            ${(item.subTotal).toFixed(2)}
                                        </td>
                                    </tr>
                                    ))
                                    : <tr><td colSpan={6} className="py-16 text-center"><PropagateLoader color="#F15B22" /></td></tr>
                                }
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        </div>
    )
}
