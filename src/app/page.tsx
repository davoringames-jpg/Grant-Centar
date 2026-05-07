import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/image.png" alt="Grant Portal" width={140} height={56} className="h-12 w-auto" priority />
            <span className="text-lg font-bold text-slate-900 tracking-tight">Грант Портал</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
            <a href="#kako-radi" className="transition hover:text-slate-900">Kako radi</a>
            <a href="#usluge" className="transition hover:text-slate-900">Usluge</a>
            <a href="#cijene" className="transition hover:text-slate-900">Cijene</a>
            <a href="#kontakt" className="transition hover:text-slate-900">Kontakt</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 sm:block"
            >
              Pregled konkursa
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Registruj se
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent_40%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_50%,#15803d_100%)] px-6 py-24 text-white lg:px-10 lg:py-36">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white tracking-tight">Грант Портал</span>
            </div>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Svi javni pozivi za vašu opštinu —{" "}
              <span className="text-cyan-300">na jednom mjestu.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-sky-100/90">
              Pratimo konkurse Vlade RS, EU fondova, ministarstava i međunarodnih
              organizacija. Opštine i gradovi dobijaju obavještenje čim izađe
              novi poziv — uz stručnu podršku za pisanje i realizaciju projekata.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-white px-7 py-4 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
              >
                Počnite sa registracijom →
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-white/30 px-7 py-4 text-base font-semibold text-white transition hover:border-white/60"
              >
                Pogledajte konkurse →
              </Link>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-3">
              {[
                { value: "200+", label: "Konkursa godišnje" },
                { value: "25 god.", label: "Iskustva u realizaciji projekata" },
                { value: "24/7", label: "Praćenje novih poziva" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/15 bg-white/10 px-6 py-5 backdrop-blur-sm"
                >
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-sky-100/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="bg-slate-50 px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">Problem koji rješavamo</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                Opštine svake godine propuste milione KM
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Konkursi izlaze na desetinama platformi. Nema jedne opštine koja
                prati sve izvore — a rok za prijavu često traje svega 30 dana.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: "🕐",
                  title: "Kratki rokovi",
                  desc: "Mnogi konkursi imaju svega 3–4 sedmice za prijavu. Bez pravovremene informacije — prilike se propuštaju.",
                },
                {
                  icon: "📄",
                  title: "Složena dokumentacija",
                  desc: "Pisanje kvalitetnog projekta zahtijeva iskustvo. Loše napisan projekat ne prolazi ni uz dobre namjere.",
                },
                {
                  icon: "🔍",
                  title: "Raspršeni izvori",
                  desc: "Vlada RS, EU, UNDP, GIZ, ministarstva — svako objavljuje odvojeno. Niko to ne može pratiti sam.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KAKO RADI */}
        <section id="kako-radi" className="px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">Kako funkcioniše</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                Tri koraka do uspješnog projekta
              </h2>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Pretplatite se",
                  desc: "Opština ili grad se pretplati na godišnji plan. Od tog trenutka svaki novi konkurs stiže direktno u vaš portal.",
                  color: "bg-blue-700",
                },
                {
                  step: "02",
                  title: "Dobijate obavještenje",
                  desc: "Čim izađe konkurs koji odgovara vašem profilu, dobijate obavještenje s rokom, iznosom i svim detaljima.",
                  color: "bg-slate-900",
                },
                {
                  step: "03",
                  title: "Mi pišemo projekat",
                  desc: "Po želji, naš tim preuzima pisanje kompletne projektne prijave — uz 15 godina iskustva i realizovanih projekata.",
                  color: "bg-green-700",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm"
                >
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} text-sm font-bold text-white`}
                  >
                    {item.step}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USLUGE */}
        <section id="usluge" className="bg-slate-50 px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">Naše usluge</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                Od informacije do realizacije
              </h2>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Baza javnih poziva",
                  badge: "Osnova",
                  badgeColor: "bg-blue-100 text-blue-800",
                  points: [
                    "Svi aktivni konkursi za opštine i gradove",
                    "Filteri po sektoru, roku, iznosu",
                    "Semafor sistem — vidite koliko dana ostaje",
                    "Obavještenja pri novim objavama",
                    "Arhiva isteklih konkursa",
                  ],
                },
                {
                  title: "Pisanje projekata",
                  badge: "Najpopularnije",
                  badgeColor: "bg-green-100 text-green-800",
                  points: [
                    "Kompletna projektna dokumentacija",
                    "Prilagođeno uslovima konkretnog konkursa",
                    "Budžet, narativ, logički okvir",
                    "Koordinacija sa partnerima",
                    "Revizija do predaje",
                  ],
                },
                {
                  title: "Realizacija projekta",
                  badge: "Premium",
                  badgeColor: "bg-amber-100 text-amber-800",
                  points: [
                    "Upravljanje odobrenim projektom",
                    "Izvještavanje prema donatorima",
                    "Koordinacija izvođača i nabavki",
                    "Finansijski monitoring",
                    "Finalni izvještaj i zatvaranje",
                  ],
                },
              ].map((service) => (
                <div
                  key={service.title}
                  className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold text-slate-950">{service.title}</h3>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                  </div>
                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="mt-0.5 text-green-600">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CIJENE */}
        <section id="cijene" className="px-6 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">Transparentne cijene</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                Investicija koja se višestruko vraća
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Jedan odobren projekat vrijednosti 100.000 KM pokrije godišnju pretplatu 50 puta.
              </p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Godišnja pretplata",
                  price: "2.000 KM",
                  period: "godišnje",
                  desc: "Pristup kompletnoj bazi javnih poziva za opštine i gradove.",
                  highlight: false,
                  cta: "Počnite danas",
                  href: "/login",
                },
                {
                  title: "Pisanje projekta",
                  price: "10% od iznosa",
                  period: "min. 500 KM po projektu",
                  desc: "Cijena je 10% od traženog iznosa projekta. Uključuje kompletnu dokumentaciju, budžet i logički okvir.",
                  highlight: true,
                  cta: "Zatražite ponudu",
                  href: "#kontakt",
                },
                {
                  title: "Realizacija projekta",
                  price: "Dogovor",
                  period: "% od vrijednosti",
                  desc: "Upravljanje odobrenim projektom od početka do završnog izvještaja.",
                  highlight: false,
                  cta: "Kontaktirajte nas",
                  href: "#kontakt",
                },
              ].map((plan) => (
                <div
                  key={plan.title}
                  className={`flex flex-col rounded-[28px] border p-8 shadow-sm ${
                    plan.highlight
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <h3 className={`text-lg font-semibold ${plan.highlight ? "text-white" : "text-slate-950"}`}>
                    {plan.title}
                  </h3>
                  <p className={`mt-4 text-4xl font-bold tracking-tight ${plan.highlight ? "text-white" : "text-slate-950"}`}>
                    {plan.price}
                  </p>
                  <p className={`mt-1 text-sm ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>
                    {plan.period}
                  </p>
                  <p className={`mt-4 flex-1 text-sm leading-7 ${plan.highlight ? "text-blue-100" : "text-slate-600"}`}>
                    {plan.desc}
                  </p>
                  <a
                    href={plan.href}
                    className={`mt-8 inline-flex h-12 items-center justify-center rounded-2xl text-sm font-semibold transition ${
                      plan.highlight
                        ? "bg-white text-blue-700 hover:bg-blue-50"
                        : "bg-slate-950 text-white hover:bg-blue-700"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KONTAKT CTA */}
        <section
          id="kontakt"
          className="bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-6 py-20 text-white lg:px-10"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Kontakt
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Razgovarajmo o potrebama vaše opštine
            </h2>
            <p className="mt-4 text-base leading-7 text-sky-100/90">
              Kontaktirajte nas — besplatna konsultacija i analiza dostupnih
              konkursa za vašu opštinu ili grad.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-white px-8 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Počnite registraciju
              </Link>
              <a
                href="mailto:info@grantportal.rs"
                className="rounded-2xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:border-white/70"
              >
                Kontaktirajte nas
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Grant Portal RS
          </p>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Grant Portal RS. Sva prava zadržana.
          </p>
          <div className="flex gap-6 text-xs text-slate-400">
            <Link href="/register" className="transition hover:text-slate-700">Registracija</Link>
            <Link href="/login" className="transition hover:text-slate-700">Prijava</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

