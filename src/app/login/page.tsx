"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithPassword } from "@/app/auth/actions";

const LOCAL_BYPASS_ENABLED =
  process.env.NEXT_PUBLIC_LOCAL_AUTH_BYPASS === "true";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (LOCAL_BYPASS_ENABLED) {
      document.cookie = "grant_local_auth=1; path=/; max-age=86400";
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signInWithPassword(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  }

  function handleLocalBypassLogin() {
    document.cookie = "grant_local_auth=1; path=/; max-age=86400";
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <Image
                src="/image.png"
                alt="Grant Portal"
                width={160}
                height={64}
                loading="eager"
                className="h-14 w-auto"
              />
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Prijava
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Email adresa
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.com"
                autoComplete="email"
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Lozinka
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>

            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 rounded-2xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Prijavljujem..." : "Prijavi se"}
            </button>

            {LOCAL_BYPASS_ENABLED && (
              <button
                type="button"
                onClick={handleLocalBypassLogin}
                className="h-11 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
              >
                Lokalni ulaz bez prijave
              </button>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Nemate nalog?{" "}
          <a href="/register" className="underline hover:text-slate-700">
            Registrujte se
          </a>
        </p>
      </div>
    </main>
  );
}
