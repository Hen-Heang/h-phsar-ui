// @ts-nocheck -- legacy page, pending UI-11 TypeScript alignment pass
import React, { useEffect, useMemo, useState } from "react";
import { get_all_highest_rate } from "../../../redux/services/buyer/retailerHomepage.service";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@/redux/hooks";
import {
  getHighestRate,
  setStoreId,
} from "../../../redux/slices/buyer/homepageSlice/allShopSlice";
import noImage from "../../../assets/images/no_image.jpg";
import { useRouter } from "next/navigation";
import Top10highestRated from "@/shared/components/skeletons/Top10highestRated";
import {
  applyImageFallback,
  getSafeImageSrc,
  isInvalidImageSrc,
} from "@/lib/images";
const CategoryCarousel = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    get_all_highest_rate()
      .then((e) => {
        dispatch(getHighestRate(e.data.data));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [dispatch]);

  const { highestRateData } = useSelector((state) => state.getDataAllShop);
  const topShops = useMemo(
    () => (highestRateData ?? []).slice(0, 5),
    [highestRateData],
  );
  const router = useRouter();

  const onClickGetDataShop = (id, storeName) => {
    dispatch(setStoreId(id));

    router.push(
      `/buyer/store?storeId=${id}&storeName=${encodeURIComponent(storeName)}`,
    );

    window.scrollTo(0, 0);
  };

  return (
    <div>
      {loading ? (
        <Top10highestRated />
      ) : (
        <div className="flex flex-col">
          <div className="flex flex-col gap-1 sm:gap-5">
            <h3 className="text-xl font-bold text-gray-500">
              Find things you'll love. Support independent distributors.
            </h3>
            <p className="text-[16px] text-[#777]">Only on Warehouse master</p>
            <h2 className="text-xl font-bold text-indigo-500">
              Top highest Rate Shops
            </h2>{" "}
            <br />
          </div>

          <div className="flex flex-row justify-between ">
            {topShops.map((item) => (
              <div
                onClick={() => onClickGetDataShop(item.id, item.name)}
                key={item.id}
                className="flex bg-white flex-col lg:w-60  lg:h-60 sm:w-28 sm:h-28 w-16 h-16 rounded-xl   /[.7] border border-solid border-slate-200"
              >
                <div className="w-full flex flex-row justify-center">
                  <div className="w-full flex justify-center items-center overflow-hidden rounded-t-lg">
                    <img
                      src={getSafeImageSrc(item.bannerImage, noImage)}
                      className="lg:h-48 lg:w-full sm:w-28 sm:h-28 w-16 h-16 rounded-t-md lg:rounded-t-xl max-w-xs transition duration-300 ease-in-out hover:scale-110"
                      onError={(e) => applyImageFallback(e, noImage)}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-between lg:mt-4 sm:mt-1 mt-0 lg:px-2 lg:mb-0 mb-2">
                  <div className="text-center">
                    <span className="text-center lg:text-[16px] sm:text-[12px] text-[8px] font-bold line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                  {isInvalidImageSrc(item.bannerImage) ? null : (
                    <div className=" bottom-2  invisible lg:visible">
                      {/*rate  */}
                      <div className="w-14 h-5 flex items-center  ">
                        <p className="text-white text-sm text-cent ">
                          <svg
                            className="w-3 ml-2 fill-indigo-500 "
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                          >
                            <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                          </svg>
                        </p>
                        <p className="text-gray-500 font-normal text-xs ml-1">
                          {parseFloat(item.rating).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* ... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCarousel;
