# FFmotor — Dokumentasi Teknikal Lengkap: Seni Bina, Middleware, Modul, API & Komunikasi

**Versi:** 2.0  
**Rujukan untuk:** Pasukan Teknikal, Audit IT, Developer, Legal (rujukan teknikal)  

Dokumen ini merinci keseluruhan implementasi sistem FFmotor berdasarkan kod sumber dalam repositori `Malayster/FFmotor`. Ia merangkumi middleware, semua modul/route, model data, komunikasi, dan aliran dalaman.

---

## 1. Seni Bina Sistem (Cloudflare Edge)

```
Pelanggan / Staf (PWA / Browser / QR)
          │
          ▼
Cloudflare Edge Network
├── apps/web : React 18 + Vite + Tailwind (PWA)
└── apps/api : Hono on Cloudflare Workers
          │
          ├── Cloudflare D1 (SQLite via Drizzle ORM)
          ├── Cloudflare R2 (Foto, Dokumen Digital)
          └── Cloudflare Cron (Predictive Mileage)
```

- **Monorepo**: pnpm workspace.
- **API**: Type-safe Hono RPC. OpenAPI 3.1 dijana dan dipaparkan via Scalar di `/api/docs`.
- **CORS**: Dibenarkan untuk semua origin dengan header `Content-Type`, `Authorization`, `x-ff-user-id`, `x-ff-user-role`.
- **Health**: `GET /health` dan `GET /api/health`.
- **Seed**: `GET /api/seed` (dikunci selepas pengguna wujud dalam production).

### Struktur Direktori Utama
```
FFmotor/
├── wrangler.toml
├── packages/db/src/schema/     # Semua skema Drizzle
├── apps/api/src/
│   ├── index.ts                # Entry, routers, cron handler
│   ├── middlewares/            # error.ts, guard.ts
│   ├── routes/                 # Satu fail per domain
│   ├── services/               # Business logic
│   ├── authz.ts                # Resolve user & normalize role
│   ├── cron/predictive.ts
│   └── docs/openapi.ts
└── apps/web/src/               # Pages, components, terminals
```

---

## 2. Middleware & Kawalan Global

