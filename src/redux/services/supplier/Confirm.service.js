import { api } from "../../../utils/api";
import { setLoadingTheOrder } from "../../slices/supplier/orderPageSlice";
export const get_all_confirm = async (dispatch) => {
  try {
    dispatch(setLoadingTheOrder(true));
    const response = await api.get(
      `/suppliers/orders/confirming?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
export const get_all_confirm_withoutLoading = async () => {
  try {
    const response = await api.get(
      `/suppliers/orders/confirming?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
