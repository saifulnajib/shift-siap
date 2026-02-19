# 🚀 Panduan Instalasi ShiftFlow di Server

Panduan ini menjelaskan langkah-langkah untuk menginstal dan menjalankan aplikasi **ShiftFlow** pada server Linux (Ubuntu/Debian).

---

## 📋 Prasyarat

Pastikan server sudah memiliki:

| Kebutuhan | Versi Minimum |
|-----------|--------------|
| Node.js   | v18.x atau lebih baru |
| npm       | v9.x atau lebih baru |
| MySQL     | v8.0 atau lebih baru |
| Git       | Versi terbaru |
| PM2 *(opsional, untuk production)* | Versi terbaru |

---

## 1. Instalasi Dependensi Sistem

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Node.js (menggunakan NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi instalasi
node -v
npm -v

# Install MySQL
sudo apt install -y mysql-server

# Jalankan MySQL dan aktifkan saat boot
sudo systemctl start mysql
sudo systemctl enable mysql

# Install Git
sudo apt install -y git

# Install PM2 secara global (untuk production)
sudo npm install -g pm2
```

---

## 2. Clone Source Code

```bash
# Pindah ke direktori yang diinginkan, contoh:
cd /var/www

# Clone repository
git clone <URL_REPOSITORY> shift

# Masuk ke direktori project
cd shift
```

> Ganti `<URL_REPOSITORY>` dengan URL repository Git Anda (GitHub, GitLab, dll).

---

## 3. Konfigurasi Environment

```bash
# Salin file contoh environment
cp .env.example .env

# Edit file .env sesuai konfigurasi server
nano .env
```

Isi file `.env` dengan konfigurasi database Anda:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_anda
DB_NAME=siap_shift
```

---

## 4. Konfigurasi Database MySQL

```bash
# Masuk ke MySQL sebagai root
sudo mysql -u root -p
```

Jalankan perintah berikut di dalam MySQL shell:

```sql
-- Buat user database (opsional, lebih aman dari menggunakan root)
CREATE USER 'shiftflow'@'localhost' IDENTIFIED BY 'password_anda';

-- Buat database
CREATE DATABASE IF NOT EXISTS siap_shift CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Berikan hak akses
GRANT ALL PRIVILEGES ON siap_shift.* TO 'shiftflow'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

---

## 5. Instalasi Dependensi Aplikasi

```bash
# Install semua package Node.js
npm install
```

---

## 6. Inisialisasi Database

```bash
# Buat database (jika belum dibuat manual)
node scripts/init-db.mjs

# Setup tabel-tabel yang diperlukan
node scripts/setup-tables.mjs
```

---

## 7. Build Aplikasi untuk Production

```bash
# Build aplikasi Nuxt
npm run build
```

Hasil build akan tersimpan di folder `.output/`.

---

## 8. Menjalankan Aplikasi

### Menggunakan PM2 (Direkomendasikan untuk Production)

```bash
# Jalankan aplikasi dengan PM2
pm2 start .output/server/index.mjs --name "shiftflow"

# Simpan konfigurasi PM2 agar otomatis berjalan saat reboot
pm2 save
pm2 startup
```

Ikuti instruksi yang muncul dari perintah `pm2 startup` untuk mengaktifkan autostart.

### Menggunakan Node.js Langsung

```bash
node .output/server/index.mjs
```

---

## 9. Konfigurasi Reverse Proxy dengan Nginx *(Opsional)*

Jika menggunakan Nginx sebagai reverse proxy:

```bash
# Install Nginx
sudo apt install -y nginx

# Buat konfigurasi virtual host
sudo nano /etc/nginx/sites-available/shiftflow
```

Isi dengan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name domain-anda.com;  # Ganti dengan domain/IP server

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktifkan konfigurasi
sudo ln -s /etc/nginx/sites-available/shiftflow /etc/nginx/sites-enabled/

# Test konfigurasi Nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 10. Verifikasi Instalasi

```bash
# Cek status PM2
pm2 status

# Lihat log aplikasi
pm2 logs shiftflow

# Cek apakah port 3000 aktif
ss -tlnp | grep 3000
```

Buka browser dan akses `http://IP_SERVER:3000` atau domain yang sudah dikonfigurasi.

---

## 🔄 Update Aplikasi

Untuk memperbarui aplikasi ke versi terbaru:

```bash
cd /var/www/shift

# Pull perubahan terbaru
git pull origin main

# Install dependensi baru (jika ada)
npm install

# Build ulang
npm run build

# Restart aplikasi
pm2 restart shiftflow
```

---

## 🛠️ Troubleshooting

### Aplikasi tidak bisa terhubung ke database
- Pastikan MySQL berjalan: `sudo systemctl status mysql`
- Periksa konfigurasi `.env` sudah benar
- Pastikan user database memiliki hak akses yang cukup

### Port 3000 sudah digunakan
- Cek proses yang menggunakan port: `sudo lsof -i :3000`
- Hentikan proses tersebut atau ubah port di konfigurasi Nuxt

### Error saat build
- Pastikan versi Node.js sesuai: `node -v`
- Hapus cache dan install ulang: `rm -rf node_modules .nuxt && npm install`

---

## 📁 Struktur Direktori Penting

```
shift/
├── app/            # Kode frontend (Vue/Nuxt)
├── server/         # API endpoints
├── scripts/        # Script inisialisasi database
├── public/         # Asset statis
├── .env            # Konfigurasi environment (jangan di-commit!)
├── .env.example    # Contoh konfigurasi environment
├── nuxt.config.ts  # Konfigurasi Nuxt
└── package.json    # Dependensi project
```

---

> **Catatan:** Jangan pernah menyertakan file `.env` ke dalam repository Git. File ini sudah terdaftar di `.gitignore`.
