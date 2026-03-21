import React from 'react'

export default function NotFoundRetailer() {
  return (
    <div className='bg-white w-[80%] mx-auto h-2/5'>
        <div className=''>
        <img
              src={(require("../../assets/images/retailer/error404.jpg")?.default || require("../../assets/images/retailer/error404.jpg"))}
              alt=""
              className="mx-auto bg-white"
            />
        </div>
    </div>
  )
}
