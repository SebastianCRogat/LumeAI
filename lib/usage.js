import { FULL_ACCESS_USER_ID } from "./constants";

export const LIMITS = {
  free: { standard: 0, deep: 0 },
  pro: { standard: 10, deep: 1 },
  business: { standard: 50, deep: 5 },
};

export function getLimit(tier, userId) {
  if (userId === FULL_ACCESS_USER_ID) return LIMITS.business;
  return LIMITS[tier] || LIMITS.free;
}
