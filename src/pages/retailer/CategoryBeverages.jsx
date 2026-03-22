import Carousel from "react-grid-carousel";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { decrement, increment } from "../../redux/slices/retailer/inDecreaseProductSlice";

export default function CategoryBeverages() {
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
    <div className="mx-auto w-[80%] h-4/5">
      <div className="border-2  mt-7 mb-8 rounded-xl">
        <div className="space-x-6 py-3 text-black ml-7 text-base font-bold inline-flex items-center hover:text-black ">
        <svg
          className="w-3 mr-4 fill-orange-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 512"
        >
          <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
        </svg>
          Beverage
        </div>
      </div>


      {/* card to display item  */}
      <div className="w-full ml-5">
        <Carousel
          cols={3}
          rows={3}
          loop
          arrowLeft={
            <ChevronLeft
              className="absolute z-50 top-80 -left-9 cursor-pointer w-8 h-8 text-gray-600 hover:text-orange-500"
            />
          }
          arrowRight={
            <ChevronRight
              className="absolute z-50 top-80 right-2 cursor-pointer w-8 h-8 text-gray-600 hover:text-orange-500"
            />
          }
        >
          {getAllProduct.map((item) => (
            <Carousel.Item>
              <div
                key={item.id}
                className="border-2 mb-10   w-[400px] h-48 rounded-lg flex item-center gap-8 bg-white "
              >
                <div className="w-full flex ">
                  <div className="w-1/2  flex justify-center items-center">
                    <img
                      src={(require("../../assets/images/retailer/Carlsberg.jpeg")?.default || require("../../assets/images/retailer/Carlsberg.jpeg"))}
                      className="h-5/6"
                    />
                  </div>
                  <div className=" w-1/2 p-9 ">
                    <p className="text-xl font-semibold">Chanpich ...</p>
                    <p className="font-medium">Carlsberg</p>
                    <p className=" text-orange-500 font-medium">
                      $ 33.65/pack
                    </p>
                    <p className="text-gray-500 font-medium ">
                      3 left in stock
                    </p>

                   
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
