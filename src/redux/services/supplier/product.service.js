import { api } from "../../../utils/api";
export const get_detail_product = async (id) => {
  try {
    const response = await api.get(`/suppliers/orders/${id}/details`);
    return response;
  } catch (e) {
    return e.response;
  }
};
