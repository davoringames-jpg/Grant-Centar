# SETUP INSTRUKCIJE - Admin Panel & Email

## 1. RESEND API KEY Setup

Trebam email servis da šalje notifikacije. Koristimo Resend:

### Koraci:
1. Idi na https://resend.com
2. Registruj se sa Gmail-om  
3. Kreiraj API key (Home → API Keys → Create API Key)
4. Kopuj key (počinje sa `re_`)

### Dodaj u .env.local:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

**VAŽNO:** Resend je besplatan za do 100 emaila/dan. Za produkciju trebam konfigurisati vlastiti domain.

---

## 2. Database Setup

Pokreni SQL iz `sql-migrations.md` u Supabase Editor:
1. Idi u Supabase Dashboard → SQL Editor
2. Kreiraj novi query
3. Kopuj/Paste SQL iz `sql-migrations.md`
4. Klikni "Run"

**Šta se kreira:**
- ✅ Nove kolone u `organizations` (pdf_downloaded_at, login_sent_at, registration_completed_at)
- ✅ `admin_logs` tabela za praćenje
- ✅ Admin user sa `davorincvoric@gmail.com`
- ✅ Indeksi za brže pretrage

---

## 3. Kako Funkcionira Tok Registracije

### Za Korisnika (Opština):
1. Idu na `/register`
2. Pune formu sa podacima opštine
3. Vide memorandum
4. Mogu preuzeti PDF memorandum
5. Potvrde plaćanje
6. Dobiju email na registrovanom emailu sa login linkom
7. Kliknu link → Magic link login
8. Pristupe dashboard-u sa konkursi listom

### Za Tebe (Admin):
1. Idi na `/admin` - automatski login kao `davorincvoric@gmail.com`
2. Vidiš sve registracije u tabeli:
   - Opština/grad
   - Email
   - Grad
   - Datum registracije
   - Preuzet li PDF?
   - Email slat?
3. Možeš:
   - **"Pošalji login"** dugme - prosledi login link ako korisnik nije dobio email
   - Viditi statistiku (ukupno reg, preuzeti PDF, slati emaili)

---

## 4. Upravljanje Admin Pristupom

### Ako trebaš drugačiji admin email:
1. Ažuriraj SQL - zamijeni `davorincvoric@gmail.com` sa TVOJIM emailom
2. Ažuriraj hardkodiran email u `/src/components/admin/admin-dashboard.tsx`:
   ```typescript
   if (!user || user.email !== "TVOJ_EMAIL@example.com") {
   ```

### Ako trebaš više admina:
1. Dupliraj SQL insert za drugog korisnika
2. Dodaj u admin-dashboard.tsx check da dozvoli više emaila

---

## 5. Email Templates

Admin i registrovani korisnici dobiju:
- ✉️ **Registracija Email** → Login link + info o licenci
- ✉️ **Magic Link** → Direktan login kod bez lozinke

Tekst je na srpskom sa semaforom datuma.

---

## 6. PDF Memorandum

Memorandum se generiše sa:
- Naziv opštine / adresa / kontakt
- Detalji plaćanja (2.000 KM)
- Broj računa: 1630000123456789 (AŽURIRAJ SA STVARNIM!)
- Datumi - aktivacija i isteka (12 mjeseci)

PDF se skida direktno sa pregleda prije plaćanja.

---

## 7. Provjere Prije Pokretanja

- [ ] RESEND_API_KEY je dodan u .env.local
- [ ] SQL iz sql-migrations.md je pokrenut u Supabase
- [ ] `davorincvoric@gmail.com` je kreiram kao admin user
- [ ] npm install je završio - jsPDF i Resend su instalirani
- [ ] Broj računa 1630000123456789 je ažuriran sa TVOJIM

---

## 8. Testiranje

```bash
npm run dev
```

### Test tok:
1. `/register` - Upiši test podatke
2. **Preuzmi PDF** - Trebali da se skine memorandum.pdf
3. **Potvrdi plaćanje** - Simulira plaćanje (1.5s delay)
4. **Provjeri email** - `davorincvoric@gmail.com` trebali da budem dobio notifikaciju
5. `/admin` - Login kao `davorincvoric@gmail.com`
6. Vidiš test registraciju u tabeli
7. Klikni "Pošalji login" - Resend trebali da pošalje email

---

## 9. Problemi & Rješenja

**Problem:** "Greška pri slanju emaila" pri registraciji
- **Rješenje:** Provjeri da li je RESEND_API_KEY valjan u .env.local

**Problem:** Admin panel kaže "Nemate pristup"
- **Rješenje:** Provjeri email - mora biti `davorincvoric@gmail.com` i trebao sam da budem kreiram u Supabase

**Problem:** PDF se ne skida
- **Rješenje:** Provjeri browser console za greške, trebalo jsPDF biti instaliran

**Problem:** Email ne stigu
- **Rješenje:** 
  - Provjeri Spam folder
  - Provjeri Resend dashboard za logs
  - Provjeri NEXT_PUBLIC_SITE_URL u .env.local

---

## 10. Produkcija (Vercel Deploy)

1. Dodaj environment varijable u Vercel:
   - `RESEND_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → `https://tvoj-domen.com`

2. Resend Email Domain Setup:
   - https://resend.com → Settings → Domains
   - Dodaj `grantportal.rs` 
   - Slijedi DNS instrukcije
   - Promijeni `from` email u `/api/send-login-email` na `info@grantportal.rs`

3. Test:
   - Deploj na Vercel
   - Testiraj registraciju sa stvarnim email-om
   - Provjeri admin panel

---

## 11. Kontakt & Podrška

Ako ima problema:
- Provjeri console.log u browser DevTools
- Provjeri Supabase → Logs za SQL greške
- Provjeri Resend dashboard za email delivery logs
