import { apiGet } from "@/utils/api";

export const get_all_activity = async () => {
  return apiGet("/api/v1/suppliers/order_activities");
};
