# AGENTS.md — Peraturan Mandatori Ejen AI Sistem FFmotor

Dokumen ini adalah **kontrak peraturan mandatori** untuk semua ejen kecerdasan buatan (AI) yang bekerja di repositori ini. Sebarang pelanggaran terhadap peraturan di bawah dianggap sebagai kecacatan kritikal (critical failure).

---

## 🛑 PERATURAN MUTLAK (ZERO TOLERANCE)

### 1. DILARANG MENYUNTIK CIRI "VIDEO PROOF"
- Jangan sesekali menambah, menyarankan, atau mengembalikan sebarang ciri video pembuktian pembaikan (*video proof*, *video inspection*, *video jobcard*).
- Status `waiting_approval` berasaskan kelulusan video pelanggan adalah diharamkan.
- Aliran servis selepas mekanik siap bekerja adalah pemeriksaan kualiti fizikal oleh Ketua Foreman dan status terus ditukar kepada `ready` (Sedia Diambil).

### 2. DILARANG MENGGUNAKAN GRADIENT ATAU WARNA KELAM
- Hanya 4 warna dibenarkan:
  - **Putih** (`bg-white`, `#ffffff`)
  - **Hitam** (`bg-zinc-950`, `text-zinc-950 font-black`, `#000000`)
  - **Merah Motorsport** (`bg-red-600`, `text-red-600`, `#dc2626`)
  - **Hijau Muda** (`bg-emerald-50`, `text-emerald-800`, `#10b981`)
- **Sifar Gradient**: Jangan sesekali menggunakan kelas `bg-gradient-to-*`, `radial-gradient`, atau overlay gelap lutsinar bertingkat.
- **Sifar Teks Kelam**: Teks penerangan mesti berkepekatan tinggi (`text-zinc-950` atau `text-zinc-800 font-bold`). Jangan gunakan kelabu pudar seperti `text-zinc-400` atau `text-zinc-500` di atas latar putih.

### 3. JANGAN LONGGOKKAN KERJA OPERASI KEPADA PEMILIK (OWNER)
- Pemilik (PIN: `8899`) hanya menyemak lejar harian, untung bersih, status 4 pit, mengawal akaun staf, dan menetapkan nombor akaun bank syarikat.
- Pendaftaran intake, POS jualan kaunter, aduan, dan sebut harga **mesti** diuruskan oleh Kerani 1 Kaunter (PIN: `3344`).
- Pengiraan rak stok, pesanan PO pembekal, dan kod siri keaslian **mesti** diuruskan oleh Kerani 2 Stor (PIN: `2233`).
- Papan pit dan agihan mekanik **mesti** diuruskan oleh Ketua Foreman (PIN: `1122`).
- Jangan letakkan borang kemasukan data harian di papan pemuka pemilik.

### 4. FOREMAN BUKAN MANDOR
- Gunakan gelaran rasmi **"Foreman"** atau **"Ketua Foreman"** di seluruh kod, dokumen, dan antara muka. Jangan gunakan perkataan "Mandor".

### 5. DUA INVENTORI BERBEZA MESTI KEKAL TERPISAH
- Motosikal Showroom disimpan dalam tabel `motorcycles` / `motor_sales` dan diuruskan di `#motor-sales`.
- Alat Ganti Stor disimpan dalam tabel `products` dan diuruskan di `#inventory`.
- Dashboard Pemilik mesti memaparkan 2 kad ringkasan pantas berasingan bagi kedua-dua inventori ini.

### 6. LAPORKAN DAN DAPATKAN PERSETUJUAN SEBELUM PERUBAHAN BESAR
- Sentiasa terangkan pelan teknikal secara jujur dan padat sebelum melakukan refactor besar.
- Pastikan build web (`pnpm --filter @ffmotor/web build`) lulus dengan kod keluar 0 sebelum menyerahkan tugasan.

