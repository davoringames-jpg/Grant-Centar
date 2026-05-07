"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PendingItem = {
  id: string;
  name?: string;
  jib?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  status?: string;
  pdf_downloaded_at?: string | null;
  created_at?: string;
};

type AdminDashboardProps = {
  adminEmail: string;
};

export default function AdminDashboard({ adminEmail }: AdminDashboardProps) {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadPending({ showLoader }: { showLoader: boolean }) {
    if (showLoader) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/admin/pending", { method: "GET" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Greška pri učitavanju.");
      }

      setItems(payload.items ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Greška pri učitavanju pending zahtjeva."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchInitialPending = async () => {
      try {
        const response = await fetch("/api/admin/pending", { method: "GET" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? "Greška pri učitavanju.");
        }

        setItems(payload.items ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Greška pri učitavanju pending zahtjeva."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchInitialPending();
  }, []);

  const pendingCount = useMemo(
    () => items.filter((item) => item.status === "pending_payment" || item.status === "pending").length,
    [items]
  );

  async function activate(organizationId: string) {
    setActivatingId(organizationId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Aktivacija nije uspjela.");
      }

      setSuccessMessage("Nalog je aktiviran i email je poslat korisniku.");
      await loadPending({ showLoader: false });
    } catch (activateError) {
      setError(
        activateError instanceof Error
          ? activateError.message
          : "Greška pri aktivaciji naloga."
      );
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-700">
              Admin panel
            </p>
            <p className="mt-1 text-sm text-slate-600">Prijavljen: {adminEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-slate-950">Pending zahtjevi</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ovdje su institucije koje su zatražile predračun i čekaju aktivaciju.
          </p>
          <p className="mt-3 text-sm font-semibold text-blue-700">
            Ukupno na čekanju: {pendingCount}
          </p>
        </div>

        {successMessage ? (
          <p className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </p>
        ) : null}

        {error ? (
          <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            Učitavanje...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            Trenutno nema pending zahtjeva.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3">Institucija</th>
                  <th className="px-4 py-3">JIB</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Kontakt</th>
                  <th className="px-4 py-3">Adresa</th>
                  <th className="px-4 py-3">Predračun</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.jib ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.email ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <div>{item.contact_person ?? "-"}</div>
                      <div className="text-xs text-slate-500">{item.phone ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {item.address ?? "-"}
                      <div className="text-xs text-slate-500">
                        {item.postal_code ?? ""} {item.city ?? ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.pdf_downloaded_at ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                          preuzet
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                          nije preuzet
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                        {item.status ?? "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => activate(item.id)}
                        disabled={activatingId === item.id}
                        className="rounded-xl bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
                      >
                        {activatingId === item.id ? "Aktiviram..." : "Aktiviraj"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
