import React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export default function RetailProduct(props) {
    const [isOpen,setOpen]=useState(false);
    const orderList=useSelector((state)=>state.orderDetail.data);
    console.log("orderList",orderList);
  return (
    <div>
        <React.Fragment>
            {/* <button onClick={() => setOpen(!isOpen)}>
                <svg
                    className="w-6 h-6"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                </svg>
            </button> */}
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
                    <div>
                        {/* {pro.map((item)=>( */}
                         <div>   
                        <div className='w-full rounded-lg border border-gray-400 mt-3'>
                            <div className='flex flex-wrap p-4'>
                                <div className='w-3/5'>
                                    <h1 className='text-black font-semibold text-base'>Order ID: #<span></span></h1>
                                    <p className='text-sm'>Order date : <span></span></p>
                                </div>
                                <div className='w-2/5 justify-end '>
                                    <p className='text-retailerPrimary text-end font-semibold'>Order Detail</p>
                                </div>
                            </div>
                            <hr className='bg-gray-500' />
                            <div className='flex flex-wrap p-4'>
                                <div className='w-4/5 flex'>
                                    <img className="w-20 h-20 " src={(require("../../assets/images/login.jpg")?.default || require("../../assets/images/login.jpg"))} alt="Jese image" />
                                    <div className="pl-3">
                                        <div className="text-base font-semibold text-black">
                                            {/* {itename} */}
                                        </div>
                                        <div className="text-sm text-newGray">
                                            {/* {itemcate} */}
                                        </div>
                                    </div>
                                </div>
                                <div className='w-1/5 justify-end  text-end'>
                                    <h1 className='text-black font-semibold'>
                                        {/* ${item.price} */}
                                    </h1>
                                    <p className='text-newGray text-sm'>
                                        {/* Qty: {item.qty} */}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='w-full rounded-lg border border-gray-400 mt-3'>
                            <div className='flex flex-wrap p-4'>
                                <h1 className='text-xl text-black font-semibold'>Track your order</h1>
                            </div>
                            <div className='w-96 flex justify-center mx-auto relative -mt-6'>
                                <hr className='border-dashed rounded-full w-24 left-16 border-2 absolute border-retailerPrimary top-9' />
                                <hr className='border-dashed rounded-full w-24 right-20 border-2 absolute border-newGray top-9' />
                                <div className='flex flex-col p-4 w-32 items-center'>
                                    <div className='w-12 h-12 border-4 border-orange-200  rounded-full bg-retailerPrimary mr-5'>
                                        <svg className='fill-white absolute w-6 ml-2 mt-2' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M190.5 68.8L225.3 128H224 152c-22.1 0-40-17.9-40-40s17.9-40 40-40h2.2c14.9 0 28.8 7.9 36.3 20.8zM64 88c0 14.4 3.5 28 9.6 40H32c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32H480c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32H438.4c6.1-12 9.6-25.6 9.6-40c0-48.6-39.4-88-88-88h-2.2c-31.9 0-61.5 16.9-77.7 44.4L256 85.5l-24.1-41C215.7 16.9 186.1 0 154.2 0H152C103.4 0 64 39.4 64 88zm336 0c0 22.1-17.9 40-40 40H288h-1.3l34.8-59.2C329.1 55.9 342.9 48 357.8 48H360c22.1 0 40 17.9 40 40zM32 288V464c0 26.5 21.5 48 48 48H224V288H32zM288 512H432c26.5 0 48-21.5 48-48V288H288V512z" /></svg>
                                    </div>
                                    <p className='text-xs mt-3'>Preparing</p>
                                </div>
                                <div className='flex flex-col p-4 w-32 items-center'>

                                    <div className='w-12 h-12 border-4 border-gray-300 rounded-full bg-newGray mr-5'>
                                        <svg className='fill-white w-7 mt-2 ml-1.5 absolute' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" /></svg>
                                    </div>
                                    <p className='text-xs mt-3'>Shipping</p>
                                </div>
                                <div className='flex flex-col p-4 w-32 items-center'>
                                    <div className='w-12 h-12 border-4 border-gray-300  text-center rounded-full bg-newGray mr-5'>
                                        <svg className='fill-white w-6 mt-2 ml-2 absolute bg-newGray' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" /></svg>
                                    </div>
                                    <p className='text-xs mt-3'>Delivered</p>
                                </div>
                            </div>
                        </div>
                        <div className='w-full rounded-lg border border-gray-400 mt-3'>
                            <div className='flex flex-wrap w-full'>
                                <div className='w-2/12  p-4'>
                                    <img className='w-16' src={(require("../../assets/images/rating 1.png")?.default || require("../../assets/images/rating 1.png"))} alt="" />
                                </div>
                                <div className='w-7/12 p-4'>
                                    <div className=''>
                                        <h1 className='text-black font-semibold'>Don’t forget to rate  </h1>
                                        <p className='text-xs'>Keep rating us for providing good service</p>
                                    </div>
                                    <div className='flex flex-wrap mt-1'>
                                        <svg className='w-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" /></svg>
                                        <svg className='w-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" /></svg>
                                        <svg className='w-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" /></svg>
                                        <svg className='w-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" /></svg>
                                    </div>
                                </div>
                                <div className='w-3/12 p-4 mt-4'>
                                    <button onClick={()=>setOpen(!isOpen)} className='bg-newGray text-white w-full rounded-lg py-2'>Confirm</button>
                                </div>
                            </div>
                        </div>
                        </div>
                        {/* ))} */}
                    </div>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    </div>
  )
}
