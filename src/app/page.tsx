import { KonkursDashboard } from "@/components/dashboard/konkurs-dashboard";
import { demoKonkursi, type Konkurs } from "@/lib/konkursi";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const konkursi = await getKonkursi();

  return (
    <main className="flex-1">
      <KonkursDashboard konkursi={konkursi} />
    </main>
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
