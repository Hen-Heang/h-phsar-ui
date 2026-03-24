import { api } from "../../../utils/api";
import { setLoadingHistory } from "../../slices/distributor/orderHistorySlice";
import { setLoadingOrder } from "../../slices/retailer/orderSlice";

export const get_order_history = async (dispatch) => {
  try {
    dispatch(setLoadingHistory(true));
    const response = await api.get(
      `/distributor/history/order?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response || e;
  }
};
