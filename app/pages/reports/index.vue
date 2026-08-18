<template>
  <div class="flex flex-col h-full bg-background-light dark:bg-background-dark">

    <!-- ══ FILTER PANEL ══════════════════════════════════════════════════ -->
    <section class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-end gap-4 shrink-0">
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
          <UPopover :content="{ align: 'start' }">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-heroicons-calendar-days"
              class="w-44 justify-start font-normal"
            >
              {{ dateStartLabel }}
            </UButton>
            <template #content>
              <UCalendar :model-value="calendarStart as any" @update:model-value="calendarStart = $event as any" />
            </template>
          </UPopover>
        </div>

        <!-- Tanggal Selesai -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Selesai</label>
          <UPopover :content="{ align: 'start' }">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-heroicons-calendar-days"
              class="w-44 justify-start font-normal"
            >
              {{ dateEndLabel }}
            </UButton>
            <template #content>
              <UCalendar :model-value="calendarEnd as any" @update:model-value="calendarEnd = $event as any" />
            </template>
          </UPopover>
        </div>
      </div>

      <UButton
        icon="i-heroicons-document-magnifying-glass"
        color="primary"
        :loading="previewLoading"
        :disabled="!selectedEmployee || !dateStart || !dateEnd"
        @click="generatePreview"
      >
        Preview Laporan
      </UButton>
    </section>

    <!-- ══ BODY: PREVIEW ═══════════════════════════════════════════════ -->
    <div class="flex-1 overflow-auto p-6">

      <!-- Empty state -->
      <div v-if="!showReport" class="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
        <span class="material-symbols-outlined text-6xl">table_view</span>
        <p class="font-semibold">Pilih pegawai dan rentang tanggal, lalu klik <strong>Preview Laporan</strong></p>
      </div>

      <!-- ══ HASIL REKAP ═══════════════════════════════════════════════ -->
      <div v-else class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8">

        <!-- KOP -->
        <div class="text-center mb-6">
          <p class="font-bold text-[15pt] uppercase">PEMERINTAH KOTA TANJUNGPINANG</p>
          <p class="font-bold text-[12pt]">{{ selectedUnitOpd?.label || 'NAMA UNIT OPD' }}</p>
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
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Jumlah Hari Kerja</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Hadir</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Cuti</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Dinas Luar</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Dinas Dalam</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Sakit</th>
              <th style="border:1px solid #333; padding:6px 8px; text-align:center;">Tanpa Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rekapRows" :key="i">
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ i + 1 }}</td>
              <td style="border:1px solid #333; padding:5px 8px;">{{ row.bulan }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.hariKerja }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.hadir }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.cuti }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.dinasLuar }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.dinasDalam }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.sakit }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ row.tanpaKeterangan }}</td>
            </tr>
            <!-- Total row -->
            <tr style="font-weight:bold; background:#f9f9f9;">
              <td colspan="2" style="border:1px solid #333; padding:5px 8px; text-align:center;">Total</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.hariKerja }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.hadir }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.cuti }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.dinasLuar }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.dinasDalam }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.sakit }}</td>
              <td style="border:1px solid #333; padding:5px 8px; text-align:center;">{{ totals.tanpaKeterangan }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { type DateValue } from '@internationalized/date'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({
  title: 'Laporan Presensi - SHiFT Flow',
  description: 'Rekapitulasi presensi pegawai.',
})

const user = useCookie<any>('user')
const { fetchEmployeesByUnitOpd } = useSiapApi()
const toast = useToast()

// ── Filters ──────────────────────────────────────────────────────────
const unitOpds = ref<any[]>([])
const selectedUnitOpd = ref<any>(null)
const employees = ref<any[]>([])
const selectedEmployee = ref<any>(null)
const showReport = ref(false)
const previewLoading = ref(false)

// ── Calendar state (UCalendar pakai DateValue) ────────────────────────
const calendarStart = ref<DateValue | null>(null)
const calendarEnd   = ref<DateValue | null>(null)

// Konversi CalendarDate → string YYYY-MM-DD yang dipakai seluruh logika
const dateStart = computed(() =>
  calendarStart.value ? `${calendarStart.value.year}-${String(calendarStart.value.month).padStart(2,'0')}-${String(calendarStart.value.day).padStart(2,'0')}` : ''
)
const dateEnd = computed(() =>
  calendarEnd.value ? `${calendarEnd.value.year}-${String(calendarEnd.value.month).padStart(2,'0')}-${String(calendarEnd.value.day).padStart(2,'0')}` : ''
)

// Label yang ditampilkan di tombol kalender
const dateStartLabel = computed(() =>
  calendarStart.value ? format(new Date(dateStart.value), 'd MMM yyyy', { locale: idLocale }) : 'Pilih tanggal'
)
const dateEndLabel = computed(() =>
  calendarEnd.value ? format(new Date(dateEnd.value), 'd MMM yyyy', { locale: idLocale }) : 'Pilih tanggal'
)

const unitOpdOptions = computed(() => unitOpds.value.map(u => ({ id: u.id_unit_opd, label: u.nama_unit_opd, ...u })))
const employeeOptions = computed(() => employees.value.map(e => ({ id: e.pin, label: e.nama, ...e })))

// ── Rekap Data ───────────────────────────────────────────────────────
const rekapRows = ref<any[]>([])

const totals = computed(() => ({
  hariKerja:      rekapRows.value.reduce((s, r) => s + r.hariKerja, 0),
  hadir:          rekapRows.value.reduce((s, r) => s + r.hadir, 0),
  cuti:           rekapRows.value.reduce((s, r) => s + r.cuti, 0),
  dinasLuar:      rekapRows.value.reduce((s, r) => s + r.dinasLuar, 0),
  dinasDalam:     rekapRows.value.reduce((s, r) => s + r.dinasDalam, 0),
  sakit:          rekapRows.value.reduce((s, r) => s + r.sakit, 0),
  tanpaKeterangan: rekapRows.value.reduce((s, r) => s + r.tanpaKeterangan, 0),
}))

const generatePreview = async () => {
  if (!dateStart.value || !dateEnd.value || !selectedEmployee.value) return

  const start = new Date(dateStart.value)
  const end   = new Date(dateEnd.value)
  const months = eachMonthOfInterval({ start: startOfMonth(start), end: endOfMonth(end) })

  previewLoading.value = true
  try {
    const res: any = await $fetch('/api/shifts/rekap-presensi', {
      method: 'POST',
      body: {
        pin: selectedEmployee.value.id,
        tanggal_mulai: dateStart.value,
        tanggal_selesai: dateEnd.value,
      },
    })

    const list: any[] = res?.data || []

    rekapRows.value = months.map(m => {
      const key = format(m, 'yyyy-MM')
      const days = list.filter(d => (d.tgl_presensi || '').startsWith(key))
      const sum = (fn: (d: any) => boolean) => days.filter(fn).length
      return {
        bulan: format(m, 'MMMM yyyy', { locale: idLocale }),
        hariKerja: days.length,
        hadir: sum(d => classifyAlasan(d.alasan) === 'hadir'),
        cuti: sum(d => classifyAlasan(d.alasan) === 'cuti'),
        dinasLuar: sum(d => classifyAlasan(d.alasan) === 'dinas-luar'),
        dinasDalam: sum(d => classifyAlasan(d.alasan) === 'dinas-dalam'),
        sakit: sum(d => classifyAlasan(d.alasan) === 'sakit'),
        tanpaKeterangan: sum(d => classifyAlasan(d.alasan) === 'tanpa-keterangan'),
      }
    })
  } catch (e: any) {
    toast.add({ title: 'Gagal mengambil data presensi', description: e?.data?.message || e?.message || 'Terjadi kesalahan', color: 'error' })
    rekapRows.value = []
    return
  } finally {
    previewLoading.value = false
  }

  showReport.value = true
}

const classifyAlasan = (alasan: string) => {
  const a = (alasan || '').trim().toLowerCase()
  if (!a || a === 'hau') return 'hadir'                // tanpa alasan & apel upacara = masuk kerja
  if (a === 'dd') return 'dinas-dalam'
  if (a === 'ld' || a === 'dl') return 'dinas-luar'
  if (a === 'ct' || a === 'cap') return 'cuti'
  if (a === 's' || a === 'sw') return 'sakit'
  if (a === 'tk' || a === 'a') return 'tanpa-keterangan'
  return 'hadir'
}

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

watch([selectedEmployee, calendarStart, calendarEnd], () => { showReport.value = false })

onMounted(fetchUnitOpds)
</script>
