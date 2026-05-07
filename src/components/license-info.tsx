"use client";

import { format, formatDistance } from "date-fns";
import { sr } from "date-fns/locale";

type LicenseInfoProps = {
  expiresAt: string;
  tier: string;
  status: string;
  compact?: boolean;
};

export function LicenseInfo({
  expiresAt,
  tier,
  status,
  compact = false,
}: LicenseInfoProps) {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const isExpired = expiryDate < now;
  const daysLeft = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isExpiringSoon = daysLeft < 30 && daysLeft > 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            isExpired ? "bg-red-500" : isExpiringSoon ? "bg-yellow-500" : "bg-green-500"
          }`}
        />
        <span className="text-xs font-medium text-slate-600">
          {tier === "subscriber"
            ? `Ističe ${format(expiryDate, "d. MMM yyyy.", { locale: sr })}`
            : "Bez aktivne licence"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Vaša licenca
        </p>
        <div className="mt-3 flex items-end gap-4">
          <div>
            <p className="text-4xl font-bold text-slate-950">
              {tier === "subscriber" ? "Pretplatnik" : "Bez licence"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {status === "active"
                ? `Aktivna do ${format(expiryDate, "d. MMM yyyy.", { locale: sr })}`
                : `Istekla ${format(expiryDate, "d. MMM yyyy.", { locale: sr })}`}
            </p>
          </div>
        </div>
      </div>

      {status === "active" && (
        <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-5 py-4">
          <div className="flex items-end justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
              Vremenske preostale
            </span>
            <span className="text-lg font-bold text-blue-700">{daysLeft} dana</span>
          </div>
          {isExpiringSoon && (
            <p className="text-xs text-amber-700">
              ⚠️ Vaša licenca ističe uskoro. Razmislite o produženju.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-3 text-sm">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="font-medium text-slate-600">Aktivacij e</span>
          <span className="font-medium text-slate-900">
            {format(new Date("2026-05-07"), "d. MMM yyyy.", { locale: sr })}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="font-medium text-slate-600">Istječe</span>
          <span className="font-medium text-slate-900">
            {format(expiryDate, "d. MMM yyyy.", { locale: sr })}
          </span>
        </div>
      </div>

      {status === "active" && (
        <div className="flex flex-wrap gap-3">
          <a
            href="/profile/manage"
            className="flex-1 rounded-2xl bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Upravljaj licencom
          </a>
          <button
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Produžite za +1 godinu
          </button>
        </div>
      )}
    </div>
  );
}
