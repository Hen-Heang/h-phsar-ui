import { api } from "../../../utils/api";
import { setLoadingHistoryRetail } from "../../slices/buyer/historySlice";
export const get_all_history = async (dispatch) => {
  try {
    dispatch(setLoadingHistoryRetail(true));
    const response = await api.get(
      `/buyers/history/order?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response || e;
  }
};
