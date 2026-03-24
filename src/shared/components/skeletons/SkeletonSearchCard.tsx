import React from "react";

export default function SkeletonSearchCard() {
  // const [fixCard, setFixCard] = useState([
  //   {
  //     id: 1,
  //   },
  //   {
  //     id: 2,
  //   },
  //   {
  //     id: 3,
  //   },
  //   {
  //     id: 4,
  //   },
  //   {
  //     id: 5,
  //   },
  //   {
  //     id: 6,
  //   },
  // ]);
  return (
    <div>
      <div className="mx-auto w-full">
        {/* <Link className="flex flex-wrap my-5">
          <svg
            className="w-3 mr-3 fill-orange-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
          >
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
          </svg>
          <div>
            <p className="font-bold ">Back</p>
          </div>
        </Link> */}

        <div role="status" className="w-full animate-pulse ">
          <div className="flex items-center justify-center w-full lg:h-[400px] h-[180px] bg-gray-300 rounded ">
            <svg
              className="w-1/2 h-14 text-gray-200 "
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 640 512"
            >
              <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
            </svg>
          </div>
          <div className="border border-gray-200 h-52 p-7 shadow-sm">
            <div className="h-4 bg-gray-200 rounded-full  lg:w-2/5"></div>
            <div className="h-4 bg-gray-200 rounded-full   lg:w-96 mt-8 mb-5"></div>
            <div className="h-4 bg-gray-200 rounded-full   lg:w-96 mb-5"></div>
            <div className="h-4 bg-gray-200 rounded-full   lg:w-96 "></div>
          </div>
        </div>
      </div>
    </div>
  );
}
