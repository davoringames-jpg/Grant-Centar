"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

import { signOut } from "@/app/auth/actions";
import { LicenseInfo } from "@/components/license-info";
import { ProjektModal } from "@/components/dashboard/projekt-modal";
import {
  formatCurrencyRange,
  getDeadlineLabel,
  getDeadlineTone,
  type Konkurs,
} from "@/lib/konkursi";

type UserTier = "public" | "subscriber" | "admin";

type Subscription = {
  id: string;
  tier: string;
  status: string;
  created_at: string;
  expires_at: string;
} | null;

type DashboardProps = {
  konkursi: Konkurs[];
  userTier: UserTier;
  subscription?: Subscription;
};

const NOW_MS = Date.now();

export function KonkursDashboard({ konkursi, userTier, subscription }: DashboardProps) {
  const isPremium = userTier === "subscriber" || userTier === "admin";
  const [, startTransition] = useTransition();
  const [sector, setSector] = useState<string>("svi");
  const [status, setStatus] = useState<string>("svi");
  const [projektKonkurs, setProjektKonkurs] = useState<Konkurs | null>(null);

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

    const diff = new Date(item.rok_prijave).getTime() - NOW_MS;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft < 7;
  }).length;

  return (
    <>
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
      {/* Nav bar */}
      <nav className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
          <Image src="/image.png" alt="Grant Portal" width={120} height={48} className="h-10 w-auto" />
          <span className="text-base font-bold text-slate-900 tracking-tight">Грант Портал</span>
        </Link>
        <div className="flex-1"></div>
        <div className="flex items-center gap-3">
          {isPremium && subscription ? (
            <>
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 sm:flex"
              >
                <LicenseInfo
                  expiresAt={subscription.expires_at}
                  tier={subscription.tier}
                  status={subscription.status}
                  compact
                />
              </Link>
              <button
                onClick={() => startTransition(() => signOut())}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-400"
              >
                Одјава
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Prijava
            </a>
          )}
        </div>
      </nav>
      <section className="overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_36%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_46%,#22c55e_100%)] p-8 text-white shadow-[0_32px_80px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100/90">
              Grant Portal RS
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Monitoring javnih poziva za opštine i gradove Republike Srpske.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-sky-50/90 sm:text-lg">
              Svi javni pozivi i grantovi na jednom mjestu — brza procjena rokova,
              detalji finansiranja i stručna podrška za pisanje projekata.
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
              {konkurs.izvor_url ? (
                <a
                  href={konkurs.izvor_url}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-blue-700 hover:underline"
                >
                  {konkurs.naslov}
                </a>
              ) : (
                konkurs.naslov
              )}
            </h2>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <InfoItem label="Datum objave" value={formatDate(konkurs.datum_objave)} />
              <InfoItem
                label="Rok prijave"
                value={konkurs.rok_prijave ? formatDate(konkurs.rok_prijave) : "Nije objavljen"}
              />
              {isPremium ? (
                <>
                  <InfoItem label="Iznos" value={formatCurrencyRange(konkurs.iznos_min, konkurs.iznos_max)} />
                  <InfoItem
                    label="Opštine i gradovi prihvatljivi"
                    value={konkurs.odobrenost_opstine ? "Da" : "Ne"}
                  />
                </>
              ) : null}
            </div>

            {isPremium ? (
              <p className="mt-5 flex-1 text-sm leading-7 text-slate-700">
                {konkurs.ai_sazetak ?? "Sažetak još nije dostupan za ovaj konkurs."}
              </p>
            ) : (
              <div className="mt-5 flex-1 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
                <p className="text-xs font-medium text-slate-500">
                  Sažetak, iznos i dokumentacija dostupni pretplatnicima.
                </p>
                <a
                  href="/login"
                  className="mt-3 inline-flex items-center rounded-full bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                >
                  Prijavite se →
                </a>
              </div>
            )}

            {isPremium ? (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {konkurs.izvor_url ? (
                  <a
                    href={konkurs.izvor_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Otvori izvor →
                  </a>
                ) : null}
                <button
                  onClick={() => setProjektKonkurs(konkurs)}
                  className="flex-1 inline-flex h-12 items-center justify-center rounded-2xl border-2 border-blue-700 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-700 hover:text-white"
                >
                  ✍ Napiši mi projekat
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          Nema konkursa za izabrane filtere.
        </section>
      ) : null}
    </div>

    {projektKonkurs ? (
      <ProjektModal
        konkurs={projektKonkurs}
        onClose={() => setProjektKonkurs(null)}
      />
    ) : null}
    </>
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