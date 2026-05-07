import { NextRequest, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

type RegistrationPayload = {
  institutionName: string;
  jib: string;
  address: string;
  postalCode: string;
  city: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RegistrationPayload;

    if (
      !payload.institutionName ||
      !payload.jib ||
      !payload.address ||
      !payload.postalCode ||
      !payload.city ||
      !payload.contactPerson ||
      !payload.email ||
      !payload.phone
    ) {
      return NextResponse.json(
        { error: "Sva polja su obavezna." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: payload.institutionName,
        jib: payload.jib,
        address: payload.address,
        postal_code: payload.postalCode,
        city: payload.city,
        contact_person: payload.contactPerson,
        email: payload.email,
        phone: payload.phone,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (orgError || !orgData) {
      return NextResponse.json(
        { error: orgError?.message ?? "Greška pri kreiranju zahtjeva." },
        { status: 500 }
      );
    }

    const organizationId = orgData.id as string;

    // Čuvamo i u subscriptions kao pending zapis (B2B tok aktivacije nakon uplate).
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        organization_id: organizationId,
        tier: "subscriber",
        status: "pending_payment",
      });

    if (subscriptionError) {
      // Organizacija je već kreirana, ali vraćamo jasnu poruku zbog migracije.
      return NextResponse.json(
        {
          error:
            "Zahtjev je kreiran, ali subscriptions tabela nema potrebna polja. Pokrenite SQL migraciju za B2B tok.",
          organizationId,
        },
        { status: 500 }
      );
    }

    await supabase.from("admin_logs").insert({
      organization_id: organizationId,
      action: "registration_pending_created",
      performed_by: "system",
      details: {
        email: payload.email,
        jib: payload.jib,
      },
    });

    return NextResponse.json({ organizationId });
  } catch (error) {
    console.error("registration-request error", error);
    return NextResponse.json(
      { error: "Interna greška servera." },
      { status: 500 }
    );
  }
}
