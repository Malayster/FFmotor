# FFmotor Enterprise — Masterplan & Piagam Sistem Bengkel

Dokumen ini adalah piagam mutlak dan standard emas industri bagi sistem operasi bengkel motosikal dan showroom jualan **FFmotor (Cawangan Mergong, Alor Setar)**. Setiap pembangun, ejen AI, dan pengurus teknikal wajib mematuhi seluruh ketetapan di bawah tanpa kompromi.

---

## 1. Lima Undang-Undang Emas Sistem (Gold Standard)

### I. Sifar Video Proof (Ketetapan Mutlak Pengasas)
- Aliran "Video Proof" adalah **DILARANG SAMA SEKALI (HARAM)** di seluruh sistem.
- Tiada sebarang borang muat naik video, pemain video, skrip video WhatsApp, atau sekatan "menunggu kelulusan video pelanggan" yang boleh menahan motosikal di pit.
- Aliran kerja QC fizikal: Ketua Foreman menjalankan pemeriksaan kualiti fizikal di lif hoist, menandakan senarai semak, dan terus mengesahkan status motosikal kepada **`ready` (Sedia Diambil)**.

### II. Skema 4 Warna Kontras Tinggi Mutlak (Sifar Gradient)
Hanya **4 warna** dibenarkan di seluruh antaramuka web dan aplikasi:
1. **Putih (`#ffffff` / `bg-white`)**: Latar belakang kandungan utama, kad metrik, borang intake, slip cetakan 80mm.
2. **Hitam (`#000000` / `bg-zinc-950` / `text-zinc-950 font-black`)**: Latar sidebar kiri, tajuk utama, butang tindakan dominan, teks berkepekatan tinggi.
3. **Merah Motorsport (`#dc2626` / `text-red-600` / `bg-red-600`)**: Penekanan harga jualan, amaran stok kritikal, lencana status servis aktif, butang checkout.
4. **Hijau Muda (`#10b981` / `text-emerald-800` / `bg-emerald-50`)**: Baki tunai laci sepadan, lencana lulus/siap, stok sihat, pasport kenderaan sah.
- **Sifar Gradient**: Penggunaan `bg-gradient-*` atau `radial-gradient` diharamkan sama sekali. Teks kelabu samar (`text-zinc-400`, `text-zinc-500`) di atas latar putih atau gelap dilarang.

### III. Pembahagian Kerja Staf yang Bebas & Tepat (Separation of Duties)
Beban kerja harian dipindahkan sepenuhnya kepada kerani, foreman, dan ejen jualan. Pemilik (Owner) **TIDAK MELAKUKAN DATA ENTRY OPERASI**.

| Peranan | Stesen & PIN | Skop & Beban Kerja Khusus |
|---|:---:|---|
| **Owner HQ (Tuan Farid)** | **`8899`** | **Semakan Harian Eksekutif Sahaja**. Memantau tunai masuk, untung bersih, status lejar Maybank, buka akaun staf baharu, dan mengawal PIN 4-digit. Tidak menguruskan kaunter. |
| **Kerani 1 (Kaunter & SA - Aiman)** | **`3344`** | **Segala Hal Berkaitan Pelanggan**: Pendaftaran masuk servis (30s Express Intake), POS bayaran kaunter, WhatsApp CRM, invois jualan, dan semakan slip deposit tempahan motor 48 jam. |
| **Kerani 2 (Stor & Stok - Fauzi)** | **`2233`** | **Segala Hal Berkaitan Stor & Rak**: Kiraan stok alat ganti, pengeluaran alat ganti ke pit lif, pengurusan pesanan pembekal (PO), semakan kod siri keaslian alat ganti, dan bungkusan e-dagang. |
| **Ketua Foreman (Abang Din)** | **`1122`** | **Lantai Bengkel & 4-Bay Hoist Lif**: Mengagihkan kerja kepada mekanik, pantau pemasa masa nyata lif (SLA 45 minit), membuat pesanan alat ganti segera ke stor, dan melakukan QC fizikal siap servis. *(Istilah: Foreman, bukan Mandor)*. |
| **Ejen Afiliasi & Jualan (Zack)** | **`5566`** | **Showroom & Saluran Pembeli**: Menguruskan katalog motosikal showroom, pendaftaran prospek jualan, semakan status kelulusan pinjaman kredit (loan pipeline), dan komisen ejen. |

---

## 2. Struktur Dua Inventori Berbeza

Sistem FFmotor mengasingkan dua kategori aset secara berasingan:

### A. Inventori Motosikal Showroom (`#motor-sales` & `/api/owner/motorcycles`)
- Menguruskan unit kenderaan fizikal (motosikal baharu dan terpakai).
- Setiap motosikal mempunyai rekod: Nombor Enjin, Nombor Casis, Warna, Tahun, Kos Belian, Harga Jualan, dan Status (`available`, `booked`, `loan_pending`, `sold`).
- Dipantau secara langsung di kad ringkasan eksekutif Dashboard Pemilik.

### B. Inventori Stor Alat Ganti & Komponen (`#inventory` & `/api/products`)
- Menguruskan alat ganti, minyak pelincir, tayar, belting CVT, dan aksesori.
- Setiap produk mempunyai: Kod SKU, Barcode, Lokasi Rak (contoh: `RAK-A1`), Paras Amaran Minimum (`minAlertQty`), Kos Belian, dan Harga Jualan Runcit.
- Penukaran alat ganti di kaunter POS atau kad kerja servis mengurangkan baki kuantiti rak secara langsung.

---

## 3. Matriks Keselamatan Akses Zero-Trust

Setiap stesen di bengkel dikunci mengikut PIN dan hak akses tab navigasi:

```
[Owner 8899]     -> AKSES PENUH (Dashboard, Finance, Staff Admin, Settings, Desk, Operasi)
[Kerani 1 3344]  -> KAUNTER (Kerani 1 Meja, POS Checkout, Work Orders, Leads, Quotations)
[Kerani 2 2233]  -> STOR (Kerani 2 Meja, Inventory, Suppliers, Authenticity, Packing)
[Foreman 1122]   -> BENGKEL (Foreman Dashboard, Pit Master 4-Bay, Variation Orders)
[Affiliate 5566] -> SHOWROOM (Affiliate Dashboard, Showroom Motor, Loan Pipeline)
```

Jika staf cuba mengakses tab di luar kebenaran peranan mereka (contoh: Kerani cuba buka `#settings` atau `#finance`), sistem serta-merta memaparkan skrin **"Akses Disekat (Unauthorized Access)"**.

---

## 4. Senibina Teknikal & Data

- **Frontend**: React 18, Vite, Tailwind CSS (Palet Tersuai Putih, Hitam, Merah, Hijau Muda), Lucide Icons, Framer Motion.
- **Backend API**: Cloudflare Workers, Hono Framework (Type-safe RPC), Zod Validator.
- **Pangkalan Data**: Cloudflare D1 (SQLite Edge) diuruskan melalui Drizzle ORM.
- **Komunikasi Pelanggan**: Integrasi terus pautan rasmi `wa.me` WhatsApp tanpa risiko sekatan nombor.

