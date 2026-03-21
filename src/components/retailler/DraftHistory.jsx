import React, { useEffect, useState } from "react";
import RetailerInvoice from "./RetailerInvoice";
import {
  delete_draft,
  draft_to_request,
  get_draft_history,
} from "../../redux/services/retailer/draftHistory.service";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteDraft,
  deleteDraftHistory,
  draftToRequest,
  getDraftHistory,
  getProduct,
  setLoadingDraft,
} from "../../redux/slices/retailer/draftHistorySlice";
import ReactPaginate from "react-paginate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteTheDraft,
  draftToRequest1,
  getDraftHis,
  pushToOrder,
  setLoadingOrder,
} from "../../redux/slices/retailer/orderSlice";
import { PropagateLoader } from "react-spinners";
import ProductDetail from "./ProductDetail";
import DraftProduct from "./DraftProduct";
import { get_orderById } from "../../redux/services/retailer/orderDetail.service";
import {
  getOrderById,
  getOrderProduct,
} from "../../redux/slices/retailer/orderDetailSlice";
import { toast } from "react-toastify";
import LoadingOverlay from "react-loading-overlay";
import { styled } from "@mui/material";
import noImage from "../../assets/images/retailer/No_image_available.png";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import { sendOneSignalNotification } from "@/lib/notifications/send-onesignal-client";

const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }

  if (typeof error?.detail === "string" && error.detail.trim() !== "") {
    return error.detail;
  }

  if (typeof error?.message === "string" && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
};

