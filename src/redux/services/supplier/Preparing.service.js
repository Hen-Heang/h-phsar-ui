import { api } from "../../../utils/api";
import { setLoadingTheOrder } from "../../slices/supplier/orderPageSlice";
import { setLoadingOrder } from "../../slices/buyer/orderSlice";
export const get_all_preparing = async (dispatch) => {
  try {
    dispatch(setLoadingTheOrder(true));
    const response = await api.get(
      `/suppliers/orders/preparing?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
export const get_finish = async (id) => {
  try {
    const response = await api.put(
      `/suppliers/orders/preparing/${id}`,
      // ,{
      //         headers: localStorage.getItem("token"),
      // }
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
