import { createClient } from "@/lib/supabase/server";
import {
  hasLocalBypassCookie,
  LOCAL_BYPASS_COOKIE,
  LOCAL_BYPASS_EMAIL,
  LOCAL_BYPASS_ENABLED,
} from "@/lib/auth/local-bypass";
import { cookies } from "next/headers";

export async function getUserSubscription() {
  if (LOCAL_BYPASS_ENABLED) {
    const cookieStore = await cookies();
    if (hasLocalBypassCookie(cookieStore.get(LOCAL_BYPASS_COOKIE)?.value)) {
      const now = new Date();
      const expires = new Date(now);
      expires.setFullYear(expires.getFullYear() + 1);

      return {
        id: "local-subscription",
        tier: "admin",
        status: "active",
        created_at: now.toISOString(),
        expires_at: expires.toISOString(),
      };
    }
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("id, tier, status, created_at, expires_at")
    .eq("user_id", user.id)
    .order("expires_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function getUser() {
  if (LOCAL_BYPASS_ENABLED) {
    const cookieStore = await cookies();
    if (hasLocalBypassCookie(cookieStore.get(LOCAL_BYPASS_COOKIE)?.value)) {
      return {
        id: "00000000-0000-0000-0000-000000000001",
        email: LOCAL_BYPASS_EMAIL,
      };
    }
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
