// @ts-nocheck -- legacy page, pending UI-11 TypeScript alignment pass
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import { toast } from "react-toastify";
import { Star } from "lucide-react";

import {
  getBookmarkStore,
  setStoreId,
  setUpdateBookmarkStoreRate,
} from "../../../redux/slices/retailer/homepageSlice/allShopSlice";
import noImage from "../../../assets/images/no_image.jpg";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
import {
  bookmark_store,
  get_all_bookmark_store,
  remove_bookmark_store,
} from "../../../redux/services/retailer/retailerHomepage.service";
import { useRouter } from "next/navigation";
import ReactPaginate from "react-paginate";
import { useQuery } from "@tanstack/react-query";

const AllShopCarouselHighestRate = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const highestRateData = useSelector(
    (state) => state.getDataAllShop.highestRateData,
  );
  const [itemOffset, setItemOffset] = useState(0);
  const pageCount = Math.ceil((highestRateData?.length || 0) / 9);
  const onPageChange = useCallback(
    (event) => {
      const newOffset = (event.selected * 9) % (highestRateData?.length || 1);
      setItemOffset(newOffset);
    },
    [highestRateData?.length],
  );

  const currentHighestRateData = useMemo(() => {
    const endOffset = itemOffset + 9;
    return highestRateData.slice(itemOffset, endOffset);
  }, [highestRateData, itemOffset]);

  const onClickGetDataShop = useCallback(
    (id, storeName) => {
      dispatch(setStoreId(id)); // Dispatch the setStoreId action

      router.push(
        `/buyer/store?storeId=${id}&storeName=${encodeURIComponent(storeName)}`,
      );
      window.scrollTo(0, 0);
    },
    [dispatch, router],
  );

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

  const handleBookmarkClick = useCallback(
    (item) => {
      if (item.isBookmarked) {
        // If already bookmarked, remove the bookmark
        remove_bookmark_store(item.id)
          .then(() => {
            toast.error("Bookmark removed");
          })
          .then(() => dispatch(setUpdateBookmarkStoreRate(item)));
      } else {
        // If not bookmarked, add the bookmark
        bookmark_store(item.id)
          .then(() => {
            toast.success("Bookmarked successfully");
          })
          .then(() => dispatch(setUpdateBookmarkStoreRate(item)));
      }
    },
    [dispatch],
  );
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4">
      {/* {storeId && <DistributorStoreRetailer storeId={storeId} />}   */}

      {currentHighestRateData.map((item, index) => (
        <div
          key={item.id ?? `${item.name}-${index}`}
          className="flex mb-5 sm:mb-0  sm:flex-col justify-center h-20 sm:h-60 cursor-pointer"
          onClick={() => onClickGetDataShop(item.id, item.name)}
        >
          <div className="retailer-panel relative hover:bg-retailerPrimarySoft/30 grid grid-cols-2 sm:grid-cols-none sm:flex-wrap lg:grid lg:grid-cols-2 h-24 sm:h-60 md:flex-row md:space-y-0 rounded-xl sm:p-3 max-w-xs md:max-w-3xl mx-auto">
            {/* heart button */}
            {/* heart button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event from bubbling up

                handleBookmarkClick(item);
              }}
              className="hover:bg-retailerPrimarySoft/60 w-8 h-8 rounded-full sm:ml-1 sm:mt-1 lg:ml-3 lg:mt-4 absolute bg-retailerSurface border border-retailerBorder hover:opacity-80"
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
                    height="1em"
                    viewBox="0 0 512 512"
                  >
                    <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" />
                  </svg>
                </>
              )}
            </button>

            <div className="grid  place-items-center w-44 h-24 sm:w-full  sm:h-40 lg:h-full -ml-3 sm:-ml-1 sm:-mt-1 relative max-w-xs overflow-hidden bg-cover bg-no-repeat rounded-md">
              <img
                src={getSafeImageSrc(item.bannerImage, noImage)}
                onError={(e) => applyImageFallback(e, noImage)}
                className=" h-20 w-20 sm:h-full sm:w-full rounded-md sm:rounded-none max-w-xs transition duration-300 ease-in-out hover:scale-110"
              />
            </div>

            <div className="w-full flex flex-col sm:space-y-0 p-1 lg:space-y-2 lg:p-3 relative">
              <h3 className="font-black text-gray-800 text-base lg:text-lg line-clamp overflow-hidden h-6">
                {item.name}
              </h3>
              <p className=" flex sm:mt-2 lg:mt-0 text-[14px] sm:text-[16px] items-center gap-2">
                Rating :
                <span>
                  <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                </span>
                {parseFloat(item.rating).toFixed(2)}
              </p>
              <p className="sm:invisible lg:visible text-[#7777] text-[12px] sm:text-sm line-clamp-2">
                {item.address}
              </p>

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
        <div className="h-8 sm:h-10 bg-white  rounded-md  w-[350px] sm:w-[430px] flex flex-row just-start sm:justify-center  top-[830px] sm:top-[1890px] lg:top-[2260px]  absolute left-1/2 translate-x-[-50%]">
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
    </div>
  );
};

export default AllShopCarouselHighestRate;
