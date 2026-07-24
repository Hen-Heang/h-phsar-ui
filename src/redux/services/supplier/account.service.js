import { apiGet, apiPost, apiPut } from "@/utils/api";

export const get_account_distributor = async () => {
  return apiGet("/api/v1/suppliers/profiles/");
};

export const add_new_account = async (data) => {
  return apiPost("/api/v1/suppliers/profiles/", {
    body: data,
  });
};

export const update_account = async (data) => {
  return apiPut("/api/v1/suppliers/profiles/", {
    body: data,
  });
};
