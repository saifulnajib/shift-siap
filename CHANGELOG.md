# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/).

---

## [2026-02-22]

### Updated
- Logic parsing Excel pada halaman Jadwal Shift sekarang melewati 3 baris pertama (data dimulai dari baris ke-4)
- Penamaan aplikasi di halaman Login dan Sidebar diubah menjadi `ShiftFlow`
- Penambahan atribut informasi pada Header Admin (Judul Halaman dinamis, Tanggal hari ini, dan Info Pengguna)
- Implementasi metadata SEO (`useSeoMeta`) di seluruh halaman panel admin (Dashboard, Pegawai, Jadwal, dan Shift)
- Perbaikan layout dan standarisasi warna Nuxt UI v3 pada halaman Master Shift (Master Shift)

---

## [2026-02-20]

### Added
- Footer pada halaman Changelog dengan navigasi ke Beranda dan Support
- Utility `server/utils/siap.ts` sebagai satu-satunya tempat URL & token SIAP API

### Updated
- `nuxt.config.ts` ditambahkan `runtimeConfig` untuk mengekspos env vars ke server
- Sistem changelog beralih dari git-based ke file `CHANGELOG.md` manual

### Added
- Halaman Changelog yang dapat diakses publik dari halaman Landing
- API `/api/changelog` untuk membaca data changelog
- Link "Changelog" di footer halaman Landing

### Fixed
- Halaman Changelog kini dapat diakses tanpa login (public access)
- Pembaruan URL & token terpusat
- Pembersihan `console.log` dan informasi debugging pada semua file server API untuk produksi
- Perbaikan tampilan Dark Mode pada halaman Login, Header tabel Jadwal Shift, dan halaman Changelog

### Updated
- Standarisasi warna dark mode menggunakan palet `background-dark` dan `slate` yang konsisten
- Penambahan atribut meta SEO (`useSeoMeta`) pada halaman Landing dan Login

---

## [2026-02-19]

### Added
- Halaman Landing dengan tombol navigasi ke halaman Login
- Tombol "Masuk ke Admin" pada halaman Landing

### Updated
- Path menu Dashboard diubah menjadi `/dashboard`

---

## [2026-02-17]

### Added
- Form upload file Excel pada halaman jadwal admin
- Parsing file Excel menggunakan library `xlsx`
- Tampilan sementara data hasil parsing sebagai JSON

---

## [2026-02-13]

### Fixed
- Error TypeScript `'error' is of type 'unknown'` pada `login.post.ts`
- Error TypeScript `Cannot find name 'Buffer'` pada `pegawai.post.ts`
