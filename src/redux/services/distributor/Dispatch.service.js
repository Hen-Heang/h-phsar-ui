import { api } from "../../../utils/api";
import { setLoadingTheOrder } from "../../slices/distributor/orderPageSlice";
import { setLoadingOrder } from "../../slices/retailer/orderSlice";
export const get_all_dispatch = async (dispatch) => {
  try {
    dispatch(setLoadingTheOrder(true));
    const response = await api.get(
      `/suppliers/orders/dispatching?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
export const get_delivered = async (id) => {
  try {
    const response = await api.put(`/suppliers/orders/dispatching/${id}`);
    return response;
  } catch (e) {
    return e.response;
  }
};
