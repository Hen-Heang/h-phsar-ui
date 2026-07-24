import { apiGet, apiPatch, type ApiResult } from "@/utils/api";
import type {
  AdminUserSummary,
  PagedBackendResponse,
  UpdateActiveStatusRequest,
} from "@/types/admin";
import type { BackendResponse } from "@/types/auth";

export type AdminUserListApiResponse = ApiResult<
  PagedBackendResponse<AdminUserSummary>
>;
export type AdminUserApiResponse = ApiResult<
  BackendResponse<AdminUserSummary>
>;

export interface ListParams {
  search?: string;
  pageNumber: number;
  pageSize: number;
}

export const listSuppliers = (
  params: ListParams,
): Promise<AdminUserListApiResponse> =>
  apiGet<PagedBackendResponse<AdminUserSummary>>("/api/v1/admin/suppliers", {
    query: { ...params },
  });

export const updateSupplierActiveStatus = (
  id: number,
  isActive: boolean,
): Promise<AdminUserApiResponse> =>
  apiPatch<BackendResponse<AdminUserSummary>>(
    `/api/v1/admin/suppliers/${id}/status`,
    { body: { isActive } satisfies UpdateActiveStatusRequest },
  );

export const listBuyers = (
  params: ListParams,
): Promise<AdminUserListApiResponse> =>
  apiGet<PagedBackendResponse<AdminUserSummary>>("/api/v1/admin/buyers", {
    query: { ...params },
  });

export const updateBuyerActiveStatus = (
  id: number,
  isActive: boolean,
): Promise<AdminUserApiResponse> =>
  apiPatch<BackendResponse<AdminUserSummary>>(
    `/api/v1/admin/buyers/${id}/status`,
    { body: { isActive } satisfies UpdateActiveStatusRequest },
  );
