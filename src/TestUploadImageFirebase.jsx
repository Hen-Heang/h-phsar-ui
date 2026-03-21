import React from "react";
import { useState } from "react";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
// import { storage } from "./firebase";
import { storageFirebase } from "./firebaseUploadImage";
import { v4 } from "uuid";
const TestUploadImageFirebase = () => {
  const [uploadImage, setUploadImage] = useState(null);

  const onUploadImage = () => {
    if (uploadImage === null) return ;
    const imageRef = ref(storageFirebase, `image/${uploadImage.name + v4()}`);
    uploadBytes(imageRef, uploadImage).then(() => {
      return getDownloadURL(imageRef);
    })
    .then((downloadURL) => {
      alert("Image uploaded successfully");
      console.log(downloadURL);
    })
    .catch((error) => {
      console.log(error);
    });
  };

  return (
    <div className="flex flex-col w-1/5 mx-auto gap-5">
      <input type="file" onChange={(e) => setUploadImage(e.target.files[0])} />
      <button
        onClick={onUploadImage}
        className="p-5 bg-primaryColorRetailer text-white rounded-xl"
      >
        upload
      </button>
    </div>
  );
};

export default TestUploadImageFirebase;
