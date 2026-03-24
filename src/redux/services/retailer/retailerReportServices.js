import { api } from "../../../utils/api";

export const get_retailer_report = async (startDate, endDate) => {
  try {
    // console.log("Hi start : ", startDate);
    // console.log("Hi end : ", endDate);
    const response = await api.get(
      `retailer/reports?startDate=${startDate}&endDate=${endDate}`,
    );
    return response;
  } catch (e) {
    return e;
  }
};
