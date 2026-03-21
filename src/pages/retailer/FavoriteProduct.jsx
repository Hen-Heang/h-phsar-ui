import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  decrement,
  increment,
} from "../../redux/slices/retailer/inDecreaseProductSlice";
import noImage from "../../assets/images/no_image.jpg";
import Carousel from "react-grid-carousel";
import {
  get_detail_product,
  get_detail_shop,
  get_only_bookmark,
  remove_bookmark,
} from "../../redux/services/retailer/favourite.service";
import {
  deleteBookMark,
  getOnlyBookmark,
  setLoadingFavorite,
} from "../../redux/slices/retailer/favoriteSlice";
import { data } from "autoprefixer";
import { cleanString } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
import { useNavigate } from "react-router-dom";
import { getDetailShop } from "../../redux/slices/retailer/detailShopSlice";
import DistributorStoreRetailer from "./DistributorStoreRetailer";
import { getDetailProduct } from "../../redux/slices/retailer/detailProductSlice";
import AllProducts from "./AllProducts";
import { PropagateLoader } from "react-spinners";
import { setStoreId } from "../../redux/slices/retailer/homepageSlice/allShopSlice";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
// import { useNavigate } from "react-router-dom";
export default function FavoriteProduct() {
  useEffect(() => {
    document.title = "H-Phsar | Favorite";
  }, []);
  const dispatch = useDispatch(); //update state
  const navigate = useNavigate();
  const { item, setItem } = useState([]);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);
  // const [currentIndex, setCurrentIndex] = useState(0);

  const onClickGetDataShop = (id,storeName) => {
    dispatch(setStoreId(id)); // Dispatch the setStoreId action
    navigate(`/retailer/distributor-shop?storeId=${id}&storeName=${encodeURIComponent(storeName)}`);
    // navigate(`/retailer/distributor-shop/${id}`);
    // navigate("/retailer/skeleton-store");
    window.scrollTo(0, 0);
  };

  // function handle click of increase
  const handleIncrement = () => {
    dispatch(increment());
  };
  const handleDecrement = () => {
    dispatch(decrement());
  };

  const bookMarkList = useSelector((state) => state.favorite.data);
  console.log("no data :", bookMarkList.length === 0);

  const loading = useSelector((state) => state.favorite.loading);

  const deleteBookmarkById = (id) => {
    console.log(id);
    remove_bookmark(id).then(dispatch(deleteBookMark(id)));
  };

  // console.log("Loading from favorite : ",loading)

  useEffect(() => {
    get_only_bookmark(dispatch)
      .then((r) => {
        if (r && r.data && r.data.status === 200) {
          setNoData(false);
          dispatch(getOnlyBookmark(r.data.data));
          setItem(r.data.data);
        } else {
          if (r && r.response && r.response.data && r.response.data.detail) {
            setError(r.response.data.detail);
          }
          dispatch(setLoadingFavorite(false));
        }
      })
      .catch((e) => {
        dispatch(setLoadingFavorite(false));
        setNoData(true);
      })
      .finally(() => {
        dispatch(setLoadingFavorite(false));
      });
  }, [dispatch, item]);
  console.log(bookMarkList);

  return (
    <div>
      <div className="w-[80%] mx-auto ">
        {/* Loading side before show data*/}
        {loading ? (
          <div className="w-full h-[490px] flex justify-center items-center text-sm text-center border-none text-gray-500 dark:text-gray-400 border border-separate border-spacing-y-3">
            <PropagateLoader color="#F15B22" />
          </div>
        ) : bookMarkList.length === 0 ? (
          <div className="h-[490px]">
            <p className="mx-auto text-center text-3xl font-semibold p-60">
              No favorites available
            </p>
          </div>
        ) : (
          <Carousel
            cols={3}
            rows={3}
            // loop
            arrowLeft={() =>
              bookMarkList && bookMarkList.length >= 9 ? (
                <img
                  src={(require("../../assets/images/retailer/back.png")?.default || require("../../assets/images/retailer/back.png"))}
                  alt=""
                  className="absolute z-5 top-80 -left-9 cursor-pointer"
                />
              ) : null
            }
            arrowRight={() =>
              bookMarkList && bookMarkList.length >= 9 ? (
                <img
                  src={(require("../../assets/images/retailer/next.png")?.default || require("../../assets/images/retailer/next.png"))}
                  alt=""
                  className="absolute z-5 top-80 right-2 cursor-pointer"
                />
              ) : null
            }
          >
            {bookMarkList?.map((item, idex) => (
              <Carousel.Item>
                <button
                  onClick={() => onClickGetDataShop(item.id,item.name)}
                  className="border-2 w-[370px] h-56 rounded-lg flex item-center gap-8 mt-3 "
                >
                  <div className="w-full flex ">
                    <div className="w-1/2 flex justify-center items-center relative">
                      {item.bannerImage ? (
                        <img
                          src={getSafeImageSrc(item.bannerImage, noImage)}
                          className="h-56 rounded-lg p-1"
                          onError={(e) => applyImageFallback(e, noImage)}
                        />
                      ) : (
                        <img
                          src={noImage}
                          className="h-56 rounded-lg p-1"
                        />
                      )}
                    </div>

                    {/* Remove book mark */}
                    <div
                      onClick={(e) => {deleteBookmarkById(item.id);
                                      e.stopPropagation(); // Prevent event from bubbling up
                    } }
                      
                      className="bg-white w-8 h-8 rounded-full ml-2 mt-2 absolute cursor-pointer hover:opacity-80"
                    >
                      <svg
                        className="fill-orange-500 w-5 ml-[6px] mt-[6px]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                      </svg>
                    </div>
                    <div className="p-3 mt-2 w-1/2 ml-2 relative">
                      <p className="text-xl font-semibold line-clamp-1 overflow-hidden h-8  text-start">
                        {item.name}
                      </p>
                      <p className="text-black font-semibold flex flex-wrap mt-1 text-xs ">
                        Rating :
                        <svg
                          className="w-3 ml-2 fill-orange-500 flex flex-wrap -mt-0.5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 576 512"
                        >
                          <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                        </svg>
                        <p className="text-gray-500 font-normal text-sm -mt-0.5 ml-1  ">
                          {parseFloat(item.rating).toFixed(2)}
                        </p>
                      </p>

                      <div className="flex flex-wrap mr-1">
                        <svg
                          className="w-3 mr-2  fill-gray-500 -mt-0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                        >
                          <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                        </svg>

                        <div>
                          <p className="text-gray-500 text-md mt-1 line-clamp2 overflow-hidden ">
                            {item.address}
                          </p>
                        </div>
                      </div>

                      {/* <p className="text-gray-400 text-xs mt-1">{item.address}</p> */}
                      <p className="flex flex-wrap line-clamp2 overflow-hidden h-12  text-start">
                        <span className="font-bold  text-start">Category : &nbsp;</span>

                        {item.categories && item.categories.length > 0 ? (
                          item.categories.map((data, index) => (
                            <span key={index} className="text-sm">
                              {data.name}, &nbsp;
                            </span>
                          ))
                        ) : (
                          <span className="text-sm">
                            No categories available
                          </span>
                        )}
                      </p>
                      <div className="absolute bottom-0 right-0 mb-3">
                        <div className="rounded-l-lg mt-4 bg-orange-500 p-1  w-20 border-2 ">
                          <p
                            onClick={() => onClickGetDataShop(item.id,item.name)}
                            className="text-white text-xs cursor-pointer hover:text-slate-700 "
                          >
                            View Detail
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </Carousel.Item>
            )) || ""}
          </Carousel>
        )}
        {/* )} */}
      </div>
    </div>
  );
}
