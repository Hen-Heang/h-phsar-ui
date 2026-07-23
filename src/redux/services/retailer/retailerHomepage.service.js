import { useAppSelector as useSelector } from "@/redux/hooks";
import { api } from "../../../utils/api";
import { store } from "../../store";
import {
  setLoadingAdd,
  setLoadingCard,
  setLoadingCategoryByShop,
  setLoadingPrice,
  setLoadingStore,
} from "../../slices/retailer/homepageSlice/allShopSlice";
import { set } from "../../slices/retailer/itemsQuantitySlice";
import { setLoadingCategory } from "../../slices/distributor/categorySlice";

export const get_all_highest_rate = async (sort, pageNumber, pageSize) => {
  try {
    const response = await api.get(
      `/buyers/stores/sort/rated?sort=desc&pageNumber=1&pageSize=100`,
    );
    // console.log("hahaha : " ,response.data.data);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const get_all_store = async () => {
  try {
    const response = await api.get("/buyers/stores/");
    // console.log("response : ",response);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const get_all_new_store = async (sort, pageNumber, pageSize) => {
  try {
    const response = await api.get(
      `/buyers/stores/sort/date?sort=desc&pageNumber=1&pageSize=100`,
    );
    // console.log("fetchg get_all_new_store : ",response);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const get_all_orders = async (sort, pageNumber, pageSize) => {
  try {
    const response = await api.get(
      "/buyers/orders?sort=desc&pageNumber=1&pageSize=100",
    );
    // console.log(" response : ", response);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const get_all_favorite = async (pageNumber, pageSize) => {
  try {
    const response = await api.get(
      `/buyers/stores/bookmark?pageNumber=1&pageSize=1000`,
    );
    // console.log(" response : ", response);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const get_all_order_history = async (sort, pageNumber, pageSize) => {
  try {
    const response = await api.get(
      `/buyers/history/order?sort=desc&pageNumber=1&pageSize=1000`,
    );
    // console.log(response);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const get_all_order_draft = async (sort, pageNumber, pageSize) => {
  try {
    const response = await api.get(
      `/buyers/history/draft?sort=desc&pageNumber=1&pageSize=1000`,
    );
    // console.log("response : ", response);
    return response;
  } catch (e) {
    return e.response;
  }
};

// const {storeId} = useSelector((state)=> state.getDataAllShop )

// console.log("response get_all_product_by_storeId : ", response);
// const {storeId} = useSelector((state)=> state.getDataAllShop )

export const get_store_by_id = async (storeId, dispatch) => {
  dispatch(setLoadingStore(true));
  try {
    const response = await api.get(`/buyers/stores/${storeId}`);
    // console.log("response get_store_by_id : ", response);
    return response;
  } catch (e) {
    return e.response;
  }
  dispatch(setLoadingStore(false));
};

export const get_all_product_by_storeId = async (storeId, dispatch) => {
  dispatch(setLoadingCard(true));
  try {
    const response = await api.get(
      `/buyers/stores/${storeId}/products?sort=desc&by=created_date`,
    );
    // console.log("response get_all_product_by_storeId : ", response);
    return response;
  } catch (e) {
    return e.response;
  }
  dispatch(setLoadingCard(false));
};

export const get_all_category_by_storeId = async (storeId, dispatch) => {
  dispatch(setLoadingCategoryByShop(true));
  try {
    const response = await api.get(`/buyers/stores/${storeId}/category`);
    // console.log("response get_all_category_by_storeId : ", response);
    return response;
  } catch (e) {
    return e.response;
  }
  dispatch(setLoadingCategoryByShop(false));
};

export const get_all_product_sort_by_created_date = async (
  storeId,
  dispatch,
) => {
  dispatch(setLoadingAdd(true));
  try {
    const response = await api.get(
      `/buyers/stores/${storeId}/products?sort=asc&by=created_date`,
    );
    // console.log("get_all_product_in_cart : " ,response);
    return response;
  } catch (e) {
    dispatch(setLoadingAdd(false));
    return e;
  }
};

export const get_all_product_sort_by_price = async (storeId, dispatch) => {
  dispatch(setLoadingPrice(true));
  try {
    const response = await api.get(
      `/buyers/stores/${storeId}/products?sort=asc&by=price`,
    );
    // console.log("get_all_product_in_cart gagagaga : " ,response);
    return response;
  } catch (e) {
    dispatch(setLoadingPrice(false));
    return e;
  }
};

export const get_all_product_by_category = async (storeId, categoryId) => {
  try {
    const response = await api.get(
      `/buyers/stores/${storeId}/products/category?categoryId=${categoryId}`,
    );
    // console.log("get_all_product_by_category dwdww: ", response);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const add_product_to_cart = async (storeId, productId, qty) => {
  try {
    const response = await api.post(
      `/buyers/orders/cart?storeId=${storeId}`,
      [
        {
          productId: productId,
          qty: qty,
        },
      ],
    );

    // console.log("add_product_to_cart dwdww: ", response);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const view_product_in_cart = async (storeId) => {
  try {
    const response = await api.get(
      `/buyers/orders/cart/details?pageNumber=1&pageSize=1000&${storeId}`,
    );
    // console.log("view_product_in_cart : " ,response);
    return response;
  } catch (e) {
    return e;
  }
};

export const get_all_product_in_cart = async () => {
  try {
    const response = await api.get("buyers/orders/carts");
    return response;
  } catch (e) {
    return e;
  }
};

export const delete_product_in_cart = async (productId) => {
  try {
    const response = await api.delete(
      `/buyers/orders/cart/product?productId=${productId}`,
    );
    // console.log("get_all_product_in_cart : " ,response);
    return response;
  } catch (e) {
    return e;
  }
};

export const confirm_order_from_cart = async () => {
  try {
    const response = await api.put(`buyers/orders/confirm`, null, {
      skipAuthRedirect: true,
    });
    return response;
  } catch (e) {
    return e.response;
  }
};

export const cancel_order_from_cart = async () => {
  try {
    const response = await api.delete(`buyers/orders/cart/cancel`);
    // console.log("cancel_order_from_cart : " ,response);
    return response;
  } catch (e) {
    return e;
  }
};

export const bookmark_store = async (storeId) => {
  try {
    const response = await api.post(`buyers/stores/${storeId}/bookmark/`);
    return response;
  } catch (e) {
    return e;
  }
};

export const get_all_bookmark_store = async () => {
  try {
    const response = await api.get(
      `buyers/stores/bookmark?pageNumber=1&pageSize=1000`,
    );
    // console.log("gagag",response)
    return response;
  } catch (e) {
    return e;
  }
};

export const remove_bookmark_store = async (storeId) => {
  try {
    const response = await api.delete(
      `buyers/stores/${storeId}/bookmark/remove`,
    );
    return response;
  } catch (e) {
    return e;
  }
};

export const save_to_draft = async () => {
  try {
    const response = await api.put(`buyers/orders/cart/draft`);
    return response;
  } catch (e) {
    return e;
  }
};

export const get_all_cart = async () => {
  try {
    const response = await api.get(`buyers/orders/carts`);
    return response;
  } catch (e) {
    return e;
  }
};

// export const remove_bookmark_store=async(storeId)=>{
//   try{
//     const response = await api.delete(`buyers/stores/${storeId}/bookmark/remove`)
//     return response ;

//   }catch(e){
//     console.log(e)
//     return e;
//   }
// }
