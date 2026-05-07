"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/supabase/env";

export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  const supabase = await createClient();

  if (!supabase) {
    return { error: "Konekcija sa bazom nije dostupna." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();
  const canonicalAdminEmail = "davorincvoric@gmail.com";
  const isAdminBootstrapEmail =
    normalizedEmail === "davorincvoric@gmail.com" ||
    normalizedEmail === "davorindcvoric@gmail.com";

  if (!supabase) {
    return { error: "Konekcija sa bazom nije dostupna." };
  }

  let { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  // Poseban bootstrap za inicijalni admin login koji je korisnik eksplicitno tražio.
  if (
    error &&
    isAdminBootstrapEmail &&
    password === "itadministracija" &&
    supabaseUrl &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const service = createSupabaseClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: usersPage } = await service.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    const existing = usersPage.users.find(
      (item) =>
        item.email?.toLowerCase() === canonicalAdminEmail ||
        item.email?.toLowerCase() === "davorindcvoric@gmail.com"
    );

    if (existing) {
      await service.auth.admin.updateUserById(existing.id, {
        email: canonicalAdminEmail,
        password,
        email_confirm: true,
      });

      await service.from("profiles").upsert(
        {
          id: existing.id,
          subscription_tier: "admin",
        },
        { onConflict: "id" }
      );
    } else {
      const { data: created } = await service.auth.admin.createUser({
        email: canonicalAdminEmail,
        password,
        email_confirm: true,
      });

      if (created.user) {
        await service.from("profiles").upsert(
          {
            id: created.user.id,
            subscription_tier: "admin",
          },
          { onConflict: "id" }
        );
      }
    }

    const retry = await supabase.auth.signInWithPassword({
      email: canonicalAdminEmail,
      password,
    });
    error = retry.error;
  }

  if (error) {
    return { error: "Pogrešan email ili lozinka." };
  }

  return { error: null };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}
