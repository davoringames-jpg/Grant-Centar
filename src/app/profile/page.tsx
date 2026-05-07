import Link from "next/link";
import { redirect } from "next/navigation";

import { LicenseInfo } from "@/components/license-info";
import { getUser, getUserSubscription } from "@/lib/auth/profile";

export const metadata = {
  title: "Moj profil - Grant Portal RS",
};

export default async function ProfilePage() {
  const [user, subscription] = await Promise.all([
    getUser(),
    getUserSubscription(),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAV */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/dashboard" className="text-xs font-bold uppercase tracking-[0.25em] text-blue-700 transition hover:text-blue-900">
            ← Grant Portal RS
          </Link>
          <span className="text-sm font-medium text-slate-600">Moj profil</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10">
        <div className="mb-12 flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Moj račun
          </h1>
          <p className="text-base text-slate-600">
            Upravljajte vašom licencom i podacima
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Licence */}
          <div className="lg:col-span-2">
            {subscription ? (
              <LicenseInfo
                expiresAt={subscription.expires_at}
                tier={subscription.tier}
                status={subscription.status}
              />
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-sm text-slate-600">
                  Nemate aktivnu licencu. <Link href="/" className="font-semibold text-blue-700">Pogledajte naše ponude.</Link>
                </p>
              </div>
            )}
          </div>

          {/* Profil info */}
          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Email
              </p>
              <p className="mt-2 font-medium text-slate-950 break-all">{user.email}</p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                User ID
              </p>
              <p className="mt-2 font-mono text-xs text-slate-600">
                {user.id.slice(0, 12)}...
              </p>
            </div>

            <button
              onClick={() => {
                // TODO: signOut action
              }}
              className="rounded-2xl bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Одјава
            </button>
          </div>
        </div>

        {/* Dodatne opcije */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8">
            <h3 className="text-lg font-semibold text-slate-950">
              Trebate više informacija?
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Kontaktirajte nas — odgovorićemo na sve vaše pitanja u roku od 24 sata.
            </p>
            <a
              href="mailto:info@grantportal.rs"
              className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Pošalji poruku →
            </a>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-8">
            <h3 className="text-lg font-semibold text-slate-950">
              Otkazivanje pretplate
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Ako više ne trebate servis, možete otkazati u bilo kojem trenutku. Nema skrivenih troškova.
            </p>
            <button className="mt-4 inline-flex text-sm font-semibold text-red-700 hover:text-red-800">
              Otkaži pretplatu →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
