import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
export default function DraftProduct(props) {
    return (
        <div>
            <React.Fragment>
                <Dialog
                    open={props.isOpen}
                    onOpenChange={(open) => { if(!open) props.handleOpen() }}
                >
                    <DialogContent className="max-w-2xl">
                        <DialogHeader className="text-center bg-retailerPrimary w-full p-4">
                            <DialogTitle className="text-center text-white font-semibold w-full text-xl">
                                Products
                            </DialogTitle>
                        </DialogHeader>
                        <div className="">
                            <div className="shadow-md sm:rounded-lg mt-4 relative overflow-y-auto">
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
                                        {props.product.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.productId}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button  className="bg-retailerPrimary text-md text-white rounded-md w-24 ml-2  py-[6px] mt-4">
                                    Check Out
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        </div>
    )
}
