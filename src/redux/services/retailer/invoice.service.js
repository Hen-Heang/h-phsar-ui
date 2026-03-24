import { api } from "../../../utils/api";

export const get_invoice = async (id) => {
  try {
    const response = await api.get(`/retailer/orders/invoice/${id}`, {
      skipAuthRedirect: true,
    });
    return response;
  } catch (e) {
    return e.response;
  }
};
