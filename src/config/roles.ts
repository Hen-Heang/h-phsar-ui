export const ROLES = {
  SUPPLIER: "SUPPLIER",
  BUYER: "BUYER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Verified directly against the backend (h-phsar-api-full):
// AppUser.getAuthorities() only branches on roleId 1 (SUPPLIER) and 2 (BUYER),
// and tb_role only ever seeds those two ids. There is no roleId for ADMIN yet —
// do not add a case for it until the backend assigns and wires one up.
export function roleIdToRole(roleId: number): Role {
  switch (roleId) {
    case 1:
      return ROLES.SUPPLIER;
    case 2:
      return ROLES.BUYER;
    default:
      throw new Error(`Unsupported roleId: ${roleId}`);
  }
}
