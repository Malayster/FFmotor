# FFmotor Enterprise — Piagam Masterplan & Standard Emas Sistem Bengkel 3S

**Versi:** 2.0  
**Tarikh Rujukan:** Oktober 2026  
**Lokasi Operasi:** FFmotor Cawangan Mergong, Alor Setar  
**Kegunaan:** Rujukan Pasukan Audit, Legal, Teknikal, Bank Negara Malaysia (BNM), Kementerian Perdagangan Dalam Negeri (KPDN)  

Dokumen ini adalah **piagam mutlak** dan standard emas industri bagi sistem operasi bengkel motosikal dan showroom jualan **FFmotor**. Semua pembangun, ejen AI, pengurus teknikal, dan pengguna sistem **wajib** mematuhi ketetapan di bawah tanpa kompromi. Dokumen ini menggabungkan `PROJECT_MASTERPLAN.md`, `AGENTS.md`, dan evolusi sistem sehingga sesi terkini.

---

## 1. Visi & Skop Sistem

FFmotor OS ialah sistem operasi bersepadu **3S (Sales, Service, Spare Parts)** yang 100% Cloudflare Native (Workers, D1 SQLite, R2, Cron). Ia menguruskan:

- Showroom jualan motosikal baharu & terpakai
- Bengkel servis (4-bay hoist lif)
- Inventori alat ganti & komponen
- Kewangan kaunter & penutupan lejar
- Pipeline pinjaman kredit (Aeon/Chailease dll.)
- Pasport digital motosikal & ramalan servis
- Komunikasi pelanggan via WhatsApp rasmi (`wa.me`)

**Matlamat:** Kos operasi hampir sifar, latency edge < 5ms, pemisahan tugas yang ketat, ketelusan kepada pelanggan, dan kesediaan audit penuh.

---

## 2. Lima Undang-Undang Emas Sistem (Gold Standard)

### I. Sifar Video Proof (Ketetapan Mutlak Pengasas)
- Aliran “Video Proof”, “Video Jobcard”, “Transparent Video”, atau sebarang keperluan video pembuktian kerosakan **DILARANG SAMA SEKALI**.
- Tiada borang muat naik video, pemain video, atau status `waiting_approval` berasaskan kelulusan video pelanggan yang boleh menahan motosikal di pit.
- Aliran QC: Ketua Foreman menjalankan pemeriksaan kualiti **fizikal** di lif hoist, menandakan senarai semak, dan terus menukar status kepada **`ready`** (Sedia Diambil).
- Medan legacy dalam skema (`videoProofKey`, `videoDescription`, status `waiting_approval`) **tidak boleh digunakan**. Polisi ini mengatasi sebarang dokumentasi lama dalam README.

### II. Skema 4 Warna Kontras Tinggi Mutlak (Sifar Gradient)
Hanya **4 warna** dibenarkan di seluruh antaramuka:

| Warna | Kod / Kelas | Penggunaan |
|-------|-------------|------------|
| Putih | `#ffffff` / `bg-white` | Latar kandungan, kad metrik, borang, slip 80mm |
| Hitam | `#000000` / `bg-zinc-950` / `text-zinc-950 font-black` | Sidebar, tajuk, butang dominan |
| Merah Motorsport | `#dc2626` / `bg-red-600` / `text-red-600` | Harga jualan, amaran stok, status aktif, checkout |
| Hijau Muda | `#10b981` / `bg-emerald-50` / `text-emerald-800` | Baki tunai sepadan, lulus/siap, stok sihat, pasport sah |

- **Sifar Gradient**: Dilarang `bg-gradient-*`, `radial-gradient`.
- **Sifar Teks Kelam**: Dilarang `text-zinc-400` / `text-zinc-500` di atas latar putih atau gelap. Gunakan `text-zinc-950` atau `text-zinc-800 font-bold`.

### III. Pembahagian Kerja Staf yang Bebas & Tepat (Separation of Duties)
Pemilik **TIDAK** melakukan data entry operasi harian.

| Peranan | PIN Stesen | Skop & Beban Kerja |
|---------|:----------:|--------------------|
| **Owner HQ (Tuan Farid)** | **8899** | Semakan harian eksekutif sahaja: tunai masuk, untung bersih, lejar Maybank, buka akaun staf, kawal PIN. **Tidak** mengurus kaunter. |
| **Kerani 1 (Kaunter & SA – Aiman)** | **3344** | Pendaftaran masuk servis (Express Intake 30s), POS bayaran kaunter, WhatsApp CRM, invois, semakan slip deposit tempahan 48 jam. |
| **Kerani 2 (Stor & Stok – Fauzi)** | **2233** | Kiraan stok, pengeluaran ke pit, PO pembekal, semakan kod siri keaslian, bungkusan e-dagang. |
| **Ketua Foreman (Abang Din)** | **1122** | Lantai bengkel & 4-bay hoist: agihan kerja, pemasa SLA 45 minit, pesanan alat segera, QC fizikal siap servis. Gelaran rasmi: **Foreman** (bukan Mandor). |
| **Ejen Afiliasi & Jualan (Zack)** | **5566** | Katalog showroom, prospek jualan, status kelulusan pinjaman, komisen ejen. |

