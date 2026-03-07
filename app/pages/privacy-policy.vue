<template>
  <div class="font-display bg-background-light text-taupe-deep min-h-screen flex flex-col geometric-bg">

    <!-- Top Navigation -->
    <nav class="sticky top-0 z-50 w-full px-6 py-4 md:px-12 flex items-center justify-between bg-background-light/80 backdrop-blur-md border-b border-brown-border/10">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <div class="bg-primary p-1.5 rounded-lg text-white shadow-lg shadow-primary/20">
          <svg class="size-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
            <path clip-rule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236Z" fill="currentColor" fill-rule="evenodd"></path>
          </svg>
        </div>
        <h2 class="text-lg font-black tracking-tighter text-taupe-deep uppercase">SHiFT <span class="text-primary italic">Flow</span></h2>
      </NuxtLink>
      <NuxtLink
        to="/"
        class="flex items-center gap-1.5 text-sm font-semibold text-taupe-soft hover:text-primary transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Kembali ke Beranda
      </NuxtLink>
    </nav>

    <!-- Content -->
    <main class="flex-grow w-full max-w-4xl mx-auto px-6 py-12 md:px-8">
      <!-- Header -->
      <div class="mb-10 pb-8 border-b border-brown-border/20">
        <div class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
          Dokumen Legal
        </div>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight text-taupe-deep mb-3">Kebijakan Privasi</h1>
        <p class="text-taupe-soft text-sm">Terakhir diperbarui: 6 Maret 2026</p>
      </div>

      <!-- Intro -->
      <div class="prose-custom space-y-10">

        <section>
          <p class="text-taupe-soft leading-relaxed">
            Kebijakan Privasi ini menjelaskan bagaimana <strong>SHiFT Flow</strong> ("kami", "sistem", atau "layanan") mengumpulkan, menggunakan, dan melindungi informasi yang Anda berikan saat menggunakan platform manajemen jadwal kerja ini. Dengan menggunakan layanan kami, Anda menyetujui praktik yang dijelaskan dalam Kebijakan Privasi ini.
          </p>
        </section>

        <section>
          <h2>1. Informasi yang Kami Kumpulkan</h2>
          <p>Kami dapat mengumpulkan informasi berikut saat Anda menggunakan SHiFT Flow:</p>
          <ul>
            <li><strong>Informasi Akun</strong> — nama pengguna, kata sandi (tersimpan dalam bentuk terenkripsi), dan data profil administrator.</li>
            <li><strong>Data Pegawai</strong> — nama, NIP, jabatan, dan unit kerja yang diimpor atau diinput ke dalam sistem.</li>
            <li><strong>Data Jadwal</strong> — informasi jadwal shift, waktu masuk, waktu keluar, dan catatan kehadiran.</li>
            <li><strong>Data Sesi</strong> — cookie sesi untuk menjaga status login Anda (kedaluwarsa otomatis setelah 2 jam).</li>
            <li><strong>Log Aktivitas</strong> — waktu akses dan aktivitas penggunaan untuk kebutuhan keamanan dan audit internal.</li>
          </ul>
        </section>

        <section>
          <h2>2. Cara Kami Menggunakan Informasi</h2>
          <p>Informasi yang dikumpulkan digunakan untuk:</p>
          <ul>
            <li>Menjalankan dan menyediakan fungsionalitas sistem manajemen jadwal shift.</li>
            <li>Memproses dan menampilkan data kehadiran pegawai yang akurat.</li>
            <li>Menghasilkan laporan rekapitulasi presensi untuk keperluan administratif.</li>
            <li>Memastikan keamanan akses sistem melalui autentikasi yang ketat.</li>
            <li>Meningkatkan performa dan keandalan layanan secara berkelanjutan.</li>
          </ul>
        </section>

        <section>
          <h2>3. Penyimpanan dan Keamanan Data</h2>
          <p>
            Kami berkomitmen menjaga keamanan data Anda. Beberapa langkah perlindungan yang kami terapkan:
          </p>
          <ul>
            <li>Kata sandi disimpan menggunakan algoritma hashing yang aman dan tidak dapat dibaca secara langsung.</li>
            <li>Sesi login dibatasi selama <strong>2 jam</strong> dan secara otomatis kedaluwarsa untuk mencegah akses tidak sah.</li>
            <li>Akses ke data sistem dibatasi hanya untuk pengguna yang telah terautentikasi dengan hak akses yang sesuai.</li>
            <li>Koneksi ke server menggunakan protokol yang aman.</li>
          </ul>
        </section>

        <section>
          <h2>4. Berbagi Informasi dengan Pihak Ketiga</h2>
          <p>
            SHiFT Flow <strong>tidak menjual, menyewakan, atau membagikan</strong> data Anda kepada pihak ketiga untuk tujuan komersial. Data dapat diteruskan hanya dalam kondisi berikut:
          </p>
          <ul>
            <li>Integrasi dengan sistem SIAP (Sistem Informasi Aparatur Pemerintah) Kota Tanjungpinang sesuai kebutuhan operasional dinas.</li>
            <li>Kewajiban hukum berdasarkan peraturan perundang-undangan yang berlaku.</li>
            <li>Permintaan resmi dari instansi berwenang yang sah.</li>
          </ul>
        </section>

        <section>
          <h2>5. Hak Pengguna</h2>
          <p>Sebagai pengguna sistem, Anda berhak untuk:</p>
          <ul>
            <li>Meminta informasi mengenai data pribadi yang tersimpan dalam sistem.</li>
            <li>Meminta koreksi atas data yang tidak akurat.</li>
            <li>Meminta penghapusan akun dan data terkait (sesuai ketentuan operasional instansi).</li>
            <li>Mengajukan keberatan atas pemrosesan data yang tidak sesuai dengan fungsi sistem.</li>
          </ul>
        </section>

        <section>
          <h2>6. Cookie dan Penyimpanan Lokal</h2>
          <p>
            Sistem kami menggunakan <strong>cookie sesi</strong> untuk menjaga status autentikasi Anda selama berinteraksi dengan platform. Cookie ini:
          </p>
          <ul>
            <li>Bersifat esensial untuk fungsi sistem dan tidak dapat dinonaktifkan.</li>
            <li>Tidak digunakan untuk pelacakan lintas situs atau tujuan iklan.</li>
            <li>Secara otomatis dihapus setelah sesi berakhir (maksimal 2 jam) atau saat Anda logout.</li>
          </ul>
        </section>

        <section>
          <h2>7. Retensi Data</h2>
          <p>
            Data yang tersimpan dalam sistem akan dipertahankan selama diperlukan untuk keperluan operasional dan pelaporan kehadiran sesuai kebijakan instansi terkait. Data dapat dihapus atas permintaan administrator sistem atau sesuai kebutuhan audit internal.
          </p>
        </section>

        <section>
          <h2>8. Perubahan Kebijakan Privasi</h2>
          <p>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diumumkan melalui halaman ini beserta tanggal pembaruan. Penggunaan layanan setelah pembaruan dianggap sebagai persetujuan atas perubahan yang berlaku.
          </p>
        </section>

        <section>
          <h2>9. Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi ini, silakan hubungi:
          </p>
          <div class="contact-card">
            <p><strong>Dinas Komunikasi dan Informatika</strong></p>
            <p>Kota Tanjungpinang, Kepulauan Riau</p>
            <p>
              Website:
              <a href="https://lantik.kominfo.tanjungpinangkota.go.id/" target="_blank" class="text-primary hover:underline">
                lantik.kominfo.tanjungpinangkota.go.id
              </a>
            </p>
          </div>
        </section>

      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full px-12 py-8 flex items-center justify-between gap-6 border-t border-brown-border/10">
      <p class="text-sm text-taupe-soft">© 2026 SHiFT Flow · Dibuat oleh <a class="text-primary hover:underline" href="https://instagram.com/saifulnadjib" target="_blank">@saifulnadjib</a></p>
      <NuxtLink to="/" class="text-sm font-medium text-taupe-soft hover:text-primary transition-colors">← Kembali ke Beranda</NuxtLink>
    </footer>

  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Kebijakan Privasi - SHiFT Flow',
  description: 'Kebijakan privasi SHiFT Flow menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.',
  ogTitle: 'Kebijakan Privasi - SHiFT Flow',
  ogDescription: 'Kebijakan privasi SHiFT Flow — platform manajemen jadwal shift Pemerintah Kota Tanjungpinang.',
})

definePageMeta({
  layout: false
})
</script>

<style scoped>
.geometric-bg {
  background-color: transparent;
  background-image: radial-gradient(rgba(177, 149, 117, 0.1) 1px, transparent 1px);
  background-size: 32px 32px;
}

.prose-custom section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prose-custom h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-taupe-deep, #3d2e22);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(166, 137, 102, 0.15);
}

.prose-custom p {
  color: var(--color-taupe-soft, #7a6551);
  line-height: 1.75;
}

.prose-custom ul {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0;
  list-style: none;
}

.prose-custom ul li {
  color: var(--color-taupe-soft, #7a6551);
  line-height: 1.75;
  position: relative;
  padding-left: 1.25rem;
}

.prose-custom ul li::before {
  content: '–';
  position: absolute;
  left: 0;
  color: var(--color-primary, #a07850);
  font-weight: 700;
}

.prose-custom strong {
  color: var(--color-taupe-deep, #3d2e22);
  font-weight: 600;
}

.contact-card {
  background: rgba(160, 120, 80, 0.05);
  border: 1px solid rgba(160, 120, 80, 0.2);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.contact-card p {
  color: var(--color-taupe-soft, #7a6551);
  font-size: 0.875rem;
}
</style>
