export const ROLES = {
  SUPPLIER: "SUPPLIER",
  BUYER: "BUYER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Verified directly against the backend (h-phsar-api-full):
// AppUser.getAuthorities() branches on roleId 1 (SUPPLIER), 2 (BUYER), and
// 3 (ADMIN); tb_role seeds all three ids (DatabaseInitializer.java).
export function roleIdToRole(roleId: number): Role {
  switch (roleId) {
    case 1:
      return ROLES.SUPPLIER;
    case 2:
      return ROLES.BUYER;
    case 3:
      return ROLES.ADMIN;
    default:
      throw new Error(`Unsupported roleId: ${roleId}`);
  }
}
