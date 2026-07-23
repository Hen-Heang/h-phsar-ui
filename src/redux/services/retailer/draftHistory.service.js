import { api } from "../../../utils/api";
import { setLoadingDraft } from "../../slices/retailer/draftHistorySlice";
import { setLoadingOrder } from "../../slices/retailer/orderSlice";
export const get_draft_history = async (dispatch) => {
  try {
    dispatch(setLoadingDraft(true));
    const response = await api.get(
      `/buyers/history/draft?sort=desc&pageNumber=1&pageSize=1000`,
    );
    return response;
  } catch (e) {
    return e.response;
  }
};
export const delete_draft = async (id) => {
  try {
    const response = await api.delete(`/buyers/history/draft/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
};
export const draft_to_request = async (data) => {
  const id = data.id;
  try {
    const response = await api.put(`/buyers/history/draft/${id}`);
    return response;
  } catch (error) {
    return error.response;
  }
};
