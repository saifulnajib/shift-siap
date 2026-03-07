# Rule: Auto-Update Changelog

Setiap kali kamu (AI) melakukan perubahan pada kode, kamu **WAJIB** menuliskan ringkasan perubahan tersebut ke dalam file `CHANGELOG.md` di root project.

## Kapan Harus Dijalankan

Aturan ini berlaku setiap kali kamu:
- Menambahkan fitur baru (halaman, komponen, API endpoint, dll.)
- Mengubah perilaku atau tampilan fitur yang sudah ada
- Memperbaiki bug
- Melakukan refaktor signifikan yang mempengaruhi tampilan atau perilaku

> Pengecualian: perubahan kecil seperti koreksi typo, rename variabel internal, atau update komentar **tidak perlu** dicatat.

## Format Entri Changelog

Tambahkan entri baru di **paling atas** daftar, tepat setelah garis `---` pembuka. Gunakan tanggal hari ini (format `YYYY-MM-DD`).

```md
---
## [YYYY-MM-DD]

### Added
- Deskripsi singkat fitur baru yang ditambahkan

### Updated
- Deskripsi singkat fitur yang diubah/diperbaiki

### Fixed
- Deskripsi singkat bug yang diperbaiki
```

**Aturan penulisan:**
- Gunakan Bahasa Indonesia
- Setiap poin diawali huruf kapital
- Sertakan nama halaman/komponen yang berubah (bold jika perlu)
- Jika sudah ada entri dengan tanggal yang sama, **tambahkan ke entri yang sudah ada** (jangan buat entri tanggal baru)
- Hanya tulis seksi (`Added`, `Updated`, `Fixed`) yang relevan; hapus seksi yang tidak terpakai

## Lokasi File

```
/CHANGELOG.md          ← wajib diperbarui
```

> File `public/changelog.json` **tidak perlu** diperbarui secara otomatis; file ini diperbarui manual oleh developer.
