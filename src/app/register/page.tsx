"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Step = "form" | "done";

type RegistrationForm = {
  institutionName: string;
  jib: string;
  address: string;
  postalCode: string;
  city: string;
  contactPerson: string;
  email: string;
  phone: string;
};

const INITIAL_FORM: RegistrationForm = {
  institutionName: "",
  jib: "",
  address: "",
  postalCode: "",
  city: "",
  contactPerson: "",
  email: "",
  phone: "",
};

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<RegistrationForm>(INITIAL_FORM);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/registration-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Neuspješno slanje zahtjeva.");
      }

      setRequestId(payload.organizationId);
      setStep("done");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Greška prilikom slanja zahtjeva."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/image.png"
              alt="Grant Portal"
              width={140}
              height={56}
              className="h-12 w-auto mix-blend-multiply"
              priority
            />
            <span className="text-lg font-bold text-slate-900 tracking-tight">Грант Портал</span>
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
          >
            Već imate nalog?
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
        {step === "form" ? (
          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Zahtjev za predračun
              </h1>
              <p className="mt-3 text-base text-slate-600">
                Godišnja pretplata za platformu ГРАНТ ПОРТАЛ РС: 2.000 KM
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Puni naziv institucije *
                </span>
                <input
                  required
                  type="text"
                  name="institutionName"
                  value={form.institutionName}
                  onChange={handleChange}
                  placeholder="npr. Opština Banja Luka"
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">JIB *</span>
                  <input
                    required
                    type="text"
                    name="jib"
                    value={form.jib}
                    onChange={handleChange}
                    placeholder="xxxxxxxxxxxxx"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Broj telefona *</span>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+387 xx xxx xxx"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">Adresa sjedišta *</span>
                <input
                  required
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Ulica i broj"
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Poštanski broj *</span>
                  <input
                    required
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="78000"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Mjesto *</span>
                  <input
                    required
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Banja Luka"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Ime i prezime kontakt osobe *
                  </span>
                  <input
                    required
                    type="text"
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    placeholder="Ime Prezime"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Službeni email *</span>
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="kabinet@opstina.rs"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>
              </div>

              {error ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 rounded-2xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
              >
                {loading ? "Šaljem zahtjev..." : "Pošalji zahtjev"}
              </button>
            </form>
          </section>
        ) : (
          <section className="rounded-[32px] border border-green-200 bg-green-50 p-8 shadow-sm sm:p-10">
            <h2 className="text-2xl font-semibold text-slate-950">Zahtjev je zaprimljen</h2>
            <p className="mt-3 text-slate-700">
              Hvala na registraciji. Preuzmite predračun za uplatu ovdje.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Status vašeg naloga je trenutno: <strong>Na čekanju (pending_payment)</strong>.
              Aktivacija ide nakon evidencije uplate.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {requestId ? (
                <a
                  href={`/api/proforma/${requestId}`}
                  className="rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Preuzmi predračun (PDF)
                </a>
              ) : null}
              <Link
                href="/"
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Nazad na početnu
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
