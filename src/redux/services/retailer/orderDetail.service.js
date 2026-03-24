import { api } from "../../../utils/api";
import { setLoadingOrder } from "../../slices/retailer/orderSlice";

export const get_order_detail = async (dispatch) => {
  try {
    if (dispatch) dispatch(setLoadingOrder(true));
    const response = await api.get(
      `/retailer/orders?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
export const get_orderById = async (id) => {
  try {
    const response = await api.get(`/retailer/orders/${id}`, {
      skipAuthRedirect: true,
    });
    return response;
  } catch (e) {
    return e.response;
  }
};
export const confirm_transaction = async (id) => {
  try {
    const response = await api.put(
      `/retailer/orders/${id}/recieve`,
      null,
      { skipAuthRedirect: true },
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
export const confirm_order = async (id) => {
  try {
    const response = await api.put(
      `/retailer/orders/confirm?storeId=${id}`,
      null,
      { skipAuthRedirect: true },
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
export const delete_request = async (id) => {
  try {
    const response = await api.put(
      `/retailer/orders/pending/cancel/${id}`,
      null,
      { skipAuthRedirect: true },
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
// export const update_dispatch=async(id)=>{
//     try {
//         const response = await api.put(`/retailer/orders/${id}/arrived`);
//         return response;
//     } catch (e) {
//         console.log(e);
//         return e.response;
//     }
// }
