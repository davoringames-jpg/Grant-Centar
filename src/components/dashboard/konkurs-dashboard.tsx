"use client";

import { useMemo, useState } from "react";

import {
  formatCurrencyRange,
  getDeadlineLabel,
  getDeadlineTone,
  type Konkurs,
} from "@/lib/konkursi";

type DashboardProps = {
  konkursi: Konkurs[];
};

export function KonkursDashboard({ konkursi }: DashboardProps) {
  const [sector, setSector] = useState<string>("svi");
  const [status, setStatus] = useState<string>("svi");

  const sectors = useMemo(() => {
    return ["svi", ...new Set(konkursi.map((item) => item.sektor))];
  }, [konkursi]);

  const filtered = useMemo(() => {
    return konkursi.filter((item) => {
      const sectorMatch = sector === "svi" || item.sektor === sector;
      const statusMatch = status === "svi" || item.status === status;
      return sectorMatch && statusMatch;
    });
  }, [konkursi, sector, status]);

  const activeCount = konkursi.filter((item) => item.status === "aktivan").length;
  const expiringSoon = konkursi.filter((item) => {
    if (!item.rok_prijave || item.status !== "aktivan") {
      return false;
    }

    const diff = new Date(item.rok_prijave).getTime() - Date.now();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft < 7;
  }).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
      <section className="overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_36%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_46%,#22c55e_100%)] p-8 text-white shadow-[0_32px_80px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100/90">
              Grant Portal RS
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Monitoring javnih poziva za opštine Republike Srpske.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-sky-50/90 sm:text-lg">
              MVP dashboard za pregled konkursa, brzu procjenu rokova i AI sažetak
              svake prilike na jednom mjestu.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Ukupno konkursa" value={String(konkursi.length)} />
            <StatCard label="Aktivno" value={String(activeCount)} />
            <StatCard label="Ističe uskoro" value={String(expiringSoon)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_1fr_auto]">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Filter po sektoru
          <select
            value={sector}
            onChange={(event) => setSector(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none ring-0 transition focus:border-blue-500"
          >
            {sectors.map((item) => (
              <option key={item} value={item}>
                {item === "svi" ? "Svi sektori" : capitalize(item)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Status poziva
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none ring-0 transition focus:border-blue-500"
          >
            <option value="svi">Svi statusi</option>
            <option value="aktivan">Aktivan</option>
            <option value="istekao">Istekao</option>
          </select>
        </label>

        <div className="flex items-end">
          <div className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">
            Prikazano: {filtered.length}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((konkurs) => (
          <article
            key={konkurs.id}
            className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">
                {konkurs.sektor}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getDeadlineTone(
                  konkurs.rok_prijave,
                  konkurs.status,
                )}`}
              >
                {getDeadlineLabel(konkurs.rok_prijave, konkurs.status)}
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
              {konkurs.naslov}
            </h2>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <InfoItem label="Datum objave" value={formatDate(konkurs.datum_objave)} />
              <InfoItem
                label="Rok prijave"
                value={konkurs.rok_prijave ? formatDate(konkurs.rok_prijave) : "Nije objavljen"}
              />
              <InfoItem label="Iznos" value={formatCurrencyRange(konkurs.iznos_min, konkurs.iznos_max)} />
              <InfoItem
                label="Opštine prihvatljive"
                value={konkurs.odobrenost_opstine ? "Da" : "Ne"}
              />
            </div>

            <p className="mt-5 flex-1 text-sm leading-7 text-slate-700">
              {konkurs.ai_sazetak ?? "AI sažetak još nije generisan za ovaj konkurs."}
            </p>

            <a
              href={konkurs.izvor_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Otvori izvor konkursa
            </a>
          </article>
        ))}
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          Nema konkursa za izabrane filtere.
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/12 px-5 py-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-sky-100/80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}