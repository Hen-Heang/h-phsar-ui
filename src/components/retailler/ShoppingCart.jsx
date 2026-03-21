import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { PropagateLoader } from "react-spinners";
import noImage from "../../assets/images/no_image.jpg";
import { applyImageFallback, getSafeImageSrc } from "@/lib/images";
export default function SearchingRetailer() {
  const SearchList = useSelector((state) => state.search.item);
  const loadingSearch = useSelector((state) => state.search.loading);
  const error = useSelector((state) => state.search.error);
  console.log(error)
  console.log("search", SearchList);
  const dispatch= useDispatch();
  const {id} = useParams();
  const navigate = useNavigate();
  const onClickGetDataShop = (id,storeName) => {
    // get_store_by_id(id).then((e) => dispatch(getShopById(e.data.data)));

    // get_all_product_by_storeId(id).then((e) =>
    //   dispatch(getAllProductByStoreId(e.data.data))
    // );
    // get_all_category_by_storeId(id).then((e)=> dispatch(getAllCategoryByStoreId(e.data.data)));
    // // const storeId= id;
    // setStoreId(id);

    // dispatch(setStoreId(id)); // Dispatch the setStoreId action

    navigate(`/retailer/distributor-shop?storeId=${id}&storeName=${encodeURIComponent(storeName)}`);
    window.scrollTo(0, 0);


  };
  return (

    <div className=" min-h-screen">
      {loadingSearch? (
        <div className="flex justify-center lg:p-72 sm:p-64 p-40">
          <PropagateLoader color="#ff5a1f" /> 
        </div>
      ) : (
        <div className="flex flex-wrap m-auto w-11/12 ">
          {SearchList === "" || SearchList === null || error ? (
            <div className="lg:text-3xl sm:text-2xl text-lg text-gray-600 h-screen mx-auto flex items-center">
              Search Not Found
            </div>
          ) : (
            SearchList.map((item) => (
              //   <div className="flex flex-col justify-center h-60 cursor-pointer">
              <div  className="flex flex-col justify-center mt-3 lg:mb-0 -mb-2 lg:w-1/3 md:w-2/4 sm:w-2/6 p-4 cursor-pointer">
                <div className="relative grid grid-cols-2 lg:h-64 h-52 md:flex-row md:space-y-0 w-full rounded-xl shadow-lg p-3 max-w-xs md:max-w-3xl mx-auto border border-white bg-white" onClick={()=>onClickGetDataShop(item.id,item.name)}>
                  <div className="grid place-items-center  w-full h-full">
                    <img
                      src={getSafeImageSrc(item.bannerImage, noImage)}
                      onError={(e) => applyImageFallback(e, noImage)}
                      alt="tailwind logo"
                      className=" rounded-md lg:h-[227px] h-[183px] w-full"
                    />
                  </div>
                  <div className="w-full flex flex-col space-y-2 p-3 relative">
                    <h3 className="font-black capitalize text-gray-800 lg:text-lg text-base line-clamp overflow-hidden h-6">
                      {item.name}
                    </h3>
                    <p className="flex lg:text-[16px] text-[14px] items-center font-bold gap-2">
                      Rating:
                      <span>
                        <img
                          // src={(require("../../../assets/images/retailer/star.png")?.default || require("../../../assets/images/retailer/star.png"))}
                          alt=""
                        />
                      </span>{" "}
                      {/* 4.8 (87) */}
                      <span className="font-normal"> { parseFloat( item.rating).toFixed(2) }   </span>
                      <span className="-ml-1 font-normal text-gray-500">{`(${item.ratingCount})`}</span>
                    </p>
                    <p className="text-gray-500 lg:text-sm text-xs line-clamp overflow-hidden">
                      {item.address}
                    </p>
                    {/* category */}
                    <p className="flex flex-wrap line-clamp2 overflow-hidden h-12">
                      <span className="font-bold lg:text-base text-sm ">
                        Category : &nbsp;
                      </span>
                      {item.categories.map((data) => (
                      <span className="text-sm ">{data.name}, &nbsp;</span>
                    ))}
                    </p>

                    <button onClick={()=>onClickGetDataShop(item.id,item.name)} className="absolute -right-3 lg:text-sm text-xs lg:bottom-0  bottom-0 py-1 px-2 bg-[#f15b22] rounded-l-full text-white">
                      View detail
                    </button>
                  </div>
                </div>
              </div>
              // </div>
              //     <div className="flex flex-cols-4 w-[550px] h-[310px] cursor-pointer p-4 m-auto">
              //     <div className="flex flex-row  rounded-xl shadow-lg p-3 max-w-xs md:max-w-3xl mx-auto border border-white bg-white">
              //       <div className="w-full">
              //         <img
              //           src={item.bannerImage}
              //           alt="tailwind logo"
              //           className="h-[00px] w-full"
              //         />
              //       </div>
              //       <div className="w-full bg-gray-100">
              //         <h3 className="font-black text-gray-800 text-lg line-clamp overflow-hidden h-6">
              //           {item.name}
              //         </h3>
              //         <p className="flex text-[16px] items-center gap-2">
              //           Rating :{" "}
              //           <span>
              //             <img
              //               // src={(require("../../../assets/images/retailer/star.png")?.default || require("../../../assets/images/retailer/star.png"))}
              //               alt=""
              //             />
              //           </span>{" "}
              //           4.8 (87)
              //         </p>
              //         <p className="text-[#7777] text-sm">{item.address}</p>
              //         {/* category */}
              //         <p className="flex flex-wrap line-clamp2 overflow-hidden h-12">
              //           <span className="font-bold ">Category : &nbsp;</span>
              //           {/* {item.category.map((data) => (
              //             <span className="text-sm ">{data.categoryName}, &nbsp;</span>
              //           ))} */}
              //         </p>
              //         <div className="absolute right-0 text-sm bottom-2 py-1 px-2 bg-[#f15b22] rounded-l-full text-white">
              //           View detail
              //         </div>
              //       </div>
              //     </div>
              //   </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
