import React from "react";
import Carousel from "react-grid-carousel";
import { useDispatch, useSelector } from "react-redux";
import {
  decrement,
  increment,
} from "../../redux/slices/retailer/inDecreaseProductSlice";

export default function Skincare() {
  const dispatch = useDispatch(); //update state
  const { counter } = useSelector((state) => state.inDecrementProduct);

  // get all product
  const getAllProduct = useSelector(
    (state) => state.getAllProductRetailer.productRetailer
  );

  // function handle click of increase
  const handleIncrement = () => {
    dispatch(increment());
  };
  const handleDecrement = () => {
    dispatch(decrement());
  };
  return (
    <div>
      <div className="w-full h-96 ml-5">
        <Carousel
          cols={3}
          rows={3}
          loop
          arrowLeft={
            <img
              src={(require("../../assets/images/retailer/back.png")?.default || require("../../assets/images/retailer/back.png"))}
              alt=""
              className="absolute z-50  top-80 -left-9 cursor-pointer"
            />
          }
          arrowRight={
            <img
              src={(require("../../assets/images/retailer/next.png")?.default || require("../../assets/images/retailer/next.png"))}
              alt=""
              className="absolute z-50 top-80 right-2 cursor-pointer"
            />
          }
        >
          {getAllProduct.map((item) => (
            <Carousel.Item>
              <div
                key={item.id}
                className="border-2 mb-10   w-[400px] h-48 rounded-lg flex item-center gap-8  "
              >
                <div className="w-full flex ">
                  <div className="w-1/2  flex justify-center items-center">
                    <img
                      src={(require("../../assets/images/retailer/listerine.png")?.default || require("../../assets/images/retailer/listerine.png"))}
                      className="h-5/6 mt-5"
                    />
                  </div>
                  <div className="mt-6 w-1/2 text-center">
                    <p className="text-xl font-semibold">Listerine</p>
                    <p className="text-orange-500 font-semibold mt-2">
                      $ 23.35/pack
                    </p>
                    <p className="text-gray-500 font-medium mt-2">
                      20 left in stock
                    </p>

                    {/* increase and decrease button  */}
                    <div className="flex mt-5 justify-center ">
                      <button
                        onClick={handleDecrement}
                        type="button"
                        className={` inline-flex flex-shrink-0 justify-center items-center gap-2 h-[1.6rem] w-[2.1rem] rounded-sm border-2  border-orange-500  hover:border-orange-600`}
                        disabled={counter === 0}
                      >
                        <svg
                          className="w-4 hover:border-orange-600 fill-orange-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                        >
                          <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
                        </svg>
                      </button>
                      <span className="border-2 w-11 h-[1.6rem] text-center">
                        {counter}
                      </span>
                      <button
                        onClick={handleIncrement}
                        type="button"
                        className="inline-flex flex-shrink-0 justify-center items-center gap-2 h-[1.6rem] w-[2.1rem] rounded-sm border border-transparent  bg-orange-500 hover:bg-orange-600   focus:ring-orange-500  transition-all"
                      >
                        <svg
                          className="w-4 fill-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                        >
                          <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}

          {/* ... */}
        </Carousel>
      </div>
    </div>
  );
}
