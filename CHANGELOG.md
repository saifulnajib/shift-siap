# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/).

---
## [2026-03-09]

### Added
- Halaman **Kinerja** (`/kinerja`) dengan tabel data kinerja pegawai yang terintegrasi dengan API e-Kinerja BKN
- Filter dropdown **Tahun** dan **Bulan** untuk memilih periode penilaian kinerja
- Filter dropdown **Status** (Semua / Sudah Buat / Belum Buat) untuk memfilter data berdasarkan status pengisian kinerja
- Kolom pencarian real-time berdasarkan **Nama** dan **NIP** pegawai
- Paginasi *client-side* (50 data per halaman) untuk menangani ribuan data tanpa membebani *browser*
- Tampilkan kolom: No, Nama, NIP, Jabatan, Nilai Kinerja, Perilaku Kerja, dan Predikat
- Logika **left join** antara daftar pegawai OPD sesi dan data kinerja BKN — pegawai yang belum mengisi ditampilkan dengan label **BELUM BUAT**
- Backend API proxy (`/api/kinerja`) dan (`/api/kinerja/periodes`) untuk komunikasi ke endpoint BKN melalui SIAP

---
## [2026-03-06]

### Added
- Tombol **Kembali ke Beranda** pada halaman Login untuk navigasi kembali ke landing page
- Kalender interaktif (`UCalendar`) pada halaman **Laporan** menggantikan input tanggal native browser untuk memilih Tanggal Mulai dan Tanggal Selesai
- Halaman **Kebijakan Privasi** (`/privacy-policy`) dalam bahasa Indonesia, dapat diakses dari footer landing page

### Updated
- Layout halaman **Laporan** diubah menjadi dua kolom bersebelahan dengan rasio **1:3** — panel *Data Penandatangan* di kiri dan pratinjau PDF di kanan
- Panel *Data Penandatangan* kini selalu terlihat di kolom kiri dan tombol **Cetak PDF** dipindahkan ke bawah panel tersebut

---
## [2026-02-28]

### Added
- Halaman **Laporan Absensi** (`/reports`) untuk mencetak laporan kehadiran pegawai dalam format PDF
- Form filter laporan: Unit OPD, Pegawai, tanggal mulai, dan tanggal selesai
- Input manual data penandatangan (Nama, NIP, Pangkat, Jabatan)
- Pratinjau laporan dalam format A4 langsung di browser
- Tombol **Cetak** dengan CSS khusus agar hanya kanvas laporan yang dicetak

### Updated
- Link **"Laporan"** pada sidebar dashboard diarahkan ke halaman `/reports`
- Dropdown Unit OPD distandarisasi menggunakan komponen `UnitOpdSelect` yang dapat digunakan kembali di halaman Pegawai dan Laporan

---
## [2026-02-26]

### Added
- Integrasi pengiriman data jadwal ke SIAP 
- Tombol **Kirim ke Server** pada modal Upload Excel kini aktif dengan indikator loading dan feedback sukses/error

### Updated
- Validasi saat impor Excel: tanggal sebelum hari ini tidak dimasukkan ke dalam data JSON (hanya tanggal hari ini dan seterusnya yang dikirim)
- Halaman **Dashboard** dan **Jadwal Shift** kini otomatis menampilkan periode yang sedang berjalan saat pertama kali dibuka (jika tanggal > 20, periode aktif berpindah ke bulan berikutnya)

---
## [2026-02-23]

### Updated
- Implementasi durasi sesi (cookie expire) selama 2 jam setelah login


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
- Halaman Changelog yang dapat diakses publik dari halaman Landing
- API `/api/changelog` untuk membaca data changelog
- Link "Changelog" di footer halaman Landing

### Updated
- `nuxt.config.ts` ditambahkan `runtimeConfig` untuk mengekspos env vars ke server
- Sistem changelog beralih dari git-based ke file `CHANGELOG.md` manual
- Standarisasi warna dark mode menggunakan palet `background-dark` dan `slate` yang konsisten
- Penambahan atribut meta SEO (`useSeoMeta`) pada halaman Landing dan Login

### Fixed
- Halaman Changelog kini dapat diakses tanpa login (public access)
- Pembaruan URL & token terpusat
- Pembersihan `console.log` dan informasi debugging pada semua file server API untuk produksi
- Perbaikan tampilan Dark Mode pada halaman Login, Header tabel Jadwal Shift, dan halaman Changelog

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
