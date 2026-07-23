import { api } from "../../../utils/api";
import { setLoadingNewOrder } from "../../slices/distributor/notification/notificationSlice";

export const get_all_notification = async (dispatch) => {
  try {
    dispatch(setLoadingNewOrder(true));
    const response = await api.get(`/suppliers/notifications`);
    return response;
  } catch (e) {
    dispatch(setLoadingNewOrder(false));
    return e.response;
  }
};
export const get_all_notification_withoutLoading = async () => {
  try {
    //   dispatch(setLoadingTheOrder(true));
    const response = await api.get(`/suppliers/notifications`);
    return response;
  } catch (e) {
    return e.response;
  }
};
export const read_notification_distributor = async (id) => {
  try {
    // console.log("Id from service", id);
    // dispatch(setLoadingTheOrder(true));
    const response = await api.put(`/suppliers/notifications/${id}/read`);
    return response;
  } catch (e) {
    return e.response;
  }
};
export const read_all_notification_distributor = async () => {
  try {
    // console.log("Id from service", id);
    // dispatch(setLoadingTheOrder(true));
    const response = await api.put(`/suppliers/notifications/read`);
    // console.log("All notifications service returned", response);
    return response;
  } catch (e) {
    return e.response;
  }
};
