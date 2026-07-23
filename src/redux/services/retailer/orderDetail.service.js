import { api } from "../../../utils/api";
import { setLoadingOrder } from "../../slices/retailer/orderSlice";

export const get_order_detail = async (dispatch) => {
  try {
    if (dispatch) dispatch(setLoadingOrder(true));
    const response = await api.get(
      `/buyers/orders?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
export const get_orderById = async (id) => {
  try {
    const response = await api.get(`/buyers/orders/${id}`, {
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
      `/buyers/orders/${id}/receive`,
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
      `/buyers/orders/confirm?storeId=${id}`,
      null,
      { skipAuthRedirect: true },
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
// Backend has no /orders/pending/cancel/{id} route — the real cancellation
// endpoint is POST /orders/{id}/cancel (added in the backend's Step 3C
// order-lifecycle work), not a PUT under /pending/cancel/.
export const delete_request = async (id) => {
  try {
    const response = await api.post(
      `/buyers/orders/${id}/cancel`,
      null,
      { skipAuthRedirect: true },
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
// Append-only audit trail of every status transition for this order
// (GET /api/v1/buyers/orders/{id}/history) — not yet wired into any screen.
export const get_order_status_history = async (id) => {
  try {
    const response = await api.get(`/buyers/orders/${id}/history`);
    return response;
  } catch (e) {
    return e.response;
  }
};
// export const update_dispatch=async(id)=>{
//     try {
//         const response = await api.put(`/buyers/orders/${id}/arrived`);
//         return response;
//     } catch (e) {
//         console.log(e);
//         return e.response;
//     }
// }
