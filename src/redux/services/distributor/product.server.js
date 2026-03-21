import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/http/api-client";
import { setLoading } from "../../slices/distributor/productSlice";

export const get_all_product_distributor = async (dispatch) => {
  dispatch(setLoading(true));
  return apiGet("/api/v1/distributor/products/sort", {
    query: { sort: "desc", by: "createdDate", pageNumber: 1, pageSize: 1000 },
  });
};

export const add_new_product_distributor = async (data) => {
  const products = data.map((item) => ({
    name: item.name,
    categoryId: item.categoryId,
    description: item.description,
    image: item.image,
    isPublish: item.isPublish,
    price: parseFloat(item.price),
    qty: parseInt(item.qty),
  }));
  return apiPost("/api/v1/distributor/products", { body: products });
};

export const update_product_distributor = async (data, id) => {
  return apiPut(`/api/v1/distributor/products/${id}`, { body: data });
};

export const delete_product_distributor = async (id) => {
  return apiDelete(`/api/v1/distributor/products/${id}`);
};

// publish  products
export const publish_product_distributor = async (id) => {
  return apiPut(`/api/v1/distributor/products/${id}/publish`);
};
export const unPublish_product_distributor = async (id) => {
  return apiPut(`/api/v1/distributor/products/${id}/unlist`);
};
// import products
export const import_product_distributor = async (data) => {
  const payload = [
    {
      id: parseInt(data.id),
      qty: parseInt(data.qty),
      price: parseFloat(data.price)
    }
  ];
  return apiPost("/api/v1/distributor/products/import", { body: payload });
};
