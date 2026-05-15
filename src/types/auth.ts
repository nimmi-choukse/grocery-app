export type UserRole = "customer" | "owner" | "delivery";

export const USER_ROLES: readonly UserRole[] = [
  "customer",
  "owner",
  "delivery",
];

export const ROLE_HOME_PATHS: Record<UserRole, string> = {
  customer: "/",
  owner: "/admin",
  delivery: "/delivery",
};

/** Routes that require a specific role (prefix match). */
export const ROLE_PROTECTED_PREFIXES: Record<string, UserRole> = {
  "/admin": "owner",
  "/delivery": "delivery",
};

export function isUserRole(value: string | null | undefined): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function roleFromSearchParam(
  value: string | null | undefined,
): UserRole {
  return isUserRole(value) ? value : "customer";
}
