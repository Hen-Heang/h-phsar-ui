import { api } from "../../../utils/api";

export const get_retailer_profile = async () => {
  try {
    const response = await api.get(`/buyers/profiles`);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const create_retailer_profile = async (payload) => {
  try {
    const response = await api.post(`/buyers/profiles`, payload);

    return response;
  } catch (e) {
    return e.response;
  }
};

export const edit_retailer_profile = async (payload) => {
  try {
    const response = await api.put(`/buyers/profiles`, payload);
    return response;
  } catch (e) {
    return e;
  }
};
