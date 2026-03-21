import axios from "axios";

// export const api = axios.create({
//   baseURL: "http://localhost:8888/api/v1",
//   headers: {
//     "Content-Type": "application/json; charset=utf",
//     // "Accept":"application/json, text/plain, /",
//     // "Content-Type": "multipart/form-data",
//     // Authorization: `Bearer ${token}`
//   },
// });

// api.interceptors.request.use((s) => {
//   const token = localStorage.getItem("token");
//   s.headers.Authorization = `Bearer ${token}`;
//   return s;
// });

export const api = axios.create({
  baseURL: "http://localhost:8888/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});
