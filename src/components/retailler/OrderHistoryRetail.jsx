import React, { useEffect, useRef, useState } from 'react'
import RetailerInvoice from './RetailerInvoice';
import { get_all_history } from '../../redux/services/retailer/history.service';
import { useDispatch, useSelector } from 'react-redux';
import { getAllHistory, setLoadingHistoryRetail } from '../../redux/slices/retailer/historySlice';
import noImage from '../../assets/images/no_image.jpg';
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import ReactPaginate from 'react-paginate';
import { useReactToPrint } from 'react-to-print';
import { get_invoice } from '../../redux/services/retailer/invoice.service';
import { getInvoice, getOrderInvoice } from '../../redux/slices/retailer/invoiceRetailerSlice';
import ProductDetail from './ProductDetail';
import { get_orderById } from '../../redux/services/retailer/orderDetail.service';
import { getOrderById } from '../../redux/slices/retailer/orderDetailSlice';
import { setLoading } from '../../redux/slices/distributor/productSlice';
import { setLoadingOrder } from '../../redux/slices/retailer/orderSlice';
import { PropagateLoader } from "react-spinners";
import { toast } from "react-toastify"
export default function OrderHistoryRetail() {
  useEffect(() => {
    document.title = "H-Phsar | Order-History";
  }, []);
  const orderHistory = useSelector((state) => state.history.data);
  const dispatch = useDispatch();
  const [invoice, setInvoice] = useState(false);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);
  const handleClick = () => {
    setInvoice(!invoice);
  }
  const [totalPage, setTotalPage] = useState(null);
  const [page, setPage] = useState(1);
  const [itemOffset, setItemOffset] = useState(0);
  const [item, setItem] = useState();
  useEffect(() => {
    get_all_history(dispatch).then((r) => {
      if (r.status === 401) {
        toast.error("Something went wrong...!")
      }
      if (r && r.data && r.data.status === 200) {
        setNoData(false);
        dispatch(getAllHistory(r.data.data));
        setItem(r.data.data);
        setTotalPage(r.data.totalPage)
      }
      else {
        if (r && r.respone && r.respone.data && r.respone.data.detail) {
          setError(r.respone.data.detail)
        }
        dispatch(setLoadingHistoryRetail(false))
      }
    })
      .catch((e) => {
        dispatch(setLoadingHistoryRetail(false));
        setNoData(true);
      })
      .finally(() => {
        dispatch(setLoadingHistoryRetail(false))
      })
  }, [dispatch]);
  const endOffset = itemOffset + 6;
  const currentOrderHistory = orderHistory.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(orderHistory.length / 6);
  const loading = useSelector((state) => state.history.loading);
  const onPageChange = (event) => {
    const newOffset = (event.selected * 6) % orderHistory.length;
    setItemOffset(newOffset);
    // get_all_history(selected + 1).then((r) => { dispatch(getAllHistory(r.data.data)); setTotalPage(r.data.totalPage) });
  }
  const invoiceRef = useRef();
  const hanldePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: 'invoice',
  });
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const handleInvoice = (id) => {
    console.log(id);
    setLoadingInvoice(true)
    get_invoice(id)
      .then(r => dispatch(getInvoice(r.data.data.products)))
    get_invoice(id)
      .then(r => dispatch(getOrderInvoice(r.data.data.order)))
      .then(() => setLoadingInvoice(false));
    // hanldePrint();
    // .then(()=>hanldePrint());
  }
  const [isOpen, setOpen] = useState(false);
  const [loadingPro,setLoadingPro]=useState(false);
  const handleProductById = (id) => {
    console.log(id);
    setLoadingPro(true);
    get_orderById(id)
    .then((r) => dispatch(getOrderById(r.data.data.products)))
    .then(()=>setLoadingPro(false))
    setOpen(!isOpen)
  }
  return (
    <div>
      <div className="dark:text-white">
        {/* <div className="bg-white min-h-screen rounded-lg w-[80%] mx-auto shadow-md"> */}
        <div className="lg:w-[80%] w-[100%] min-h-screen m-auto p-8 bg-white">
          {/* <div className="flex flex-wrap flex-col gap-3 justify-between m-auto"> */}
          <div className="flex flex-wrap flex-col gap-2 justify-center">
            <div className='w-full flex'>
              <div className='w-3/5'>
                <h1 className="text-3xl font-semibold text-retailerPrimary">
                  Order history
                </h1>
              </div>
            </div>
            <p className="text-lg text-newGray">
              Manage your recent order and invoices.
            </p>
            <p className="text-lg text-newGray">
              Click on a view button to get the invoice and you can download!
            </p>
            <div className="sm:rounded-lg h-[560px] w-[100%] ">
              <div className='h-[560px] relative overflow-x-auto w-[100%]'>
                <table className="w-full lg:text-[16px] text-[14px] text-left text-gray-500 border-tools-table-outline  border-separate border-spacing-y-2">
                  <thead className="lg:text-[16px] text-[14px] text-newGray bg-newWhite uppercase">
                    <tr>
                      <th scope="col" className="px-8 py-3">
                        No
                      </th>
                      <th scope="col" className="px-8 py-3 whitespace-nowrap">
                        Shop Name
                      </th>
                      <th scope="col" className="px-8 py-3">
                        <p className='ml-4'>Date</p>
                      </th>
                      <th scope="col" className="px-8 py-3">
                        <p className='ml-6'>Status</p>
                      </th>
                      <th scope="col" className="px-8 py-3 w-16">
                        <p className='ml-14'>Action</p>
                      </th>
                    </tr>
                  </thead>
                  {/*  */}
                  <tbody>
                    {loading
                      ? (
                        <tr>
                          <td colSpan={5} className="py-20">
                            <div className="w-full mx-auto flex justify-center">
                              <PropagateLoader color="#F15B22" />
                            </div>
                          </td>
                        </tr>
                      ) : currentOrderHistory.length === 0
                        ? noData ? (
                          <tr>
                            <td colSpan={5} className="py-6">
                              <p className="text-center text-2xl font-semibold">{error}</p>
                            </td>
                          </tr>

                        ) : (
                          <tr>
                            <td colSpan={5} className="py-20">
                              <p className="text-center text-2xl font-semibold">No data available</p>
                            </td>
                          </tr>
                        )
                        :
                        (currentOrderHistory.map((item, index) => (
                          <tr key={index} className="rounded-lg mt-2  lg:text-[16px] text-[14px] bg-gray-50  dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                            <td className="px-10 py-4 ">
                              {index + 1 + itemOffset}
                            </td>
                            <td className="px-10 py-4 flex items-center whitespace-nowrap">
                              <img
                                className="w-10 h-10 rounded-full"
                                src={getSafeImageSrc(item.order.image, noImage)}
                                onError={(e) => applyImageFallback(e, noImage)}
                                alt="products image"
                              />
                              <div className="pl-3">
                                <div className="font-normal text-gray-500">
                                  {item.order.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-4 ">
                              {new Date(item.order.date).toLocaleDateString("en-GB")}
                            </td>
                            <td className="px-10 py-4 text-[16px]">
                              <button className={`flex flex-row mr-2 items-center rounded-md w-28  py-[4px] px-1 ${item.order.status === "Complete" ? " bg-colorComplete text-newGreen" : "text-newRed bg-colorCancel"}`}>
                                {item.order.status === "Complete"
                                  ?
                                   <svg
                                    className="w-6 fill-newGreen"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 448 512"
                                  >
                                    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                                  </svg>
                                  // <svg className='' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                  : <svg
                                    className="w-4  fill-newRed "
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 384 512"
                                  >
                                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                                  </svg>
                                }
                                <p className='text-16px mr-2'>{item.order.status}</p>
                              </button>
                            </td>
                            {item.order.status === "Complete"
                              ? <td className="px-10 py-4">
                                <button onClick={() => { handleClick(); handleInvoice(item.order.id) }} className="text-white text-[16px] mr-2 bg-newGreen rounded-md w-48  py-[6px]">
                                  View invoice
                                </button>
                              </td>
                              : <td className="px-10 py-4">
                                <button onClick={() => { handleProductById(item.order.id); setOpen(!isOpen) }} className="bg-retailerPrimary text-[16px] text-white rounded-md w-48  py-[6px]">
                                  View products
                                </button>
                              </td>}
                          </tr>
                        )))
                    }
                  </tbody>
                </table>
              </div>
              {error || noData || loading || pageCount < 2 ? null : (
                <div className="flex items-center justify-end" >
                  <ReactPaginate pageCount={pageCount} onPageChange={onPageChange} previousLabel="< Prev" className="flex" breakLabel="..." nextLabel="Next >" pageRangeDisplayed={5} containerClassName="pagination" activeClassName="text-retailerPrimary active" pageClassName="px-2 page-item" nextLinkClassName="page-item" />
                </div>
              )}
            </div>
          </div>
          {/* </div> */}
        </div>
        {/* </div> */}
      </div>
      <RetailerInvoice handleClick={handleClick} invoice={invoice} invoiceRef={invoiceRef} hanldePrint={hanldePrint} loadingInvoice={loadingInvoice} />
      <ProductDetail handleOpen={() => setOpen(!isOpen)} isOpen={isOpen} loadingPro={loadingPro} />
    </div>
  )
}
