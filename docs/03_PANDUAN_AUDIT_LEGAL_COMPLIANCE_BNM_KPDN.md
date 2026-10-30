# FFmotor — Panduan Audit, Legal, Compliance & Rujukan BNM / KPDN

**Versi:** 2.0  
**Rujukan untuk:** Pasukan Audit Dalaman/Luaran, Legal, Bank Negara Malaysia (BNM), Kementerian Perdagangan Dalam Negeri (KPDN), Teknikal  

Dokumen ini menyediakan rangka kerja kawalan, jejak audit, dan penjajaran regulatori sistem FFmotor. Ia berdasarkan Piagam Masterplan, implementasi teknikal, dan amalan terbaik untuk operasi bengkel 3S di Malaysia.

---

## 1. Objektif Kawalan & Kesediaan Audit

Sistem direka untuk:

- Pemisahan tugas yang ketat (Owner tidak entry operasi).
- Jejak penuh transaksi (work order, jualan, stok, tunai, pinjaman).
- Ketelusan kepada pelanggan (Pasport Digital, rekod servis, keaslian alat).
- Kawalan akses Zero-Trust berasaskan peranan & PIN stesen.
- Data kekal dalam Cloudflare D1 (edge SQLite) dengan log API.

---

## 2. Kawalan Akses & Zero-Trust (Relevan Audit IT & Legal)

| Kawalan | Implementasi | Bukti / Cara Semak |
|---------|--------------|--------------------|
| Autentikasi stesen | PIN 4-digit + session token | `staff_sessions`, log login |
| Peranan | 5 peranan ketat + normalisasi | `authz.ts`, `users.role` |
| Least Privilege | Middleware `requireRole` / `requireOwner` | Route guards |
| Unauthorized Access | Skrin “Akses Disekat” | Frontend + API 403 |
| Session Expiry | `expiresAt` pada staff_sessions | Query DB |

**Rekomendasi Audit:** Semak log percubaan akses luar peranan, pastikan tiada akaun bersama, pastikan Owner tidak mempunyai borang entry harian.

---

## 3. Kawalan Kewangan & Relevan BNM

### 3.1 Penutupan Kaunter & Z-Report
- Endpoint: `/api/finance/closing/current`, `/history`, `/close`.
- Data: Opening float, system expected cash, physical counted, petty cash, notes.
- Rekod dikunci ke `cash_closings` dengan nombor Z-Report.
- **Kawalan:** Perbezaan (variance) mesti dijelaskan. Owner semak harian.

### 3.2 Transaksi Tunai & POS
- Bayaran work order dan jualan dicatat dengan kaedah (Cash, DuitNow QR, Card).
- Auto kemas kini grand total & payment status.

### 3.3 Pipeline Pinjaman / Kredit Pengguna
- Modul `/api/loan-pipeline`.
- Kalkulator ansuran (amount, term, interest).
- Rekod: customer IC, salary, deposit, provider (Aeon/Chailease dll.), stage.
- **Nota BNM**: Sistem menyokong rekod permohonan kredit. Pastikan pematuhan kepada garis panduan kredit pengguna / pembiayaan jika terpakai. Data pelanggan dilindungi. Tiada pemprosesan bayaran dalam talian penuh pada masa dokumen ini (gerbang bayaran belum diimplementasi sepenuhnya).

**Rekomendasi:** Audit trail lengkap dari prospek → loan application → jualan → bayaran. Pastikan tiada manipulasi harga bawah kos tanpa dilog sebagai “Masalah”.

---

## 4. Perlindungan Pengguna & Relevan KPDN

### 4.1 Digital Motorcycle Passport
- Setiap kenderaan ada `healthScore`, `passportToken`, rekod servis, alat ganti dipasang.
- QR kalis air.
- Manfaat: Ketelusan sejarah servis → nilai jualan semula lebih tinggi, perlindungan pembeli terpakai.

### 4.2 Keaslian Alat Ganti (Anti-Ciplak)
- Jadual `product_serials`: serialNumber unik, scannedCount, status (in_stock → installed).
- Amaran jika diimbas terlalu kerap.
- High-value parts memerlukan serial check.
- **Relevan KPDN**: Melindungi pengguna daripada alat palsu / klon.

### 4.3 Waranti
- Modul `warranty-issues`.
- Rekod isu dan resolusi.

### 4.4 Ketelusan Harga & Servis
- Harga jualan & kos direkod.
- Work order items (part + labor) terperinci.
- Quotation & Variation Orders.
- Public track & passport view tanpa akaun.

