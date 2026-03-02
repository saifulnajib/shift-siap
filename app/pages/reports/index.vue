<template>
  <div class="flex flex-col h-full bg-background-light dark:bg-background-dark">

    <!-- ══ FILTER PANEL (no-print) ══════════════════════════════════════════ -->
    <section class="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-end gap-4 shrink-0">
      <div class="flex flex-wrap gap-4 flex-1">
        <!-- Unit OPD -->
        <div class="flex flex-col gap-1 min-w-[200px]">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit OPD</label>
          <USelectMenu
            v-model="selectedUnitOpd"
            :items="unitOpdOptions"
            placeholder="Pilih Unit OPD"
            class="w-full"
          />
        </div>

        <!-- Pegawai -->
        <div class="flex flex-col gap-1 min-w-[220px]">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pegawai</label>
          <USelectMenu
            v-model="selectedEmployee"
            :items="employeeOptions"
            :disabled="!selectedUnitOpd"
            placeholder="Pilih Pegawai"
            class="w-full"
          />
        </div>

        <!-- Tanggal Mulai -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Mulai</label>
          <UInput v-model="dateStart" type="date" class="w-44" />
        </div>

        <!-- Tanggal Selesai -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Selesai</label>
          <UInput v-model="dateEnd" type="date" class="w-44" />
        </div>
      </div>

      <UButton
        icon="i-heroicons-document-magnifying-glass"
        color="primary"
        :disabled="!selectedEmployee || !dateStart || !dateEnd"
        @click="generatePreview"
      >
        Preview Laporan
      </UButton>
    </section>

    <!-- ══ SIGNATORY PANEL (no-print) ══════════════════════════════════════ -->
    <section v-if="showReport" class="no-print bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Data Penandatangan</p>
      <div class="flex flex-wrap gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-slate-500">Nama</label>
          <UInput v-model="signer.nama" placeholder="Nama lengkap" class="w-52" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-slate-500">NIP</label>
          <UInput v-model="signer.nip" placeholder="NIP" class="w-44" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-slate-500">Pangkat / Golongan</label>
          <UInput v-model="signer.pangkat" placeholder="Pangkat / Golongan" class="w-52" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-slate-500">Jabatan</label>
          <UInput v-model="signer.jabatan" placeholder="Jabatan" class="w-52" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-slate-500">Tempat, Tanggal</label>
          <UInput v-model="signer.tempat" placeholder="Tanjungpinang, 26 Februari 2026" class="w-60" />
        </div>
        <div class="flex items-end">
          <UButton icon="i-heroicons-printer" color="success" variant="soft" @click="printReport">
            Cetak PDF
          </UButton>
        </div>
      </div>
    </section>

    <!-- ══ PREVIEW / EMPTY STATE ══════════════════════════════════════════ -->
    <div v-if="!showReport" class="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
      <span class="material-symbols-outlined text-6xl">picture_as_pdf</span>
      <p class="font-semibold">Pilih pegawai dan rentang tanggal, lalu klik <strong>Preview Laporan</strong></p>
    </div>

    <!-- ══ PRINT AREA ══════════════════════════════════════════════════════ -->
    <div v-else id="print-area" class="flex-1 overflow-auto bg-slate-200 dark:bg-slate-700 p-6 relative">
      <!-- A4 Paper -->
      <div class="mx-auto bg-white shadow-xl print-page relative overflow-hidden" style="width:210mm; min-height:297mm; padding:20mm 20mm 25mm 25mm; font-family:'Bookman Old Style', Bookman, serif; font-size:12pt; color:#000;">

        <!-- WATERMARK -->
        <div class="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 z-0" style="transform: rotate(-45deg);">
          <span class="text-6xl font-black uppercase tracking-widest text-[#ff0000]">Data Dummy / Simulasi</span>
        </div>

        <div class="relative z-10">
          <!-- KOP SURAT -->
          <div class="text-center mb-4 border-b-2 border-black pb-3">
          <p class="font-bold text-[13pt] uppercase">PEMERINTAH KOTA TANJUNGPINANG</p>
          <p class="font-bold text-[11pt]">{{ selectedUnitOpd?.label || 'NAMA UNIT OPD' }}</p>
          <p class="text-[9pt]">Jl. Contoh No. 1, Tanjungpinang · Telp. (0771) 000-000</p>
        </div>

        <!-- JUDUL -->
        <div class="text-center mb-6">
          <p class="font-bold text-[13pt] uppercase underline">Rekapitulasi Presensi Pegawai</p>
          <p class="text-[11pt]">Periode: {{ formatDateLabel(dateStart) }} s/d {{ formatDateLabel(dateEnd) }}</p>
        </div>

        <!-- INFO PEGAWAI -->
        <table class="mb-6 text-[11pt]" style="border-collapse:collapse; width:100%">
          <tbody>
            <tr>
              <td style="width:40%; padding:2px 4px;">Nama Pegawai</td>
              <td style="width:5%; padding:2px 4px;">:</td>
              <td style="padding:2px 4px; font-weight:bold;">{{ selectedEmployee?.label || '-' }}</td>
            </tr>
            <tr>
              <td style="padding:2px 4px;">NIP</td>
              <td style="padding:2px 4px;">:</td>
              <td style="padding:2px 4px;">{{ selectedEmployee?.nip || '-' }}</td>
            </tr>
            <tr>
              <td style="padding:2px 4px;">Jabatan</td>
              <td style="padding:2px 4px;">:</td>
              <td style="padding:2px 4px;">{{ selectedEmployee?.jabatan || '-' }}</td>
            </tr>
            <tr>
              <td style="padding:2px 4px;">Unit Kerja</td>
              <td style="padding:2px 4px;">:</td>
              <td style="padding:2px 4px;">{{ selectedUnitOpd?.label || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- TABEL REKAPITULASI -->
        <table style="width:100%; border-collapse:collapse; font-size:11pt;">
          <thead>
            <tr style="background:#f0f0f0;">
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">No</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Bulan</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Hadir</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Terlambat</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Izin</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Sakit</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Cuti</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Alpha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rekapRows" :key="i">
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ i + 1 }}</td>
              <td style="border:1px solid #333; padding:5px 8px;">{{ row.bulan }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.hadir }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.terlambat }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.izin }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.sakit }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.cuti }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.alpha }}</td>
            </tr>
            <!-- Total row -->
            <tr style="font-weight:bold; background:#f9f9f9;">
              <td colspan="2" style="border:1px solid #333; padding:5px 8px; text-align:center;">Total</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.hadir }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.terlambat }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.izin }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.sakit }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.cuti }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.alpha }}</td>
            </tr>
          </tbody>
        </table>

        <!-- TANDA TANGAN -->
        <div style="margin-top:48px; display:flex; justify-content:flex-end;">
          <div style="text-align:center; min-width:220px;">
            <p>{{ signer.tempat || 'Tanjungpinang, ...' }}</p>
            <p style="font-weight:bold; margin-top:4px;">{{ signer.jabatan || 'Jabatan Penandatangan' }}</p>
            <div style="height:80px;"></div>
            <p style="font-weight:bold; text-decoration:underline;">{{ signer.nama || 'Nama Penandatangan' }}</p>
            <p>NIP. {{ signer.nip || '...' }}</p>
            <p>{{ signer.pangkat || '' }}</p>
          </div>
        </div>

        <!-- FOOTER CETAK -->
        <div style="margin-top:32px; border-top:1px solid #ccc; padding-top:6px;">
          <p style="font-size:8pt; color:#666;">Dicetak oleh sistem ShiftFlow · {{ printedAt }}</p>
        </div>

        </div> <!-- Tutup relative z-10 -->
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { format, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({
  title: 'Laporan Presensi - SHiFT Flow',
  description: 'Cetak laporan rekapitulasi presensi pegawai.',
})

const user = useCookie<any>('user')
const { fetchEmployeesByUnitOpd } = useSiapApi()

// ── Filters ──────────────────────────────────────────────────────────
const unitOpds = ref<any[]>([])
const selectedUnitOpd = ref<any>(null)
const employees = ref<any[]>([])
const selectedEmployee = ref<any>(null)
const dateStart = ref('')
const dateEnd = ref('')
const showReport = ref(false)
const printedAt = ref('')

const unitOpdOptions = computed(() => unitOpds.value.map(u => ({ id: u.id_unit_opd, label: u.nama_unit_opd, ...u })))
const employeeOptions = computed(() => employees.value.map(e => ({ id: e.pin, label: e.nama, ...e })))

// ── Signatory (manual) ────────────────────────────────────────────────
const signer = reactive({ nama: '', nip: '', pangkat: '', jabatan: '', tempat: '' })

// ── Rekap Data (dummy sampai API tersedia) ────────────────────────────
const rekapRows = ref<any[]>([])

const totals = computed(() => ({
  hadir:     rekapRows.value.reduce((s, r) => s + r.hadir, 0),
  terlambat: rekapRows.value.reduce((s, r) => s + r.terlambat, 0),
  izin:      rekapRows.value.reduce((s, r) => s + r.izin, 0),
  sakit:     rekapRows.value.reduce((s, r) => s + r.sakit, 0),
  cuti:      rekapRows.value.reduce((s, r) => s + r.cuti, 0),
  alpha:     rekapRows.value.reduce((s, r) => s + r.alpha, 0),
}))

const generatePreview = () => {
  if (!dateStart.value || !dateEnd.value || !selectedEmployee.value) return

  const start = new Date(dateStart.value)
  const end   = new Date(dateEnd.value)
  const months = eachMonthOfInterval({ start: startOfMonth(start), end: endOfMonth(end) })

  // Data dummy — ganti dengan pemanggilan API saat sudah tersedia
  rekapRows.value = months.map(m => ({
    bulan:     format(m, 'MMMM yyyy', { locale: idLocale }),
    hadir:     Math.floor(Math.random() * 10 + 18),
    terlambat: Math.floor(Math.random() * 5),
    izin:      Math.floor(Math.random() * 3),
    sakit:     Math.floor(Math.random() * 2),
    cuti:      Math.floor(Math.random() * 2),
    alpha:     Math.floor(Math.random() * 2),
  }))

  printedAt.value = format(new Date(), "d MMMM yyyy 'pukul' HH:mm", { locale: idLocale })
  showReport.value = true
}

const printReport = () => window.print()

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return '-'
  try { return format(new Date(dateStr), 'd MMMM yyyy', { locale: idLocale }) } catch { return dateStr }
}

