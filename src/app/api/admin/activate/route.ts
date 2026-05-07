import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import {
  hasLocalBypassCookie,
  LOCAL_BYPASS_COOKIE,
  LOCAL_BYPASS_EMAIL,
  LOCAL_BYPASS_ENABLED,
} from "@/lib/auth/local-bypass";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function generateTempPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const isLocalBypass =
      LOCAL_BYPASS_ENABLED &&
      hasLocalBypassCookie(request.cookies.get(LOCAL_BYPASS_COOKIE)?.value);

    const authClient = await createClient();

    if (!authClient && !isLocalBypass) {
      return NextResponse.json({ error: "Baza nije dostupna." }, { status: 500 });
    }

    let currentUserEmail = LOCAL_BYPASS_EMAIL;
    let isAllowed = isLocalBypass;

    if (!isAllowed && authClient) {
      const {
        data: { user: currentUser },
      } = await authClient.auth.getUser();

      currentUserEmail = currentUser?.email ?? "";
      isAllowed = !!currentUser && currentUser.email === "davorincvoric@gmail.com";
    }

    if (!isAllowed) {
      return NextResponse.json({ error: "Nedozvoljen pristup." }, { status: 403 });
    }

    const { organizationId } = (await request.json()) as { organizationId?: string };

    if (!organizationId) {
      return NextResponse.json({ error: "Nedostaje organizationId." }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    const { data: organization, error: orgError } = await serviceClient
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (orgError || !organization) {
      return NextResponse.json({ error: "Organizacija nije pronađena." }, { status: 404 });
    }

    const targetEmail = String(organization.email ?? "").trim();
    if (!targetEmail) {
      return NextResponse.json({ error: "Organizacija nema email." }, { status: 400 });
    }

    const tempPassword = generateTempPassword(14);

    const { data: usersPage, error: listError } = await serviceClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const existingUser = usersPage.users.find((u) => u.email === targetEmail);

    let activatedUserId = existingUser?.id;

    if (existingUser) {
      const { error: updateUserError } = await serviceClient.auth.admin.updateUserById(
        existingUser.id,
        {
          password: tempPassword,
          email_confirm: true,
        }
      );

      if (updateUserError) {
        return NextResponse.json({ error: updateUserError.message }, { status: 500 });
      }
    } else {
      const { data: newUserData, error: createUserError } =
        await serviceClient.auth.admin.createUser({
          email: targetEmail,
          password: tempPassword,
          email_confirm: true,
        });

      if (createUserError || !newUserData.user) {
        return NextResponse.json(
          { error: createUserError?.message ?? "Greška pri kreiranju korisnika." },
          { status: 500 }
        );
      }

      activatedUserId = newUserData.user.id;
    }

    if (!activatedUserId) {
      return NextResponse.json({ error: "Nije moguće odrediti korisnika." }, { status: 500 });
    }

    await serviceClient.from("profiles").upsert(
      {
        id: activatedUserId,
        subscription_tier: "subscriber",
      },
      { onConflict: "id" }
    );

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { error: updatePendingSubscriptionError } = await serviceClient
      .from("subscriptions")
      .update({
        user_id: activatedUserId,
        tier: "subscriber",
        status: "active",
        expires_at: expiresAt.toISOString(),
      })
      .eq("organization_id", organizationId)
      .eq("status", "pending_payment");

    if (updatePendingSubscriptionError) {
      await serviceClient.from("subscriptions").insert({
        user_id: activatedUserId,
        organization_id: organizationId,
        tier: "subscriber",
        status: "active",
        expires_at: expiresAt.toISOString(),
      });
    }

    await serviceClient
      .from("organizations")
      .update({
        status: "active",
        login_sent_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    await serviceClient.from("admin_logs").insert({
      organization_id: organizationId,
      action: "organization_activated",
      performed_by: currentUserEmail,
      details: {
        email: targetEmail,
        activatedUserId,
      },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "Grant Portal <onboarding@resend.dev>",
        to: targetEmail,
        subject: "Vaš nalog je aktivan - ГРАНТ ПОРТАЛ РС",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Poštovani,</h2>
            <p>Vaša uplata je evidentirana. Vaš nalog je sada aktivan.</p>
            <p><strong>Pristupni podaci:</strong></p>
            <ul>
              <li>Email: ${targetEmail}</li>
              <li>Privremena lozinka: ${tempPassword}</li>
            </ul>
            <p>Prijava: ${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login</p>
            <p>Molimo da nakon prve prijave odmah promijenite lozinku.</p>
            <p>Srdačno,<br/>ГРАНТ ПОРТАЛ РС</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("admin activate error", error);
    return NextResponse.json({ error: "Interna greška servera." }, { status: 500 });
  }
}