### 2.1 Error Handler (`middlewares/error.ts`)
- Global `app.onError(errorHandler)`.
- Kelas ralat: `AppError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`.
- ZodError diformat menjadi senarai path + message.
- Respons standard:
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "...",
      "details": ...
    }
  }
  ```

### 2.2 Guard & Autentikasi (`middlewares/guard.ts` + `authz.ts`)
- `requireAuth()`: Pastikan sesi staf wujud.
- `requireRole(allowedRoles[])`: Semak peranan (owner sentiasa dibenarkan).
- `requireOwner()`: Hanya owner.
- Resolusi pengguna (`resolveUser`):
  1. Bearer token → lookup `staff_sessions` + `users`.
  2. Header `x-ff-user-id` → mapping Zero-Trust staff atau DB.
  3. Header `x-ff-user-role` → mapping fallback.
- Peranan dinormalisasi: `owner`, `kerani_1`, `kerani_2`, `foreman`, `affiliate`.

### 2.3 Context Hydration
- Middleware global menyuntik `c.set("user", user)` jika header/token sah.

---

## 3. Senarai Modul & API Routes

Semua route dipasang dalam `apps/api/src/index.ts`.

| Prefix | Modul | Penerangan Utama | Kawalan Akses Tipikal |
|--------|-------|------------------|-----------------------|
| `/api/auth` | Autentikasi | Login email/password, Zero-Trust PIN verify | Public / Protected |
| `/api/vehicles` | Kenderaan | Profil motosikal, pasport | Auth |
| `/api/work-orders` | Bengkel | Job card, items, status, bayaran POS | Auth (Kerani/Foreman) |
| `/api/products` | Inventori | Katalog, stok, rak | Auth (Kerani 2) |
| `/api/verify` | Keaslian | Semak kod siri alat ganti | Auth |
| `/api/sales` | Jualan Motor | CRUD motorcycles, rekod jual | Auth |
| `/api/leads` | Prospek | Saluran pembeli | Auth |
| `/api/public` | Portal Awam | Track, passport, storefront | Public |
| `/api/quotations` | Sebut Harga | Quotation management | Auth |
| `/api/locks` | Kunci Motor | Bike locks | Auth |
| `/api/warranty-issues` | Waranti | Isu waranti | Auth |
| `/api/finance/closing` | Kewangan | Current register, history, close Z-Report | Auth |
| `/api/inbox` | Inbox | Mesej/notifikasi dalaman | Auth |
| `/api/suppliers` | Pembekal | PO & pembekal | Auth (Kerani 2) |
| `/api/staff` | Staf | Pengurusan akaun | Owner |
| `/api/loan-pipeline` | Pinjaman | Senarai, calculate, create, update stage | Auth (Affiliate) |
| `/api/vo` | Variation Orders | Perubahan pesanan | Auth |
| `/api/owner` | Owner Desk | Board eksekutif, arahan | Owner |
| `/api/desk` | Desk | Shots, shop, operasi harian | Auth |

Sub-routes tambahan: `bag`, `shots`, `shop`.

### Contoh Endpoint Terperinci

#### Work Orders (`/api/work-orders`)
- `GET /` — Senarai (filter status)
- `GET /:id` — Detail + items
- `POST /` — Cipta (Express Intake dengan plateNumber atau vehicleId)
- `POST /:id/items` — Tambah part/labor (auto tolak stok)
- `DELETE /:id/items/:itemId` — Padam & kembalikan stok
- `POST /:id/pay` — Bayaran POS → completed
- `PATCH /:id/status` — Update status (enum: pending, inspecting, in_progress, waiting_parts, ready, completed, cancelled) — **tiada waiting_approval**

#### Sales (`/api/sales`)
- `GET /motorcycles` — Senarai (filter status)
- `POST /motorcycles` — Tambah stok
- `PATCH /motorcycles/:id` — Kemaskini harga/status
- `POST /sell` — Rekod jualan + auto cipta vehicle jika ada plate

#### Loan Pipeline (`/api/loan-pipeline`)
- `GET /` — Senarai permohonan
- `POST /calculate` — Kalkulator ansuran (amount, term, rate)
- `POST /` — Daftar permohonan
- `PATCH /:id/stage` — Kemaskini fasa kanban

#### Finance Closing (`/api/finance/closing`)
- `GET /current` — Ringkasan laci hari ini
- `GET /history` — Sejarah Z-Reports
- `POST /close` — Tutup kaunter & jana Z-Report

#### Owner (`/api/owner`)
- `GET /board` — Papan eksekutif (wang, margin, masalah, aktiviti)

---

## 4. Model Data (Skema D1 / Drizzle)

Skema utama dieksport dari `packages/db/src/schema/index.ts`:

| Jadual | Tujuan Utama |
|--------|--------------|
| `users` | Staf & peranan |
| `staff_sessions` | Token sesi |
| `vehicles` | Pasport motosikal (plate, healthScore, passportToken, dailyKmAvg) |
| `products` + `product_serials` | Inventori + keaslian siri |
| `work_orders` + `work_order_items` | Job card & item (status tanpa video aktif) |
| `motorcycles` + `motor_sales` | Showroom & jualan |
| `leads` | Prospek |
| `quotations` | Sebut harga |
| `loan_pipeline` | Permohonan kredit |
| `cash_closings` | Z-Report & penutupan |
| `warranty_issues` | Isu waranti |
| `web_orders` | Pesanan e-dagang |
| `item_shots` | Set gambar produk/motor |
| `predictiveBookings` | Tempahan ramalan (diguna cron) |
| Lain-lain | `bike_locks`, `variation_orders`, `suppliers`, `chat_messages`, `owner_control`, dll. |

**Nota Polisi**: Medan video dalam `work_orders` adalah legacy dan tidak digunakan selaras dengan Piagam.

---

## 5. Komunikasi & Integrasi

- **WhatsApp**: Pautan `wa.me` dijana secara langsung (tiada API pihak ketiga yang berisiko). Digunakan untuk CRM, notifikasi ramalan, track status.
- **Public Endpoints**: `/api/public` untuk portfolio pelanggan, track plat, passport view, storefront, quotation/VO view.
- **QR**: Passport token dan track token.
- **Tiada Video**: Tiada penyimpanan atau streaming video pembuktian.

---

## 6. Cron & Automasi

`scheduled` handler dalam worker:
- Menjalankan `runPredictiveMileageCron`.
- Logik: Untuk motor auto (NVX, Vario, ADV), kira baki km ke 20,000 km berikutnya. Jika ≤ 2,500 km, cipta `predictiveBookings` + mesej WhatsApp cadangan.

---

## 7. Frontend Modul Utama (apps/web)

- Terminals: Counter, Customer, Executive, Pit, Hub Switcher.
- Dashboards peranan: Owner, Kerani 1/2, Foreman, Affiliate.
- Pages: WorkOrders, SalesPipelineKanban, QuotationManager, PosCheckout, Inventory, Passport, TrackLive, PublicStorefront, dll.
- Komponen: ZeroTrustAuthModal, WorkshopNadiBar, BikeLoanCalculator, dll.
- Palet warna dikunci kepada 4 warna sahaja.

---

## 8. OpenAPI & Dokumentasi Interaktif

- Spesifikasi dalam `apps/api/src/docs/openapi.ts`.
- Dipaparkan di `/api/docs`.
- Contoh paths yang didokumentasikan: health, auth login, zero-trust verify, work-orders, products, finance closing, loan calculate, owner board.

---

**Dokumen ini mencerminkan keadaan kod pada SHA rujukan terkini.** Untuk audit penuh, rujuk skema sebenar dan log D1. Sebarang penambahan ciri mesti mematuhi Piagam Masterplan (terutama Sifar Video Proof dan Separation of Duties).