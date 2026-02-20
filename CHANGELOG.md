# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/).

---

## [2026-02-20]

### Added
- Halaman Changelog yang dapat diakses publik dari halaman Landing
- API `/api/changelog` untuk membaca data changelog
- Link "Changelog" di footer halaman Landing

### Fixed
- Halaman Changelog kini dapat diakses tanpa login (public access)

### Updated
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
