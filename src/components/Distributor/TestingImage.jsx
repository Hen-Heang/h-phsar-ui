import { computeHeadingLevel } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import React, { useState, useRef } from "react";

const TestingImage = () => {

  const hiddenFileInput = useRef(null);

  //   const handleImageChange = (event) => {
  //     const file = event.target.files[0];
  //     const imgname = event.target.files[0].name;
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onloadend = () => {
  //       const img = new Image();
  //       img.src = reader.result;
  //       img.onload = () => {
  //         const canvas = document.createElement("canvas");
  //         const maxSize = Math.max(img.width, img.height);
  //         canvas.width = maxSize;
  //         canvas.height = maxSize;
  //         const ctx = canvas.getContext("2d");
  //         ctx.drawImage(
  //           img,
  //           (maxSize - img.width) / 2,
  //           (maxSize - img.height) / 2
  //         );
  //         canvas.toBlob(
  //           (blob) => {
  //             const file = new File([blob], imgname, {
  //               type: "image/png",
  //               lastModified: Date.now(),
  //             });

  //             // console.log(file);
  //             setImage(file);
  //           },
  //           "https://fir-image-upload-8b76c.web.app/photo.png",
  //           0.8
  //         );
  //       };
  //     };
  //   };

  //   const handleUploadButtonClick = (file) => {
  //     var myHeaders = new Headers();
  //     const token = "adhgsdaksdhk938742937423";
  //     myHeaders.append("Authorization", `Bearer ${token}`);

  //     var formdata = new FormData();
  //     formdata.append("file", file);

  //     var requestOptions = {
  //       method: "POST",
  //       headers: myHeaders,
  //       body: formdata,
  //       redirect: "follow",
  //     };

  //     fetch("https://trickuweb.com/upload/profile_pic", requestOptions)
  //       .then((response) => response.text())
  //       .then((result) => {
  //         console.log(JSON.parse(result));
  //         const profileurl = JSON.parse(result);
  //         setImage(profileurl.img_url);
  //       })
  //       .catch((error) => console.log("error", error));
  //   };

  //   console.log("image : ",image)
  //   const handleClick = (event) => {
  //     hiddenFileInput.current.click();
  //   };
const [image, setImage] = useState(null);
  const handleChange=(e) => {
    console.log(e.target.files);
    console.log(URL.createObjectURL(e.target.file[0]));
    setImage(URL.createObjectURL(e.target.file[0]));
    
  }
  console.log("image",image)
  return (
    <div>
      {/* <div className="image-upload-container">
        <div className="box-decoration">
          <label htmlFor="image-upload-input" className="image-upload-label">
            {image ? image.name : "Choose an image"}
          </label>
          <div onClick={handleClick} style={{ cursor: "pointer" }}>
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="upload image"
                className="img-display-after"
              />
            ) : (
              <img
                src="https://fir-image-upload-8b76c.web.app/photo.png"
                alt="upload image"
                className="img-display-before"
              />
            )}

            <input
              id="image-upload-input"
              type="file"
              onChange={handleImageChange}
              ref={hiddenFileInput}
              style={{ display: "none" }}
            />
          </div>

          <button
           className="p-5 bg-primary"
            // onClick={handleUploadButtonClick}
          >
            Upload
          </button>
        </div>
      </div> */}
      <div className="flex justify-center mt-8">
        <div className="max-w-2xl rounded-lg shadow-xl bg-gray-50">
          <div className="m-4">
            <label className="inline-block mb-2 text-gray-500">File Upload</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-4 border-blue-200 border-dashed hover:bg-gray-100 hover:border-gray-300">
                <div className="flex flex-col items-center justify-center pt-7">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                    Attach a file
                  </p>
                </div>
                <input type="file" className="opacity-0" onChange={handleChange}/>
              </label>
            </div>
          </div>
          <div className="flex justify-center p-2">
            <button className="w-full px-4 py-2 text-white bg-blue-500 rounded shadow-xl">
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingImage;
