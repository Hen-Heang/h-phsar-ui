import { api } from "../../../utils/api";
import { setLoadingCompleted } from "../../slices/supplier/orderPageSlice";

export const get_all_complete = async (dispatch) => {
  try {
    dispatch(setLoadingCompleted(true));
    const response = await api.get(
      `/suppliers/orders/complete?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    dispatch(setLoadingCompleted(false));
    return e.response;
  }
};
export const get_all_complete_withoutLoading = async () => {
  try {
    const response = await api.get(
      `/suppliers/orders/complete?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
