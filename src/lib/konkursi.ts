export type KonkursStatus = "aktivan" | "istekao";

export type Konkurs = {
  id: string;
  naslov: string;
  izvor_url: string;
  datum_objave: string;
  rok_prijave: string | null;
  sektor: string;
  iznos_min: number | null;
  iznos_max: number | null;
  odobrenost_opstine: boolean;
  ai_sazetak: string | null;
  status: KonkursStatus;
};

export const demoKonkursi: Konkurs[] = [
  {
    id: "demo-1",
    naslov: "Podsticaji za digitalizaciju opštinskih usluga",
    izvor_url: "https://www.vladars.rs/",
    datum_objave: "2026-05-02",
    rok_prijave: "2026-05-12",
    sektor: "infrastruktura",
    iznos_min: 50000,
    iznos_max: 150000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Poziv finansira digitalnu transformaciju lokalne uprave, uz fokus na e-usluge, interoperabilnost i sigurnost podataka.",
    status: "aktivan",
  },
  {
    id: "demo-2",
    naslov: "Grant za razvoj poljoprivrednih zadruga",
    izvor_url: "https://www.rars-msp.org/",
    datum_objave: "2026-04-20",
    rok_prijave: "2026-05-28",
    sektor: "poljoprivreda",
    iznos_min: 20000,
    iznos_max: 80000,
    odobrenost_opstine: false,
    ai_sazetak:
      "Namijenjeno zadrugama i povezanim lokalnim lancima vrijednosti; opštine mogu učestvovati kao partner u infrastrukturnim komponentama.",
    status: "aktivan",
  },
  {
    id: "demo-3",
    naslov: "Energetska efikasnost javnih objekata",
    izvor_url: "https://www.fondzastituokoline.com/",
    datum_objave: "2026-03-18",
    rok_prijave: "2026-04-15",
    sektor: "energetika",
    iznos_min: 100000,
    iznos_max: 300000,
    odobrenost_opstine: true,
    ai_sazetak:
      "Program podržava obnovu javnih objekata, zamjenu stolarije i sisteme grijanja sa naglaskom na smanjenje potrošnje energije.",
    status: "istekao",
  },
];

export function formatCurrencyRange(min: number | null, max: number | null) {
  if (min == null && max == null) {
    return "Nije objavljeno";
  }

  const format = new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  if (min != null && max != null) {
    return `${format.format(min)} - ${format.format(max)}`;
  }

  return format.format(min ?? max ?? 0);
}

export function getDeadlineTone(deadline: string | null, status: KonkursStatus) {
  if (status === "istekao") {
    return "bg-zinc-300 text-zinc-800";
  }

  if (!deadline) {
    return "bg-amber-200 text-amber-900";
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return "bg-zinc-300 text-zinc-800";
  }

  if (daysLeft < 7) {
    return "bg-rose-500 text-white";
  }

  if (daysLeft < 21) {
    return "bg-amber-400 text-amber-950";
  }

  return "bg-emerald-500 text-white";
}

export function getDeadlineLabel(deadline: string | null, status: KonkursStatus) {
  if (status === "istekao") {
    return "Istekao";
  }

  if (!deadline) {
    return "Rok nije objavljen";
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return "Istekao";
  }

  if (daysLeft === 0) {
    return "Ističe danas";
  }

  return `Ističe za ${daysLeft} dana`;
}