### 4.5 Komunikasi
- WhatsApp rasmi `wa.me` (tiada spam bot).
- Mesej ramalan servis yang proaktif.

**Rekomendasi KPDN:** Pastikan rekod servis & alat ganti boleh dikemukakan apabila diminta. Polisi “Sifar Video Proof” digantikan dengan QC fizikal + senarai semak (lebih praktikal dan tidak menahan kenderaan).

---

## 5. Jejak Audit & Data Retention

| Data | Lokasi | Tempoh Cadangan | Catatan |
|------|--------|-----------------|---------|
| Work Orders & Items | `work_orders`, `work_order_items` | Minimum 7 tahun | Termasuk aduan, nota mekanik, bayaran |
| Jualan Motor | `motor_sales`, `motorcycles` | Minimum 7 tahun | Termasuk IC pelanggan |
| Penutupan Tunai | `cash_closings` | Minimum 7 tahun | Z-Report |
| Loan Pipeline | `loan_pipeline` | Selaras keperluan kredit | |
| Pasport Kenderaan | `vehicles` | Sepanjang hayat kenderaan | |
| Log API | Cloudflare Workers logs | Selaras polisi | |
| Foto / Dokumen | R2 | Selaras keperluan | |

**Kawalan:** Data tidak boleh dipadam secara sembarangan. Padam akaun staf tidak memadam rekod transaksi lama.

---

## 6. Polisi Mutlak yang Mempengaruhi Audit

1. **Sifar Video Proof** — Tiada kebergantungan pada video. QC fizikal sahaja. Medan legacy tidak digunakan.
2. **Separation of Duties** — Owner hanya semakan eksekutif. Entry oleh Kerani / Foreman / Affiliate.
3. **4 Warna Mutlak** — Konsistensi UI untuk mengurangkan kekeliruan staf.
4. **Dua Inventori Terpisah** — Motosikal vs Alat Ganti. Laporan berasingan.
5. **Foreman bukan Mandor** — Istilah rasmi.

Pelanggaran terhadap polisi ini dianggap kecacatan kritikal (lihat AGENTS.md).

---

## 7. Daftar Risiko & Kawalan (Ringkas)

| Risiko | Kawalan Sistem | Kawalan Operasi |
|--------|----------------|-----------------|
| Akses tidak sah | Zero-Trust PIN + Role guard | PIN berbeza per stesen, tiada berkongsi |
| Stok hilang / salah | Auto deduct pada work order / POS | Kerani 2 kiraan fizikal, serial check |
| Tunai tidak sepadan | Z-Report variance | Owner semak harian |
| Alat palsu | Serial uniqueness + scan count | Prosedur semakan high-value |
| Data pelanggan bocor | Session + role | Tiada akses public ke data sensitif |
| Harga manipulasi | Log “Masalah” jika bawah kos | Owner semak |
| Pinjaman tidak lengkap | Stage kanban + rekod | Affiliate + Owner oversight |

---

## 8. Cadangan untuk Pasukan Audit / Legal / BNM / KPDN

1. Minta akses baca sahaja (atau export) ke D1 untuk sampel rekod.
2. Semak sampel Z-Report vs kiraan fizikal.
3. Semak sampel work order dari intake → ready → paid.
4. Semak sampel serial alat ganti high-value.
5. Semak pasport digital beberapa unit.
6. Sahkan tiada aliran video proof aktif.
7. Sahkan pemisahan tugas (log aktiviti mengikut userId/role).
8. Semak polisi privasi data pelanggan (IC, telefon) — sistem menyimpan untuk rekod transaksi & servis.

---

## 9. Dokumen Rujukan Lain

- `01_PIAGAM_MASTERPLAN_FFMOTOR.md` — Polisi mutlak & gold standard.
- `02_DOKUMENTASI_TEKNIKAL_API_MODUL_MIDDLEWARE.md` — Detail teknikal penuh.
- Kod sumber: Repositori FFmotor (API, schema, frontend).
- OpenAPI: `/api/docs` pada environment berjalan.

---

**Dokumen ini disediakan sebagai rujukan komprehensif.** Ia bukan nasihat undang-undang atau regulatori formal. Pasukan Legal dan Compliance perlu mengesahkan pematuhan spesifik kepada Akta Perlindungan Pengguna, garis panduan BNM, dan keperluan KPDN semasa. Sebarang penemuan audit mesti dibincangkan dengan pengurusan FFmotor sebelum tindakan pembetulan.

**Status:** Siap untuk rujukan pasukan audit/legal/teknikal/BNM/KPDN.