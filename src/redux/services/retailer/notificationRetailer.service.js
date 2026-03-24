import { api } from "../../../utils/api";

export const get_all_notification_retailer = async () => {
  try {
    // console.log("Id from service", id);
    // dispatch(setLoadingTheOrder(true));
    const response = await api.get(`/retailer/notifications`);
    //   console.log("All notifications service returned", response);
    return response;
  } catch (e) {
    return e.response;
  }
};
export const seen_notification_retailer = async (id) => {
  try {
    // console.log("Id from service", id);
    // dispatch(setLoadingTheOrder(true));
    const response = await api.put(`retailer/notifications/${id}/read`);
    // console.log("All notifications service returned", response);
    return response;
  } catch (e) {
    return e.response;
  }
};
export const mark_read_all_notification_retailer = async () => {
  try {
    // console.log("Id from service", id);
    // dispatch(setLoadingTheOrder(true));
    const response = await api.put(`/retailer/notifications/read`);
    return response;
  } catch (e) {
    return e.response;
  }
};
