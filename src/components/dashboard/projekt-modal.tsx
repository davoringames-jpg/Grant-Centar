"use client";

import { useState, useTransition } from "react";
import type { Konkurs } from "@/lib/konkursi";

type Props = {
  konkurs: Konkurs;
  onClose: () => void;
};

function izracunajCijenu(iznosKm: number): number {
  const deset = iznosKm * 0.1;
  return Math.max(500, Math.round(deset / 50) * 50); // zaokruži na 50 KM
}

export function ProjektModal({ konkurs, onClose }: Props) {
  const [naziv, setNaziv] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [opstina, setOpstina] = useState("");
  const [iznosStr, setIznosStr] = useState("");
  const [opis, setOpis] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [proformaUrl, setProformaUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const iznosKm = parseFloat(iznosStr.replace(/[.,\s]/g, "")) || 0;
  const cijenaUsluge = iznosKm > 0 ? izracunajCijenu(iznosKm) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/project-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            konkurs_id: konkurs.id,
            konkurs_naslov: konkurs.naslov,
            konkurs_izvor_url: konkurs.izvor_url,
            naziv_organizacije: naziv,
            kontakt_osoba: kontakt,
            email,
            telefon,
            opstina,
            trazeni_iznos_km: iznosKm,
            opis_projekta: opis,
            cijena_usluge_km: cijenaUsluge,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Greška pri slanju zahtjeva.");
          return;
        }

        setProformaUrl(`/api/project-request/proforma/${data.id}`);
        setSubmitted(true);
      } catch {
        setError("Greška pri slanju. Provjerite internet vezu.");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-[28px] border-b border-slate-100 bg-white px-7 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
              Grant Portal RS – Usluga pisanja projekta
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 leading-snug line-clamp-2">
              {konkurs.naslov}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Info tabela */}
        <div className="mx-7 mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900 mb-2">Šta je uključeno u uslugu:</p>
          <ul className="space-y-1 text-slate-600">
            <li>✓ Potpuna projektna prijava (narativ, ciljevi, aktivnosti)</li>
            <li>✓ Detaljan budžet prema uputama konkursa</li>
            <li>✓ Logički okvir / matrica (ako se traži)</li>
            <li>✓ Svi prateći obrasci i izjave</li>
            <li>✓ Finalni PDF spreman za potpis, pečat i slanje poštom</li>
          </ul>
          <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-800">
            <span className="font-semibold">Cijena usluge:</span> 10% od traženog iznosa, minimalno 500 KM.
            Nakon uplate predračuna, Grant Portal RS priprema kompletnu dokumentaciju.
          </div>
        </div>

        {submitted ? (
          /* ─── Uspješno poslano ─── */
          <div className="px-7 py-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-slate-900">Zahtjev primljen!</h3>
            <p className="mt-2 text-sm text-slate-600">
              Predračun za uslugu pisanja projekta je generisan. Preuzmite ga, uplatite iznos
              i naš tim kreće sa izradom projekta.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {proformaUrl && (
                <a
                  href={proformaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Preuzmi predračun (PDF) →
                </a>
              )}
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:border-slate-400 transition"
              >
                Zatvori
              </button>
            </div>
          </div>
        ) : (
          /* ─── Forma ─── */
          <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Naziv organizacije *</label>
                <input
                  required
                  value={naziv}
                  onChange={(e) => setNaziv(e.target.value)}
                  placeholder="Opština / preduzeće / NVO"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Kontakt osoba *</label>
                <input
                  required
                  value={kontakt}
                  onChange={(e) => setKontakt(e.target.value)}
                  placeholder="Ime i prezime"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Email *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kontakt@opstina.ba"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Telefon</label>
                <input
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="065 123 456"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Opština / grad *</label>
                <input
                  required
                  value={opstina}
                  onChange={(e) => setOpstina(e.target.value)}
                  placeholder="Banja Luka"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Traženi iznos (KM) *</label>
                <input
                  required
                  value={iznosStr}
                  onChange={(e) => setIznosStr(e.target.value)}
                  placeholder="50000"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Kratki opis projekta / šta vaša organizacija planira *
              </label>
              <textarea
                required
                rows={4}
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
                placeholder="Opišite aktivnosti, ciljnu grupu i rezultate koje planirate postići ovim projektom..."
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Prikaz cijene */}
            {cijenaUsluge !== null && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-800">Cijena usluge pisanja projekta:</span>
                  <span className="text-2xl font-bold text-emerald-900">
                    {cijenaUsluge.toLocaleString("sr-RS")} KM
                  </span>
                </div>
                <p className="mt-1 text-xs text-emerald-700">
                  10% od {iznosKm.toLocaleString("sr-RS")} KM = {(iznosKm * 0.1).toFixed(0)} KM
                  {iznosKm * 0.1 < 500 ? " → minimalna naknada 500 KM" : ""}
                </p>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 h-12 rounded-2xl bg-slate-950 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
              >
                {isPending ? "Šaljem zahtjev..." : "Pošalji zahtjev i generiši predračun →"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-12 px-5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-400 transition"
              >
                Odustani
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