// ── Data Fetching ─────────────────────────────────────────────────────
const fetchUnitOpds = async () => {
  if (!user.value?.id_opd) return
  try {
    const res: any = await $fetch(`/api/ref/all-unit-opd/${user.value.id_opd}`)
    unitOpds.value = res.data || []
  } catch (e) { console.error(e) }
}

watch(selectedUnitOpd, async (val) => {
  selectedEmployee.value = null
  employees.value = []
  showReport.value = false
  if (val?.id) {
    try {
      const res: any = await fetchEmployeesByUnitOpd(val.id)
      employees.value = res.data || []
    } catch (e) { console.error(e) }
  }
})

watch([selectedEmployee, dateStart, dateEnd], () => { showReport.value = false })

onMounted(fetchUnitOpds)
</script>

<style>
@font-face {
  font-family: 'Bookman Old Style';
  src: url('/fonts/BookmanOldStyle.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

@media print {
  /* Sembunyikan semua elemen UI (Sidebar, Header, Filter, Form) */
  .no-print, aside, header { display: none !important; }
  
  /* Reset layout agar canvas mengambil seluruh layar */
  body, html, #__nuxt, #__layout, main {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
  
  /* Hilangkan scroll dan reset area cetak */
  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: white !important;
  }
  
  /* Hilangkan styling paper/shadows */
  .print-page { 
    box-shadow: none !important; 
    margin: 0 !important;
    width: 100% !important;
    /* Margin halaman dikendalikan oleh setting printer, tapi kita bisa tambah sedikit padding */
    padding: 0 !important;
  }

  @page {
    size: A4 portrait;
    margin: 20mm;
  }
}
</style>
