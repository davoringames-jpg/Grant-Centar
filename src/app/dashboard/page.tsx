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

const TRUSTED_DONATORS = new Set(["RARS-MSP"]);

function normalizeKonkursUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    parsed.hash = "";

    // WordPress RSS nekad vraca /www/ homepage umjesto objave.
    if (parsed.pathname === "/www/" || parsed.pathname === "/www") {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

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
      "id, naslov, izvor_url, datum_objave, rok_prijave, sektor, iznos_min, iznos_max, odobrenost_opstine, ai_sazetak, status, donator",
    )
    .order("rok_prijave", { ascending: true, nullsFirst: false });

  if (error || !data || data.length === 0) {
    return demoKonkursi;
  }

  const filtered = data
    .filter((item) => TRUSTED_DONATORS.has((item as { donator?: string }).donator ?? ""))
    .map((item) => {
      const normalizedUrl = normalizeKonkursUrl(item.izvor_url);
      if (!normalizedUrl) return null;

      const { donator: _donator, ...rest } = item as { donator?: string } & Konkurs;
      return { ...rest, izvor_url: normalizedUrl };
    })
    .filter((item): item is Exclude<typeof item, null> => item !== null);

  return filtered.length > 0 ? filtered : demoKonkursi;
}
