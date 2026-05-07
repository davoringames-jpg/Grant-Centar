import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import AdminDashboard from "@/components/admin/admin-dashboard";
import {
  hasLocalBypassCookie,
  LOCAL_BYPASS_COOKIE,
  LOCAL_BYPASS_EMAIL,
  LOCAL_BYPASS_ENABLED,
} from "@/lib/auth/local-bypass";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  if (LOCAL_BYPASS_ENABLED) {
    const cookieStore = await cookies();
    if (hasLocalBypassCookie(cookieStore.get(LOCAL_BYPASS_COOKIE)?.value)) {
      return <AdminDashboard adminEmail={LOCAL_BYPASS_EMAIL} />;
    }
  }

  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== "davorincvoric@gmail.com") {
    redirect("/login");
  }

  return <AdminDashboard adminEmail={user.email ?? ""} />;
}
