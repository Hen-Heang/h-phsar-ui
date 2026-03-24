import React from "react";
import { Star } from "lucide-react";

export default function CompleteOrder(props) {
  return (
    <div>
      {/* <React.Fragment>
        <Modal
          show={props.complete}
          size="xl"
          popup={true}
          onClose={props.setComplete}
        >
          <Modal />
          <Modal.Header className="text-center bg-retailerPrimary w-full">
            <h1 className="text-center text-white font-semiblod ml-56 text-xl">
              Products
            </h1>
            <p
              className="text-white float-right absolute right-2 top-0 bg-retailerPrimary w-18 p-4 h-12"
              onClick={props.setComplete}
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
            </p>
          </Modal.Header>
          <Modal.Body>
            <div>
              {!loadingPro ?
              <div className="w-full rounded-lg border border-gray-400 mt-3">
                <div className="flex flex-wrap p-4">
                  <div className="w-3/5">
                    <h1 className="text-black font-semibold">
                      Order ID: #{orderProduct.id}
                    </h1>
                    <p className="text-sm">Order date :
                      {new Date(orderProduct.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="w-2/5 justify-end">
                    <p onClick={() => {setOpen(!isOpen); handleProductById(orderProduct.id)}} className="text-retailerPrimary font-semibold text-end">
                      Order Detail
                    </p>
                  </div>
                </div>
                <hr className="bg-gray-500" />
                <div className='h-[96px] overflow-hidden'>
                {orderDetail.map((item) => (
                  <div className="flex flex-wrap p-4 overflow-hidden">
                    <div className="w-4/5 flex">
                      <img
                        className="w-14 h-14 "
                        src={item.image}
                        alt="product image"
                      />
                      <div className="pl-3">
                        <div className="text-base font-semibold text-black mt-4">
                          {item.productName}
                        </div>
                      </div>
                    </div>
                    <div className="w-1/5 justify-end text-end">
                      <h1 className="text-black font-semibold">
                      $ {item.subTotal === null
                              ? <span>0.00</span>
                              : (item.subTotal).toFixed(2)
                            }
                        </h1>
                      <p className="text-newGray text-sm">Qty: {item.qty}</p>
                    </div>
                  </div>
                ))}
                </div>
              </div>        
              : <div className="w-full rounded-lg border border-gray-400 mt-3 relative">
              <div className="flex flex-wrap p-4">
                <div className="w-3/5">
                  <h1 className="text-black font-semibold">
                    Order ID:
                  </h1>
                  <p className="text-sm">Order date : 
                  </p>
                </div>
                <div className="w-2/5 justify-end">
                  <p onClick={() => { setOpen(!isOpen); handleProductById(item.id); setComplete(!complete) }} className="text-retailerPrimary font-semibold text-end">
                    Order Detail
                  </p>
                </div>
              </div>
              <div className='w-full mx-auto top-46 absolute text-center '>
              <PropagateLoader color="#F15B22" />
            </div>
              <hr className="bg-gray-500" />
                <div className="flex flex-wrap p-4">
                  <div className="w-4/5 flex">
                    <div className='w-14 h-14 bg-slate-300'></div>
                    <div className="pl-3">
                      <div className="text-base font-semibold text-black w-14 mt-4 h-2 bg-slate-300">
                      </div>
                    </div>
                  </div>
                  <div className="w-1/5 justify-end text-end">
                    <h1 className="text-black font-semibold">${item.subTotal}</h1>
                    <p className="text-newGray text-sm">Qty: {item.qty}</p>
                  </div>
                </div>
            </div>
 } 
              <div className="w-full rounded-lg border border-gray-400 mt-3">
                <div className="flex flex-wrap p-4">
                  <h1 className="text-xl text-black font-semibold">
                    Track your order
                  </h1>
                </div>
                <div className="w-96 flex justify-center mx-auto relative -mt-6">
                  <hr className="border-dashed rounded-full w-64 border-2 absolute border-retailerPrimary top-9" />
                  <div className="flex flex-col p-4 w-32 items-center">
                    <div className="w-12 h-12 border-4 border-orange-200  rounded-full bg-retailerPrimary mr-5">
                      <svg
                        className="fill-white absolute w-6 ml-2 mt-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M190.5 68.8L225.3 128H224 152c-22.1 0-40-17.9-40-40s17.9-40 40-40h2.2c14.9 0 28.8 7.9 36.3 20.8zM64 88c0 14.4 3.5 28 9.6 40H32c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32H480c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32H438.4c6.1-12 9.6-25.6 9.6-40c0-48.6-39.4-88-88-88h-2.2c-31.9 0-61.5 16.9-77.7 44.4L256 85.5l-24.1-41C215.7 16.9 186.1 0 154.2 0H152C103.4 0 64 39.4 64 88zm336 0c0 22.1-17.9 40-40 40H288h-1.3l34.8-59.2C329.1 55.9 342.9 48 357.8 48H360c22.1 0 40 17.9 40 40zM32 288V464c0 26.5 21.5 48 48 48H224V288H32zM288 512H432c26.5 0 48-21.5 48-48V288H288V512z" />
                      </svg>
                    </div>
                    <p className="text-xs mt-3">Preparing</p>
                  </div>
                  <div className="flex flex-col p-4 w-32 items-center">
                    <div className="w-12 h-12 border-4 border-orange-200 rounded-full bg-retailerPrimary mr-5">
                      <svg
                        className="fill-white w-7 mt-2 ml-1.5 absolute"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                      >
                        <path d="M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
                      </svg>
                    </div>
                    <p className="text-xs mt-3">Shipping</p>
                  </div>
                  <div className="flex flex-col p-4 w-32 items-center">
                    <div className="w-12 h-12 border-4 border-orange-200  text-center rounded-full bg-retailerPrimary mr-5">
                      <svg
                        className="fill-white w-6 mt-2 ml-2 absolute bg-retailerPrimary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                      </svg>
                    </div>
                    <p className="text-xs mt-3">Delivered</p>
                  </div>
                </div>
              </div>
              <div className="w-full rounded-lg border border-gray-400 mt-3">
                <div className="flex flex-wrap w-full">
                  <div className="w-2/12 p-4 flex items-center justify-center">
                    <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="w-7/12 p-4">
                    <div className="">
                      <h1 className="text-black font-semibold">
                        Don’t forget to rate{" "}
                      </h1>
                      <p className="text-xs">
                        Keep rating us for providing good service
                      </p>
                    </div>
                    <div className="flex flex-wrap mt-1">
                      <div style={styles.stars}>
                        {stars.map((_, index) => {
                          return (
                            <FaStar
                              key={index}
                              size={24}
                              onClick={() => handleClick(index + 1)}
                              onMouseOver={() => handleMouseOver(index + 1)}
                              onMouseLeave={handleMouseLeave}
                              color={(hoverValue || currentValue) > index ? colors.orange : colors.grey}
                              style={{
                                marginRight: 10,
                                cursor: "pointer"
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className='w-3/12 p-4 mt-2.5'>
                    <button onClick={()=>{setConfirm(!confirm);setComplete(!complete)}} className='bg-retailerPrimary text-white w-full rounded-lg py-2'>Confirm</button>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </React.Fragment> */}
    </div>
  );
}
// const styles = {
//     container: {
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center"
//     },
//     stars: {
//       display: "flex",
//       flexDirection: "row",
//     },
//     textarea: {
//       border: "1px solid #a9a9a9",
//       borderRadius: 5,
//       padding: 10,
//       margin: "20px 0",
//       minHeight: 100,
//       width: 300
//     },
//     button: {
//       border: "1px solid #a9a9a9",
//       borderRadius: 5,
//       width: 300,
//       padding: 10,
//     }

//   };