export default function DraftHistory() {
  useEffect(() => {
    document.title = "H-Phsar | Draft";
  }, []);
  const draftHistoryList = useSelector((state) => state.order.dataDraft);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(null);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);
  const dispatch = useDispatch();
  const [itemOffset, setItemOffset] = useState(0);
  const [item1, setItem1] = useState();
  const getAllDraftHistory = () => {
    get_draft_history(dispatch)
      .then((r) => {
        if (r.status === 401) {
          toast.error("Something went wrong...!");
        }
        if (r && r.data && r.data.status === 200) {
          setNoData(false);
          dispatch(getDraftHis(r.data.data));
          setTotalPage(r.data.totalPage);
          setItem1(r.data.data);
        } else {
          const errorMessage = getErrorMessage(
            r?.response?.data ?? r?.data ?? r,
            "Failed to load draft history"
          );

          if (errorMessage) {
            setError(errorMessage);
          }
          dispatch(setLoadingDraft(false));
        }
      })
      .catch((e) => {
        dispatch(setLoadingDraft(false));
        setNoData(true);
        setError(getErrorMessage(e?.response?.data ?? e, "Failed to load draft history"));
      })
      .finally(() => {
        dispatch(setLoadingDraft(false));
      });
  };
  useEffect(() => {
    getAllDraftHistory();
  }, [dispatch]);
  const endOffset = itemOffset + 6;
  const currentDrafHistory = draftHistoryList.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(draftHistoryList.length / 6);
  const loading = useSelector((state) => state.draft.loading);
  const onPageChange = (event) => {
    const newOffset = (event.selected * 6) % draftHistoryList.length;
    setItemOffset(newOffset);
  };
  const [deleteDraft, setDeleteDraft] = useState(false);
  const [product, setProduct] = useState([]);
  const [draftId, setDraftId] = useState();
  function getItem(item) {
    console.log("getFrom", item);
    setProduct(item);
  }
  function getDraft(itemD) {
    // console.log("id of delete", id);
    setDraftId(itemD);
  }

  // =========================== handle draft changes =========================
  const [loadingTheDraft, setLoadingTheDraft] = useState(false);
  const handleDraft = () => {
    const message = "You have new order";
    // setLoadingAccept(true)
    setLoadingTheDraft(true);
    draft_to_request(draftId)
      .then(async (res) => {
        if (res.status === 409) {
          // setLoadingAccept(false);
          setLoadingTheDraft(false);
          toast.error(res.data.detail);
        }
        console.log("Response from server : ", res.data.totalPage);
        const notification = {
          contents: { en: message },
          include_external_user_ids: [res.data.totalPage.toString()],
        };
        try {
          const response = await sendOneSignalNotification(notification);
          console.log("Push notification sent successfully:", response);
        } catch (error) {
          console.error("Error sending push notification:", error);
        }
        dispatch(draftToRequest1(draftId?.id));
        dispatch(pushToOrder(draftId));
      })
      .then(() => {
        setLoadingTheDraft(false);
      });
    setOpen(!isOpen);
    // const [loadingTheDraft,setLoadingTheDraft]=useState(false);
    // const handleDraft = (id) => {
    //   setLoadingTheDraft(true);
    //   draft_to_request(draftId?.id)
    //   .then((r) => {dispatch(draftToRequest1(draftId?.id)); dispatch(pushToOrder(draftId))})
    //   .then(()=>setLoadingTheDraft(false))
    //   setOpen(!isOpen);
  };
  const [loadingDelete, setLoadingDelete] = useState(false);
  const handleDelete = (id) => {
    setLoadingDelete(true);
    delete_draft(id)
      .then((r) => dispatch(deleteTheDraft(id)))
      .then(() => setLoadingDelete(false));
  };
  const [isOpen, setOpen] = useState(false);
  const StyledLoader = styled(LoadingOverlay)`
    position: fixed;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  `;
  return (
    <div>
      {loadingDelete ? (
        <StyledLoader
          active={loadingDelete}
          spinner={true}
          text="Deleting..."
        ></StyledLoader>
      ) : null}
      {loadingTheDraft ? (
        <StyledLoader
          active={loadingTheDraft}
          spinner={true}
          text="Loading..."
        ></StyledLoader>
      ) : null}
      <div className="dark:text-white">
        {/* <div className="bg-white min-h-screen rounded-lg w-[80%] shadow-md mx-auto"> */}
        <div className="lg:w-[80%] w-100% min-h-screen m-auto p-8 bg-white">
          {/* <div className="flex flex-wrap flex-col gap-3 justify-between m-auto"> */}
          <div className="flex flex-wrap flex-col gap-2 justify-center">
            <h1 className="text-3xl font-semibold text-retailerPrimary">
              Draft history
            </h1>
            <p className="text-newGray mt-1 text-md">
              This is the product you have drafted.
            </p>
            <p className="text-md text-newGray">
              Click on check out button to order your drafted cart!
            </p>
            <div className="sm:rounded-lg h-[625px] bg-gray-50 w-[100%] ">
              <div className="lg:h-[560px] h-[640px] bg-gray-50 relative  overflow-x-auto w-[100%] ">
                <table className="w-full lg:text-[16px] text-[14px] text-left text-gray-500 border-spacing-y-2 border-tools-table-outline  border-separate">
                  <thead className="text-[16px] lg:text-[14px] text-newGray bg-newWhite uppercase">
                    <tr className="lg:text-[16px] text-[14px]">
                      <th scope="col" className="px-6 py-3">
                        No
                      </th>
                      <th scope="col" className="px-6 py-3">
                        ShopName
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <p className="ml-12"> Action</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-newGray">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-20">
                          <div className="w-full mx-auto flex justify-center">
                            <PropagateLoader color="#F15B22" />
                          </div>
                        </td>
                      </tr>
                    ) : currentDrafHistory.length === 0 ? (
                      // noData ? (
                      //   <div className="w-full mx-auto absolute ">
                      //     <p className="text-center text-2xl font-semibold mt-2">
                      //       {error}
                      //     </p>
                      //   </div>
                      // ) : 
                      (
                        <tr>
                          <td colSpan={5} className="py-20">
                            <p className="text-center text-2xl font-semibold">
                              No data available
                            </p>
                          </td>
                        </tr>
                      )
                    ) : (
                      currentDrafHistory.map((item, index) => (
                        <tr
                          key={item?.order?.id ?? `draft-${index}`}
                          className="rounded-lg mt-4 shadow-sm bg-gray-50 lg:text-[16px] text-14px"
                        >
                          <td className="px-6 py-4 ">{index + 1 + itemOffset}</td>
                          <td className="px-6 py-4 flex items-center whitespace-nowrap">
                            <img
                              className="w-10 h-10 rounded-full"
                              src={getSafeImageSrc(item.order.image, noImage)}
                              alt="image"
                              onError={(e) => applyImageFallback(e, noImage)}
                            />
                            <div className="pl-3">
                              <div className="font-normal text-gray-500">
                                {item.order.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap ">
                            {new Date(item.order.date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-6 py-4 ">
                            ${item.order.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                handleDelete(item.order.id);
                              }}
                              className="bg-red-500 text-md text-white rounded-md w-24 ml-2  py-[6px]"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                getItem(item.products);
                                setOpen(!isOpen);
                                getDraft(item.order);
                              }}
                              className="bg-retailerPrimary text-md text-white rounded-md w-24 ml-2  py-[6px]"
                            >
                              Check Out
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* pagination */}
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
                    activeClassName="text-retailerPrimary active"
                    pageClassName="px-2 page-item"
                    nextLinkClassName="page-item"
                  />
                </div>
              )}
            </div>
          </div>
          {/* </div> */}
        </div>
        {/* </div> */}
      </div>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent
          showClose={false}
          className="mt-60 lg:mt-0 max-w-5xl overflow-hidden p-0"
        >
          <DialogHeader className="relative bg-retailerPrimary px-6 py-4 text-center">
            <DialogTitle className="text-center text-lg text-white">
              Products
            </DialogTitle>
            <button
              type="button"
              className="absolute right-2 top-2 h-8 w-8 text-white"
              onClick={() => setOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 font-bold text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </DialogHeader>
          <div className="p-6">
              <div className="sm:rounded-lg mt-4 relative overflow-x-auto w-full">
                <div className="h-[400px] overflow-y-auto w-full">
                  <table className="w-full text-sm text-left text-newGray">
                    <thead className="text-xs text-black bg-newWhite  border-spacint">
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
                      {product.map((item, index) => (
                        <tr
                          key={item?.id ?? item?.productId ?? `${item?.productName ?? "product"}-${index}`}
                          className="bg-white border-b text-black dark:bg-gray-800 text-sm"
                        >
                          <td
                            scope="row"
                            className="px-6 py-3 0 whitespace-nowrap dark:text-white"
                          >
                            {" "}
                            {index + 1}
                          </td>
                          <td
                            scope="row"
                            className="flex items-center px-6 py-3 whitespace-nowrap"
                          >
                            <img
                              src={getSafeImageSrc(item.image, noImage)}
                              alt="upload image"
                              className="w-10 h-10 rounded-full p-1"
                              onError={(e) => applyImageFallback(e, noImage)}
                            />
                            <div className="pl-3">
                              <div className="text-sm">{item.productName}</div>
                              <div className="font-normal text-xs text-newGray">
                                {/* {item.category.name} */}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">{item.qty}</td>
                          <td className="px-6 py-3">{item.inStock}</td>
                          <td className="px-6 py-3">
                            ${item.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-3">${item.subTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <button
                    onClick={handleDraft}
                    className="bg-retailerPrimary text-sm text-white font-semibold rounded-md w-20 py-[6px] float-right mt-6 ml-2"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="border-retailerPrimary border text-sm text-retailerPrimary font-semibold rounded-md w-20 py-[6px] float-right mt-6"
                  >
                    Cancel
                  </button>
                </div>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
