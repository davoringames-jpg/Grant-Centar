import { KonkursDashboard } from "@/components/dashboard/konkurs-dashboard";
import {
  hasLocalBypassCookie,
  LOCAL_BYPASS_COOKIE,
  LOCAL_BYPASS_ENABLED,
} from "@/lib/auth/local-bypass";
import { demoKonkursi, type Konkurs } from "@/lib/konkursi";
import { getUser, getUserSubscription } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const [konkursi, tier, subscription] = await Promise.all([
    getKonkursi(),
    getUserTier(),
    getUserSubscription(),
  ]);

  return (
    <main className="flex-1">
      <KonkursDashboard
        konkursi={konkursi}
        userTier={tier}
        subscription={subscription}
      />
    </main>
  );
}

async function getUserTier(): Promise<"public" | "subscriber" | "admin"> {
  if (LOCAL_BYPASS_ENABLED) {
    const cookieStore = await cookies();
    if (hasLocalBypassCookie(cookieStore.get(LOCAL_BYPASS_COOKIE)?.value)) {
      return "admin";
    }
  }

  const supabase = await createClient();
  if (!supabase) return "public";

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "public";

  const { data } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  return (
    (data?.subscription_tier as "public" | "subscriber" | "admin") ?? "public"
  );
}

async function getKonkursi(): Promise<Konkurs[]> {
  const supabase = await createClient();

  if (!supabase) {
    return demoKonkursi;
  }

  const { data, error } = await supabase
    .from("konkursi")
    .select(
      "id, naslov, izvor_url, datum_objave, rok_prijave, sektor, iznos_min, iznos_max, odobrenost_opstine, ai_sazetak, status",
    )
    .order("rok_prijave", { ascending: true, nullsFirst: false });

  if (error || !data || data.length === 0) {
    return demoKonkursi;
  }

  return data;
}
