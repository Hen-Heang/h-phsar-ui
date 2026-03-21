import React from 'react'

export default function AllShop() {
    const cardsData = [
        { id: 1,},
        { id: 2, },
        { id: 3, },
        { id: 4, },
        { id: 5, },
        { id: 6, },
        { id: 7, },
        { id: 8, },
        { id: 9, },
      ];
  return (
    <div>
<div className='flex flex-row justify-center w-full mt-10 animate-pulse'>
    <div className="h-16 bg-gray-200 rounded-md  dark:bg-gray-700 w-[80%] mb-4"></div>

    </div>
    {/* div 5 */}
    <div className='mt-10'>
    <div className="ml-12 grid grid-cols-1 sm:grid-cols-3 gap-3 m-auto">
    {cardsData.map((card) => (
          <div
            key={card.id}
            role="status"
            className="max-w-sm flex flex-row rounded-md bg-white border mb-9 border-gray-200 shadow animate-pulse p-4 dark:border-gray-700"
          >
            <div className="flex items-center w-1/2 justify-center mt-1 h-24 bg-gray-300 rounded dark:bg-gray-700">
              <svg
                className="w-10 h-10 text-gray-200 dark:text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 640 512"
              >
                <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
              </svg>
            </div>
            <div className="w-1/2">
              <div className="flex flex-col justify-center items-center mt-6 ">
                <div className="h-2.5 bg-gray-200 rounded-sm dark:bg-gray-700 w-10 sm:w-14 lg:w-36 mb-5"></div>
                <div className="h-2 bg-gray-200 rounded-md dark:bg-gray-700 w-10 sm:w-14 lg:w-32 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded-md dark:bg-gray-700 w-10 sm:w-14 lg:w-32 mb-4 "></div>
                <div className="h-2 bg-gray-200 rounded-md dark:bg-gray-700 w-10 sm:w-14 lg:w-32 mb-4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}
