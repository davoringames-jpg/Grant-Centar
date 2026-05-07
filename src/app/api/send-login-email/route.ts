import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

export async function POST(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY nije konfigurisan" },
        { status: 500 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase env varijable nisu konfigurisane" },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { email, organizationName, organizationId } = await request.json();

    // Šalji login link
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login?email=${encodeURIComponent(email)}`;

    const activationDate = format(new Date(), "dd.MM.yyyy", { locale: sr });
    const expiryDate = format(
      new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      "dd.MM.yyyy",
      { locale: sr }
    );

    const emailResult = await resend.emails.send({
      from: "GRANT PORTAL <noreply@grantportal.rs>",
      to: email,
      subject: "Vaša registracija je potvrđena - GRANT PORTAL",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e3a8a;">Dobrodošli na GRANT PORTAL!</h1>
          
          <p>Dragi/a,</p>
          
          <p>Hvala što ste se registrovali. Vaša registracija je potvrđena i vaša licence je aktivna.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Detalji vaše licence</h2>
            <p><strong>Organizacija:</strong> ${organizationName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Tip:</strong> Godišnja pretplata</p>
            <p><strong>Aktivna od:</strong> ${activationDate}</p>
            <p><strong>Ističe:</strong> ${expiryDate}</p>
          </div>
          
          <h3 style="color: #1e3a8a;">Kako pristupiti platformi?</h3>
          <p>Kliknite na link ispod da se prijavite:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${loginUrl}" style="background-color: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Prijavite se na GRANT PORTAL
            </a>
          </p>
          
          <p>Ili kopujte ovaj link u preglednik:</p>
          <p style="background-color: #f0f9ff; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${loginUrl}
          </p>
          
          <h3 style="color: #1e3a8a;">Šta dalje?</h3>
          <ul>
            <li>Prijavite se sa vašim email-om</li>
            <li>Dobijate pristup svim javnim pozivima za opštine i gradove</li>
            <li>Koristite filtere po sektoru, roku, iznosu</li>
            <li>Pratite rok preko semafora sistema</li>
          </ul>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
            Ako imate pitanja, slobodno nam se javite na <strong>info@grantportal.rs</strong>
          </p>
          
          <p style="color: #999; font-size: 12px;">GRANT PORTAL RS d.o.o. | Banja Luka</p>
        </div>
      `,
    });

    if (emailResult.error) {
      throw new Error(`Resend error: ${emailResult.error.message}`);
    }

    // Spremi u admin_logs
    if (organizationId) {
      await supabase.from("admin_logs").insert({
        organization_id: organizationId,
        action: "registration_email_sent",
        performed_by: "system",
        details: {
          email,
          timestamp: new Date().toISOString(),
        },
      });

      // Ažuriraj organization sa login_sent_at
      await supabase
        .from("organizations")
        .update({ login_sent_at: new Date().toISOString() })
        .eq("id", organizationId);
    }

    return NextResponse.json({
      success: true,
      message: "Email poslat uspješno",
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Greška pri slanju emaila" },
      { status: 500 }
    );
  }
}
