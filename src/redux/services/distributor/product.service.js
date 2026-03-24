import { api } from "../../../utils/api";
export const get_detail_product = async (id) => {
  try {
    const response = await api.get(`/distributor/orders/${id}/details`);
    return response;
  } catch (e) {
    return e.response;
  }
};
