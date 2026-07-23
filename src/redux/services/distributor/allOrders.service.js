import { api } from "../../../utils/api";

export const get_all_orders = async () => {
  try {
    const response = await api.get(`/suppliers/orders?sort=desc&pageNumber=1&pageSize=1000`);
    return response;
  } catch (e) {
    return e.response || e;
  }
};