### IV. Dua Inventori Berbeza Mesti Kekal Terpisah
- **Inventori Motosikal Showroom**: Tabel `motorcycles` / `motor_sales`. Diurus di modul jualan. Rekod: No Enjin, No Casis, Kos, Harga, Status (`available`, `booked`, `loan_pending`, `sold`).
- **Inventori Stor Alat Ganti**: Tabel `products`. Diurus di modul inventori. Rekod: SKU, Barcode, Rak (`RAK-A1`), `minAlertQty`, Kos, Harga Runcit.
- Dashboard Pemilik mesti memaparkan dua kad ringkasan berasingan.

### V. Zero-Trust & Kawalan Akses Ketat
Setiap stesen dikunci mengikut PIN dan hak akses navigasi. Percubaan akses di luar peranan memaparkan skrin “Akses Disekat (Unauthorized Access)”.

---

## 3. Matriks Keselamatan Akses Zero-Trust

```
[Owner 8899]     → AKSES PENUH (Dashboard, Finance, Staff Admin, Settings, Desk, Operasi)
[Kerani 1 3344]  → KAUNTER (Kerani 1 Meja, POS Checkout, Work Orders, Leads, Quotations)
[Kerani 2 2233]  → STOR (Kerani 2 Meja, Inventory, Suppliers, Authenticity, Packing)
[Foreman 1122]   → BENGKEL (Foreman Dashboard, Pit Master 4-Bay, Variation Orders)
[Affiliate 5566] → SHOWROOM (Affiliate Dashboard, Showroom Motor, Loan Pipeline)
```

Autentikasi: PIN stesen + session token (Bearer) atau header `x-ff-user-id` / `x-ff-user-role` (fallback terminal). Normalisasi peranan dilakukan dalam `authz.ts`.

---

## 4. Seni Bina Teknikal Ringkas

- **Frontend**: React 18 + Vite + Tailwind CSS (palet 4 warna) + Lucide + Framer Motion. PWA.
- **Backend API**: Cloudflare Workers + Hono Framework (type-safe RPC) + Zod Validator.
- **Pangkalan Data**: Cloudflare D1 (SQLite Edge) via Drizzle ORM.
- **Penyimpanan**: Cloudflare R2 (foto, dokumen digital).
- **Cron**: Predictive Mileage Engine (tempahan alat ganti berkala).
- **Komunikasi**: Pautan rasmi `wa.me` WhatsApp (tiada bot pihak ketiga yang berisiko sekatan).
- **Dokumentasi API Interaktif**: `/api/docs` (Scalar) + `/api/openapi.json`.

---

## 5. Ciri Utama & Aliran Emas

1. **Digital Motorcycle Passport** (`/passport/:plate` atau token)
   - Skor Kesihatan 0–100, Gred A/B/C.
   - Kod QR kalis air pada kenderaan.
   - Rekod servis rasmi, alat ganti tulen, cop masa.
   - Menaikkan nilai jualan semula (relevan KPDN & perlindungan pengguna).

2. **Predictive Parts Booking** (Cloudflare Cron)
   - Kira purata km harian.
   - Ramal tarikh haus komponen (cth. belting CVT setiap 20,000 km).
   - Auto-reserve stok sebelum kenderaan rosak.

3. **Express Intake Servis** (Kerani 1)
   - Pendaftaran 30 saat dengan no plat + aduan.
   - Auto cipta/kemaskini profil kenderaan.

4. **Golden Flow Jualan Motor**
   - Jualan motosikal → status `sold` → auto cipta rekod dalam `vehicles` untuk kitaran servis masa depan (jika no plat diberikan).

5. **Semakan Keaslian Alat Ganti**
   - Kod siri unik, lencana tulen FFmotor, amaran jika diimbas terlalu kerap (disyaki klon).

6. **Penutupan Kaunter & Z-Report**
   - Kiraan fizikal vs sistem, petti cash, dikunci ke lejar D1.

---

## 6. Aliran Kerja Utama

### Servis Bengkel
1. Kerani 1: Express Intake / Work Order → status `pending`.
2. Foreman: Agih bay, mekanik kerja, pesanan alat ke stor.
3. Kerani 2: Keluarkan stok, semak siri jika high-value.
4. Foreman: QC fizikal → status `ready`.
5. Kerani 1: POS bayaran → status `completed`, kiraan tunai.

### Jualan Showroom
1. Affiliate: Katalog, prospek (leads), kalkulator pinjaman.
2. Loan Pipeline: Daftar permohonan → kanban stage.
3. Jualan: Rekod `motor_sales` → auto pasport kenderaan.

### Kewangan
- Semua transaksi tunai/POS dicatat.
- Harian: Penutupan register (Z-Report).
- Owner: Semak lejar, untung, masalah harga bawah kos.

---

## 7. Penjajaran Awal dengan BNM & KPDN

- **BNM**: Pipeline pinjaman, kalkulator ansuran, rekod bayaran, penutupan tunai (kawalan wang tunai & kredit pengguna). Sistem menyokong audit trail penuh.
- **KPDN**: Ketelusan harga, waranti, keaslian alat ganti (anti-ciplak), rekod servis via Pasport Digital, perlindungan pengguna melalui rekod yang kekal.

Dokumen teknikal terperinci (API, middleware, skema) dan panduan audit/compliance berada dalam fail berasingan.

---

**Dokumen ini ialah sumber kebenaran utama.** Sebarang perubahan besar mesti dilapor dan mendapat persetujuan sebelum dilaksanakan. Polisi “Sifar Video Proof” dan “Pemisahan Tugas” adalah tidak boleh digugat.