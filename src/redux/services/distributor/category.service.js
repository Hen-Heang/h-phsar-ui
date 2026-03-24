import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/http/api-client";
import { setLoadingCategory } from "../../slices/distributor/categorySlice";

export const get_all_category = async (dispatch) => {
  dispatch(setLoadingCategory(true));
  return apiGet("/api/v1/distributor/categories", {
    query: { pageNumber: 1, pageSize: 1000 },
  });
};

export const add_new_category = async (data) => {
  const category = data.name;
  return apiPost("/api/v1/distributor/categories", {
    query: { name: category },
  });
};

// delete the category
export const delete_category = async (id) => {
  return apiDelete(`/api/v1/distributor/categories/${id}`);
};
// delete the category
export const update_category = async (data, id) => {
  // const id = data.id;
  // const name = data.name;
  // console.log("category ID ", id);
  // console.log("category data ", data);
  // const category = data.name;
  // console.log("category ", category);
  return apiPut(`/api/v1/distributor/categories/${id}`, {
    query: { name: data },
  });
};
