import { apiGet, apiPost, apiPut } from "@/lib/http/api-client";

export const get_account_distributor = async () => {
  return apiGet("/api/v1/distributor/profiles/");
};

export const add_new_account = async (data) => {
  return apiPost("/api/v1/distributor/profiles/", {
    body: data,
  });
};

export const update_account = async (data) => {
  return apiPut("/api/v1/distributor/profiles/", {
    body: data,
  });
};
