import React, { useEffect } from 'react'

export default function NotfoundDistributor() {
  useEffect(() => {
    document.title = "H-Phsar | Page-Not-Found";
  }, []);
  return (
    <div className='bg-white '>
    <div className=''>
    <img
          src={(require("../../assets/images/distributor/error404dis.jpg")?.default || require("../../assets/images/distributor/error404dis.jpg"))}
          alt=""
          className="mx-auto bg-white"
        />
    </div>
</div>
  )
}

