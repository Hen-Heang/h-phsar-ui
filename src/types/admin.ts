// Matches AdminUserSummaryDto in h-phsar-api-full (model/appUser/AdminUserSummaryDto.java)
export interface AdminUserSummary {
  id: number;
  email: string;
  roleId: number;
  fullName: string;
  phone: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdDate: string;
}

// Matches BaseController.okPage() in h-phsar-api-full (common/api/PagedResponse.java)
export interface PagedBackendResponse<T> {
  status: number;
  message: string;
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  timestamp: string;
}

export interface UpdateActiveStatusRequest {
  isActive: boolean;
}
