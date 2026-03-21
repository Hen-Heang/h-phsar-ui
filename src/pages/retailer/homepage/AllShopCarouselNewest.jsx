import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBookmarkStore,
  setStoreId,
  setUpdateBookmarkStoreNewest,
} from "../../../redux/slices/retailer/homepageSlice/allShopSlice";
import noImage from "../../../assets/images/no_image.jpg";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import {
  bookmark_store,
  get_all_bookmark_store,
  remove_bookmark_store,
} from "../../../redux/services/retailer/retailerHomepage.service";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";

const AllShopCarouselNewest = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const dataNewShop = useSelector((state) => state.getDataAllShop.dataNewShop);
  const [itemOffset, setItemOffset] = useState(0);
  const pageCount = Math.ceil((dataNewShop?.length || 0) / 9);
  const onPageChange = useCallback((event) => {
    const newOffset = (event.selected * 9) % (dataNewShop?.length || 1);
    setItemOffset(newOffset);
  }, [dataNewShop?.length]);

  const currentDataNewShop = useMemo(() => {
    const endOffset = itemOffset + 9;
    return dataNewShop.slice(itemOffset, endOffset);
  }, [dataNewShop, itemOffset]);

  const onClickGetDataShop = useCallback((id, storeName) => {

    dispatch(setStoreId(id)); // Dispatch the setStoreId action

    navigate(
      `/retailer/distributor-shop?storeId=${id}&storeName=${encodeURIComponent(
        storeName
      )}`
    );
    window.scrollTo(0, 0);
  }, [dispatch, navigate]);

  const bookmarkStoreQuery = useQuery({
    queryKey: ["retailer", "bookmark-store"],
    queryFn: async () => {
      const res = await get_all_bookmark_store();
      return res?.data?.data || [];
    },
  });

  useEffect(() => {
    if (bookmarkStoreQuery.data) {
      dispatch(getBookmarkStore(bookmarkStoreQuery.data));
    }
  }, [bookmarkStoreQuery.data, dispatch]);

  const handleBookmarkClick = useCallback((item) => {
    if (item.isBookmarked) {
      // If already bookmarked, remove the bookmark
      remove_bookmark_store(item.id)
        .then(() => {})
        .then(() => dispatch(setUpdateBookmarkStoreNewest(item)));
    } else {
      // If not bookmarked, add the bookmark
      bookmark_store(item.id)
        .then(() => {})
        .then(() => dispatch(setUpdateBookmarkStoreNewest(item)));
    }
  }, [dispatch]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* {storeId && <DistributorStoreRetailer storeId={storeId} />}   */}

      {currentDataNewShop.map((item, index) => (
        <div
          key={item.id ?? `${item.name}-${index}`}
          className="flex flex-col justify-center h-40 lg:h-60 cursor-pointer"
          onClick={() => onClickGetDataShop(item.id,item.name)}
        >
          <div className="retailer-panel relative hover:bg-retailerPrimarySoft/30 sm:flex-wrap lg:grid lg:grid-cols-2 h-40 lg:h-60 md:flex-row md:space-y-0 rounded-xl p-3 max-w-xs md:max-w-3xl mx-auto">
            {/* heart button */}
            {/* heart button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event from bubbling up

                handleBookmarkClick(item);
              }}
              className="w-8 h-8 rounded-full sm:ml-1 sm:mt-1 lg:ml-3 lg:mt-4 absolute bg-retailerSurface border border-retailerBorder hover:opacity-80"
            >
              {item.isBookmarked ? (
                <svg
                  className="fill-orange-500 w-5 ml-[6px] mt-[1px]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                </svg>
              ) : (
                <>
                  <svg
                    className="fill-orange-500 w-6 h-6 ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                  </svg>
                </>
              )}
            </button>

            <div className="grid place-items-center w-full h-40 lg:h-full -ml-1 -mt-1 overflow-hidden rounded-md">
              <img
                src={getSafeImageSrc(item.bannerImage, noImage)}
                onError={(e) => applyImageFallback(e, noImage)}
                className=" h-full w-full "
              />
            </div>
            <div className="w-full flex flex-col sm:space-y-0 sm:p-1 lg:space-y-2 lg:p-3 relative">
              <h3 className="font-black text-gray-800 text-lg line-clamp overflow-hidden h-6">
                {item.name}
              </h3>
              <p className="flex sm:mt-2 lg:mt-0 text-[16px] items-center gap-2">
                Rating :
                <span>
                  <img
                    src={(require("../../../assets/images/retailer/star.png")?.default || require("../../../assets/images/retailer/star.png"))}
                    alt=""
                  />
                </span>
                {parseFloat(item.rating).toFixed(2)}
              </p>

              {/* address */}
              <div className="flex flex-wrap mr-1">
                <svg
                  className="w-3 mr-2  fill-gray-500 -mt-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                </svg>

                <div>
                  <p className="text-gray-500 text-md mt-1 line-clamp-1">
                    {item.address}
                  </p>
                </div>
              </div>
              {/* category */}
              <p className="invisible lg:visible flex flex-wrap line-clamp2 overflow-hidden h-12">
                <span className="font-bold ">Category : &nbsp;</span>
                {item.categories.map((data, categoryIndex) => (
                  <span
                    key={data.id ?? `${data.name}-${categoryIndex}`}
                    className="text-sm "
                  >
                    {data.name}, &nbsp;
                  </span>
                ))}
                {/* { item.categories.name} */}
              </p>

              <button
                onClick={() => onClickGetDataShop(item.id, item.name)}
                className="invisible lg:visible absolute right-0 text-sm bottom-2 py-1 px-2 bg-retailerPrimary rounded-l-full text-white"
              >
                View detail
              </button>
            </div>
          </div>
        </div>
      ))}
      {pageCount < 2 ? null : (
        <div className="h-8 sm:h-10 bg-white  rounded-md  w-[350px] sm:w-[430px] flex flex-row just-start sm:justify-center  top-[830px] sm:top-[1780px] lg:top-[2260px]  absolute left-1/2 translate-x-[-50%]">
          <div className="flex item-center  sm:ml-0 justify-start sm:justify-center p-1 sm:p-2">
            <ReactPaginate
              pageCount={pageCount}
              onPageChange={onPageChange}
              previousLabel="< Prev"
              className="flex font-medium"
              breakLabel="..."
              nextLabel="Next >"
              pageRangeDisplayed={5}
              containerClassName="pagination"
              activeClassName="text-retailerPrimary active"
              pageClassName="px-2 page-item"
              nextLinkClassName="page-item"
            />
          </div>
        </div>
      )}

      {/* ... */}
    </div>
  );
};

export default AllShopCarouselNewest;
