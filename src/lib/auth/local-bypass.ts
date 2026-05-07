export const LOCAL_BYPASS_ENABLED =
  process.env.NEXT_PUBLIC_LOCAL_AUTH_BYPASS === "true";

export const LOCAL_BYPASS_COOKIE = "grant_local_auth";
export const LOCAL_BYPASS_EMAIL = "davorincvoric@gmail.com";

export function hasLocalBypassCookie(cookieValue?: string | null) {
  return cookieValue === "1";
}
