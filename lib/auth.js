import { FULL_ACCESS_USER_ID } from "./constants";

export function isAdmin(user) {
  if (!user) return false;
  if (user.id === FULL_ACCESS_USER_ID) return true;
  const adminEmail = typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail) return true;
  if (!user.email) return false;
  return user.email.toLowerCase() === adminEmail.trim().toLowerCase();
}
