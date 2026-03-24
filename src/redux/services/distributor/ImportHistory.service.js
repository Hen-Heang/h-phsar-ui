import { api } from "../../../utils/api";
import { setLoadingHistory } from "../../slices/distributor/importHistorySlice";
export const get_import_history = async (dispatch) => {
  try {
    dispatch(setLoadingHistory(true));
    const response = await api.get(
      `/distributor/history/import?sort=asc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
