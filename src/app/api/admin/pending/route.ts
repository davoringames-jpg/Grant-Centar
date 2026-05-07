import { NextRequest, NextResponse } from "next/server";

import {
  hasLocalBypassCookie,
  LOCAL_BYPASS_COOKIE,
  LOCAL_BYPASS_ENABLED,
} from "@/lib/auth/local-bypass";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  try {
    const isLocalBypass =
      LOCAL_BYPASS_ENABLED &&
      hasLocalBypassCookie(request.cookies.get(LOCAL_BYPASS_COOKIE)?.value);

    const supabase = await createClient();

    if (!supabase && !isLocalBypass) {
      return NextResponse.json({ error: "Baza nije dostupna." }, { status: 500 });
    }

    let isAllowed = isLocalBypass;

    if (!isAllowed && supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      isAllowed = !!user && user.email === "davorincvoric@gmail.com";
    }

    if (!isAllowed) {
      return NextResponse.json({ error: "Nedozvoljen pristup." }, { status: 403 });
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from("organizations")
      .select("*")
      .in("status", ["pending_payment", "pending"])
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error("admin pending error", error);
    return NextResponse.json({ error: "Interna greška servera." }, { status: 500 });
  }
}
