import { api } from "../../../utils/api";
import { setLoadingHistory } from "../../slices/supplier/orderHistorySlice";
import { setLoadingOrder } from "../../slices/buyer/orderSlice";

export const get_order_history = async (dispatch) => {
  try {
    dispatch(setLoadingHistory(true));
    const response = await api.get(
      `/suppliers/history/order?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response || e;
  }
};

// Append-only audit trail of every status transition for this order
// (GET /api/v1/suppliers/orders/{orderId}/history) — not yet wired into any screen.
export const get_order_status_history = async (orderId) => {
  try {
    const response = await api.get(`/suppliers/orders/${orderId}/history`);
    return response;
  } catch (e) {
    return e.response || e;
  }
};
