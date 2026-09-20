# FFmotor OS — Sistem Pengurusan Bengkel & Jualan Motosikal

> **100% Cloudflare Native (Workers, D1, R2, Cron)**  
> Sistem operasi bersepadu 3S (*Sales, Service, Spare Parts*) moden untuk bengkel dan kedai motosikal dengan kos operasi hampir sifar dan kependaman ultra rendah (*edge latency* < 5ms).

---

## 🌟 3 Ciri Inovatif Utama

1. **Digital Motorcycle Passport (`/passport/:plate`)**
   - Setiap motosikal diberikan sijil kesihatan (*Health Score* 0–100, Gred A/B/C) dan kod QR kalis air yang ditampal pada kenderaan.
   - Menyimpan rekod servis rasmi, cop masa, dan alat ganti tulen yang dipasang.
   - Menaikkan nilai jualan semula (*resale value*) motosikal pelanggan di pasaran terpakai.

2. **Transparent Video Jobcard (`/track/:token`)**
   - Mekanik merakam video 5–10 saat menunjukkan komponen rosak/haus.
   - Pelanggan menerima pautan WhatsApp unik (tanpa perlu mendaftar akaun) dan boleh menonton video bukti kerosakan serta menekan butang **`[✅ Luluskan Penukaran]`** atau **`[❌ Biarkan Dulu]`**.

3. **Predictive Parts Booking (Cloudflare Cron)**
   - Enjin ramalan yang mengira purata kilometer harian (*daily km average*) setiap motosikal.
   - Meramal tarikh haus komponen kritikal (seperti belting CVT setiap 20,000 km, minyak enjin, atau pad brek) dan menempah alat ganti siap-siap di rak sebelum kenderaan rosak di tepi jalan.

---

## ⚙️ Modul-Modul Teras

* **🔧 Bengkel & Job Card (Work Orders):** Papan Kanban interaktif dengan fasa *Menunggu*, *Sedang Dibaiki*, *Menunggu Kelulusan Video*, *Siap*, dan *Selesai / Bayar POS*.
* **📦 Inventori & Lokasi Rak:** Kawalan baki stok alat ganti, petunjuk lokasi rak fizikal di bengkel (contoh: `RAK-A1`, `RAK-B2`), dan pengesanan stok bawah paras.
* **🛡️ Semakan Keaslian Alat Ganti (Anti-Ciplak):** Pengimbas kod siri unik kilang/kedai. Memaparkan lencana tulen rasmi FFmotor, saluran pembekal sah, dan memberi amaran sekiranya kod diimbas terlalu kerap (disyaki klon).
* **🏍️ Showroom Motosikal & Jual Motor:** Pengurusan inventori motosikal baharu dan terpakai (No Enjin, No Chasis). Apabila jualan dibuat, sistem **secara automatik mencipta profil kenderaan di pangkalan data** untuk kitaran servis seterusnya!
* **🎯 Saluran Prospek (Leads):** Pengurusan bakal pembeli motor dan integrasi peringatan WhatsApp terus kepada pelanggan.

---

## 🏗️ Seni Bina Sistem (Cloudflare Architecture)

```
                  ┌─────────────────────────────────────────┐
                  │    Pelanggan (Scan QR / WhatsApp Link)  │
                  │    Staf & Mekanik (PWA Tablet / Mobile) │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │        Cloudflare Edge Network          │
                  │                                         │
                  │  apps/web : React + Vite + Tailwind CSS │
                  │  apps/api : Hono on Cloudflare Workers  │
                  └────────────┬──────────────┬─────────────┘
                               │              │
              ┌────────────────┴────┐   ┌─────┴───────────────┐
              ▼                     ▼   ▼                     ▼
     ┌─────────────────┐  ┌─────────────────┐   ┌─────────────────┐
     │  Cloudflare D1  │  │  Cloudflare R2  │   │ Cloudflare Cron │
     │  (SQLite DB via │  │ (Video, Foto &  │   │   (Predictive   │
     │   Drizzle ORM)  │  │  Digital Docs)  │   │ Mileage Engine) │
     └─────────────────┘  └─────────────────┘   └─────────────────┘
```

---

## 🚀 Panduan Menjalankan Projek Secara Tempatan

### 1. Keperluan Sistem
* Node.js v20+ atau v24+
* pnpm v10+ atau v12+

### 2. Pasang Dependensi
```bash
pnpm install
```

### 3. Jana Migrasi Pangkalan Data D1
```bash
pnpm db:generate
```

### 4. Jalankan Sistem
* **Backend API (Cloudflare Workers via Wrangler):**
  ```bash
  pnpm dev:api
  # Berjalan di http://localhost:8787
  ```
* **Frontend Web & PWA (React + Vite):**
  ```bash
  pnpm dev:web
  # Berjalan di http://localhost:3000
  ```

Data permulaan (*seed data*) akan dimuatkan secara automatik semasa kali pertama aplikasi dibuka atau melalui endpoint `http://localhost:8787/api/seed`.

---

## 🚢 Panduan Deployment ke Cloudflare Production

1. **Cipta Pangkalan Data D1:**
   ```bash
   wrangler d1 create ffmotor_db
   ```
2. **Cipta Bucket R2 (Penyimpanan Video & Dokumen):**
   ```bash
   wrangler r2 bucket create ffmotor-assets
   ```
3. **Deploy Backend API:**
   ```bash
   pnpm --filter @ffmotor/api deploy
   ```
4. **Deploy Frontend Web (Cloudflare Pages / Workers Static Assets):**
   ```bash
   pnpm --filter @ffmotor/web build
   wrangler pages deploy apps/web/dist --project-name ffmotor-web
   ```

---

## 📄 Struktur Direktori Monorepo

```text
FFmotor/
├── wrangler.toml              # Konfigurasi Cloudflare D1, R2, dan Cron Trigger
├── packages/
│   └── db/                    # Skema Drizzle ORM & fail migrasi SQLite D1
│       ├── src/schema/
│       │   ├── users.ts       # Staf (Admin, Kasir, Mekanik, Sales)
│       │   ├── vehicles.ts    # No Plat, Mileage, Skor Kesihatan Pasport
│       │   ├── products.ts    # Alat Ganti, Rak & Kod Siri Keaslian
│       │   ├── work_orders.ts # Job Card, Video Bukti R2 & Kos
│       │   ├── sales.ts       # Showroom Motosikal & Rekod Jualan
│       │   └── leads.ts       # Prospek & Tempahan Ramalan
│       └── drizzle.config.ts
└── apps/
    ├── api/                   # Hono Web Framework atas Cloudflare Workers
    │   ├── src/routes/        # Endpoint REST API & Portal Awam
    │   ├── src/cron/          # Enjin ramalan mileage harian
    │   └── src/index.ts
    └── web/                   # Frontend React (Vite) + Tailwind PWA
        ├── src/pages/         # Papan Pemuka, Bengkel, Stok, Semak Ori, Showroom, Live Track & Pasport
        └── src/App.tsx
```

