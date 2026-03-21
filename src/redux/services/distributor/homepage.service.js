import { apiGet } from "@/lib/http/api-client";

export const get_all_activity = async () => {
  return apiGet("/api/v1/distributor/order_activities");
};
