import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyAZf139ypn0aoTTSlEfl7OLhoAWt2ia5-Y",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "wm-file-upload.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "wm-file-upload",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "wm-file-upload.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "828892156329",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:828892156329:web:50b8c7d75d08881f19f4b8",
};

const app = initializeApp(firebaseConfig);
const storageFirebase = getStorage(app);

export { storageFirebase };
