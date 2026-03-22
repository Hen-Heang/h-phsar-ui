import { api } from "../../../utils/api";

export const get_retailer_profile = async () => {
  try {
    const response = await api.get(`/retailer/profiles`);
    return response;
  } catch (e) {
    return e.response;
  }
};

export const create_retailer_profile = async (payload) => {
  try {
    const response = await api.post(`/retailer/profiles`, payload);

    return response;
  } catch (e) {
    return e.response;
  }
};

export const edit_retailer_profile = async (payload) => {
  try {
    const response = await api.put(`/retailer/profiles`, payload);
    return response;
  } catch (e) {
    return e;
  }
};
