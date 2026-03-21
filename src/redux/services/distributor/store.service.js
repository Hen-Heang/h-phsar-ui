import { apiGet, apiPost, apiPut } from "@/lib/http/api-client";

export const get_store_distributor_profile = async () => {
  return apiGet("/api/v1/distributor/stores/user/");
};

export const add_new_store = async (data) => {
  return apiPost("/api/v1/distributor/stores", {
    body: data,
  });
};

export const update_store_distributor = async (data) => {
  return apiPut("/api/v1/distributor/stores", {
    body: data,
  });
};
