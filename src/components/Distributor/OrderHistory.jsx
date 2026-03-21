import React, { useRef, useState } from "react";
import { Dropdown } from "flowbite-react";
import Invoice from "./OrderPage/Invoice";
import { useEffect } from "react";
import { get_order_history } from "../../redux/services/distributor/OrderHistory.service";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrderHistory,
  setLoadingHistory,
} from "../../redux/slices/distributor/orderHistorySlice";
import { get_invoice_by_id } from "../../redux/services/distributor/invoice.service";
import ReactPaginate from "react-paginate";
import { useReactToPrint } from "react-to-print";
import { get_detail_product } from "../../redux/services/distributor/product.service";
import { getProductDetail } from "../../redux/slices/distributor/productSlice";
import Product from "./OrderPage/Product";
import {
  getInvoiceById,
  getInvoiceOrder,
} from "../../redux/slices/distributor/invoiceDistributorSlice";
import { setLoadingOrder } from "../../redux/slices/retailer/orderSlice";
import { PropagateLoader } from "react-spinners";
import LoadingOverlay from "react-loading-overlay";
import { styled } from "@mui/material";
export default function OrderHistory() {
  useEffect(() => {
    document.title = "H-Phsar | Order-Report";
  }, []);
  const [invoice, setInvoice] = useState(false);
  const [totalPage, setTotalPage] = useState(null);
  const [page, setPage] = useState(1);
  const handleInvoice = () => {
    setInvoice(!invoice);
  };
  const orderHistoryList = useSelector((state) => state.orderHistory.data);
  const dispatch = useDispatch();
  const [itemOffset, setItemOffset] = useState(0);
  const [item, setItem] = useState();
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);
  useEffect(() => {
    get_order_history(dispatch)
      .then((r) => {
        if (r && r.data && r.data.status === 200) {
          setNoData(false);
          dispatch(getOrderHistory(r.data.data));
          setItem(r.data.data);
          setTotalPage(r.data.totalPage);
        } else {
          if (r && r.response && r.response.data && r.response.data.detail) {
            setError(r.respone.data.detail);
          }
          dispatch(setLoadingHistory(false));
        }
      })
      .catch((e) => {
        dispatch(setLoadingHistory(false));
        setNoData(true);
      })
      .finally(() => {
        dispatch(setLoadingHistory(false));
      });
  }, [dispatch]);
  const onPageChange = (event) => {
    const newOffset = (event.selected * 7) % orderHistoryList.length;
    setItemOffset(newOffset);
  };
  const endOffset = itemOffset + 7;
  const currentOrderHistoryList = orderHistoryList.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(orderHistoryList.length / 7);
  const loading = useSelector((state) => state.orderHistory.loading);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const invoiceRef = useRef();
  const GetInvoice = (id) => {
    console.log(id);
    setLoadingInvoice(true);
    get_invoice_by_id(id).then((r) =>
      dispatch(getInvoiceById(r.data.data.products))
    );
    get_invoice_by_id(id)
      .then((r) => dispatch(getInvoiceOrder(r.data.data.order)))
      .then(() => {
        setLoadingInvoice(false);
      });
  };
  const hanldePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: "invoice",
    // onAfterPrint: () => alert("Get invoice successfully"),
  });
  const handleDownload = (id) => {
    console.log(id);
  };
  const [isOpen, setOpen] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);
  const detailProduct = (id) => {
    console.log(id);
    setLoadingPro(true);
    get_detail_product(id)
      .then((r) => {
        dispatch(getProductDetail(r.data.data.products));
      })
      .then(() => setLoadingPro(false));
  };
  const handlePro = () => {
    setOpen(!isOpen);
  };
  const StyledLoader = styled(LoadingOverlay)`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  `;
  const [isOpenR, setIsOpenR] = useState(false);
  useEffect(() => {
    setIsOpenR(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpenR(true);
    }, 1000); // Delay of 500 milliseconds

    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      className={`dark:text-white transition ${
        isOpenR
          ? " transition-all ease-in-out delay-300 duration-1000 "
          : "opacity-0 scale-95 translate-y-1/2 "
      }`}
    >
      {/* {loadingInvoice ?
      <StyledLoader
        active={loadingInvoice}
        spinner={true}
        text="Loading..."
      ></StyledLoader>
      : null
} */}
      <div className="w-[100%] m-auto p-8 bg-white rounded-lg">
        <div className="flex flex-wrap flex-col gap-2 justify-center">
          <h1 className="text-3xl font-semibold text-primary">Order history</h1>
          <p className="text-[16px] text-newGray mt-2">
            Manage your recent order and invoices.
          </p>
          <p className="text-[16px] text-newGray">
            Click on a Preview button to get the invoice and you can download!
          </p>
          <div className="lg:h-[620px] h-[600px] w-[100%]">
            <div className="lg:h-[620px] h-[600px] w-[100%] overflow-x-auto">
              <table className="text-[16px] text-left text-gray-500  border-tools-table-outline  border-separate lg:border-spacing-y-2 border-spacing-y-0 w-full ">
                <thead className="text-[16px] text-newGray bg-newWhite uppercase ">
                  <tr>
                    <th scope="col" className="px-8 py-3">
                      No
                    </th>
                    <th scope="col" className="px-16 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-20 py-3 ">
                      Status
                    </th>
                    <th scope="col" className="px-32 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="text-newGray">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-20">
                        <div className="w-full mx-auto flex justify-center">
                          <PropagateLoader color="#0F766E" />
                        </div>
                      </td>
                    </tr>
                  ) : currentOrderHistoryList.length === 0 ? (
                    noData ? (
                      <tr>
                        <td colSpan={4} className="py-6">
                          <p className="text-center text-2xl font-semibold">
                            {error}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-20">
                          <p className="text-center text-2xl font-semibold">
                            No data available
                          </p>
                        </td>
                      </tr>
                    )
                  ) : (
                    currentOrderHistoryList.map((item, index) => (
                      <tr
                        key={index}
                        className="rounded-lg mt-4 shadow-sm bg-gray-50"
                      >
                        <td className="px-16 py-3 pl-8 ">
                          {index + 1 + itemOffset}
                        </td>
                        <td className="px-16 py-3 flex items-center whitespace-nowrap">
                          {item.order.image !== "String" && item.order.image ? (
                            <img
                              className="w-10 h-10 rounded-full"
                              src={item.order.image}
                              alt="retailerImage"
                            />
                          ) : null}
                          <div className="pl-3">
                            <div className="font-normal text-gray-500">
                              {item.order.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-16 py-3">
                          <button
                            className={`text-white text-md items-center rounded-md w-28 py-[6px] ${
                              item.order.status === "Pending"
                                ? "bg-requesting opacity-50"
                                : item.order.status === "Preparing"
                                ? "bg-preparing opacity-50"
                                : item.order.status === "Declined"
                                ? "bg-rejected opacity-50"
                                : item.order.status === "Complete"
                                ? "bg-complete opacity-50"
                                : item.order.status === "Confirming"
                                ? "bg-confirm opacity-50"
                                : "bg-delivering opacity-50"
                            }`}
                          >
                            <p className="text-center">{item.order.status}</p>
                          </button>
                        </td>
                        <td className="px-16 py-3 whitespace-nowrap">
                          {item.order.status === "Complete" ? (
                            <div>
                              <button
                                onClick={() => {
                                  setInvoice(!invoice);
                                  GetInvoice(item.order.id);
                                }}
                                className="text-white text-md mr-3 bg-newGreen rounded-md w-52 py-[6px] px-0.5"
                              >
                                Preview
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setOpen(!isOpen);
                                detailProduct(item.order.id);
                              }}
                              className="bg-primary text-md text-white rounded-md w-52  py-[6px]"
                            >
                              View products
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {error || noData || loading || pageCount < 2 ? null : (
              <div className="flex  items-center justify-end">
                <ReactPaginate
                  pageCount={pageCount}
                  onPageChange={onPageChange}
                  previousLabel="< Pre"
                  className="flex"
                  breakLabel="..."
                  nextLabel="Next >"
                  pageRangeDisplayed={5}
                  containerClassName="pagination"
                  activeClassName="text-primary active"
                  pageClassName="px-2 page-item"
                  nextLinkClassName="page-item"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Invoice
        handleInvoice={handleInvoice}
        invoice={invoice}
        invoiceRef={invoiceRef}
        hanldePrint={hanldePrint}
        loadingInvoice={loadingInvoice}
      />
      <Product handlePro={handlePro} isOpen={isOpen} loadingPro={loadingPro} />
    </div>
  );
}

