<template>
  <div class="flex flex-col h-full bg-background-light dark:bg-background-dark">

    <!-- ══ FILTER & NAVIGATION PANEL (no-print) ══════════════════════════════════════════ -->
    <section class="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col gap-4 shrink-0">
      
      <!-- Top Row: UPTD, Periode & Mode Switch -->
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex flex-wrap gap-4 flex-1 items-end">
          <!-- UPTD (OPD) -->
          <div class="flex flex-col gap-1 min-w-[240px]">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih UPTD</label>
            <USelectMenu
              v-model="selectedUptd"
              :items="uptdOptions"
              placeholder="Pilih UPTD"
              class="w-full"
              searchable
              searchable-placeholder="Cari UPTD..."
            />
          </div>

          <!-- Periode -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Periode Presensi</label>
            <UPopover :content="{ align: 'start' }">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-heroicons-calendar-days"
                class="justify-start font-normal min-w-[220px]"
              >
                {{ dateRangeLabel }}
              </UButton>
              <template #content>
                <UCalendar
                  v-model="dateRange"
                  range
                  class="p-2"
                />
              </template>
            </UPopover>
          </div>
        </div>

        <!-- Search + Action Buttons -->
        <div class="flex flex-wrap items-end gap-3">
          <!-- Search name -->
          <div class="flex flex-col gap-1 flex-1 min-w-[220px]">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Cari Pegawai</label>
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Nama pegawai..."
              class="w-full"
              @keydown.enter="handleSearch"
            />
          </div>

          <!-- Cari & Reset -->
          <div class="flex items-center gap-2 pb-0.5">
            <UButton
              icon="i-heroicons-magnifying-glass"
              color="primary"
              :loading="isLoading"
              :disabled="!selectedUptd"
              @click="handleSearch"
            >
              Cari
            </UButton>
            <UButton
              icon="i-heroicons-x-circle"
              color="neutral"
              variant="outline"
              :disabled="isLoading"
              @click="handleReset"
            >
              Reset
            </UButton>
          </div>

        </div>
      </div>

    </section>


    <!-- ══ BODY CONTENT ════════════════════════════════════════════════════ -->
    <div class="no-print-layout flex flex-1 flex-col overflow-hidden p-6 gap-4">

      <!-- ── TABEL PRESENSI PEGAWAI ─────────────────────────────────────── -->
        
        <!-- Table Search & PerPage Header -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <UBadge color="neutral" variant="subtle" size="md">
              Total: {{ totalCount }} Data
            </UBadge>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-medium">Tampilkan:</span>
            <USelectMenu
              v-model="perPageSelect"
              :items="perPageOptions"
              class="w-20"
            />
          </div>
        </div>

        <!-- Table Container -->
        <div class="flex-1 overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm relative">

          <!-- ── Placeholder: Initial Loading (sebelum data pertama kali masuk) ── -->
          <div
            v-if="isLoading && presensiList.length === 0"
            class="flex flex-col items-center justify-center h-full min-h-[320px] py-20 px-4 text-center gap-4"
          >
            <div class="flex flex-col items-center gap-3">
              <div class="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Memuat Data Presensi</p>
                <p class="text-xs text-slate-400 mt-0.5">Mohon tunggu sebentar...</p>
              </div>
            </div>
          </div>

          <!-- ── Placeholder: Belum pilih UPTD ── -->
          <div
            v-else-if="!selectedUptd && !isLoading"
            class="flex flex-col items-center justify-center h-full min-h-[320px] py-20 px-4 text-center gap-4"
          >
            <div class="relative">
              <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
                <span class="material-symbols-outlined text-4xl text-slate-400">domain</span>
              </div>
              <span class="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                <span class="material-symbols-outlined text-sm text-amber-500">help</span>
              </span>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-1">Pilih UPTD Terlebih Dahulu</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                Pilih UPTD dari dropdown di bagian atas, lalu klik <strong class="text-slate-500">Cari</strong> untuk menampilkan data presensi harian.
              </p>
            </div>
          </div>

          <!-- ── Tabel (data sudah dimuat / reload pagination) ── -->
          <UTable
            v-else
            :columns="columns"
            :data="presensiList"
            :loading="isLoading"
            class="w-full"
          >
            <template #no-cell="{ row }">
              <span class="text-xs font-semibold text-slate-500">{{ row.original.no }}</span>
            </template>

            <template #pegawai-cell="{ row }">
              <div class="flex flex-col py-1">
                <p class="font-bold text-slate-900 dark:text-white text-sm leading-tight">{{ row.original.nama_pegawai || '-' }}</p>
                <span class="text-xs text-slate-500 mt-1">NIP: {{ row.original.nip || '-' }}</span>
              </div>
            </template>

            <template #nama_opd-cell="{ row }">
              <span class="text-xs text-slate-600 dark:text-slate-300">{{ row.original.nama_opd || '-' }}</span>
            </template>

            <template #tgl_presensi-cell="{ row }">
              <span class="text-xs font-mono">{{ row.original.tgl_presensi || '-' }}</span>
            </template>

            <template #waktu_masuk-cell="{ row }">
              <UBadge
                :color="row.original.waktu_masuk ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
                class="font-mono font-bold"
              >
                {{ row.original.waktu_masuk || '-' }}
              </UBadge>
            </template>

            <template #waktu_pulang-cell="{ row }">
              <UBadge
                :color="row.original.waktu_pulang ? 'primary' : 'neutral'"
                variant="subtle"
                size="xs"
                class="font-mono font-bold"
              >
                {{ row.original.waktu_pulang || '-' }}
              </UBadge>
            </template>

            <template #selfie_masuk-cell="{ row }">
              <template v-if="getSelfieUrl(row.original.pin, row.original.selfie_masuk)">
                <button
                  class="group relative block w-10 h-10 rounded-lg overflow-hidden border-2 border-emerald-300 hover:border-emerald-500 shadow transition-all duration-150 hover:scale-110 focus:outline-none"
                  :title="'Lihat selfie masuk'"
                  @click="openSelfie(getSelfieUrl(row.original.pin, row.original.selfie_masuk)!, 'Selfie Masuk – ' + (row.original.nama_pegawai || ''))"
                >
                  <img
                    :src="getSelfieUrl(row.original.pin, row.original.selfie_masuk)!"
                    :alt="'Selfie masuk ' + row.original.nama_pegawai"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span class="material-symbols-outlined text-white text-sm">zoom_in</span>
                  </span>
                </button>
              </template>
              <span v-else class="text-slate-300 text-xs">–</span>
            </template>

            <template #selfie_pulang-cell="{ row }">
              <template v-if="getSelfieUrl(row.original.pin, row.original.selfie_pulang)">
                <button
                  class="group relative block w-10 h-10 rounded-lg overflow-hidden border-2 border-blue-300 hover:border-blue-500 shadow transition-all duration-150 hover:scale-110 focus:outline-none"
                  :title="'Lihat selfie pulang'"
                  @click="openSelfie(getSelfieUrl(row.original.pin, row.original.selfie_pulang)!, 'Selfie Pulang – ' + (row.original.nama_pegawai || ''))"
                >
                  <img
                    :src="getSelfieUrl(row.original.pin, row.original.selfie_pulang)!"
                    :alt="'Selfie pulang ' + row.original.nama_pegawai"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span class="material-symbols-outlined text-white text-sm">zoom_in</span>
                  </span>
                </button>
              </template>
              <span v-else class="text-slate-300 text-xs">–</span>
            </template>

            <template #alasan-cell="{ row }">
              <span class="text-xs text-slate-500 italic">{{ row.original.alasan || '-' }}</span>
            </template>

            <template #bukti_surat-cell="{ row }">
              <a
                v-if="row.original.bukti_surat"
                :href="row.original.bukti_surat"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-primary underline hover:opacity-80"
              >Lihat Bukti</a>
              <span v-else class="text-xs text-slate-400">-</span>
            </template>

            <template #empty>
              <!-- Tidak ada hasil setelah search -->
              <div class="flex flex-col items-center justify-center py-20 px-4 text-center gap-4">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
                  <span class="material-symbols-outlined text-4xl text-slate-400">search_off</span>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-1">Tidak Ada Data Presensi</h3>
                  <p class="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                    Tidak ditemukan data presensi untuk filter yang dipilih. Coba ubah periode atau nama pegawai.
                  </p>
                </div>
              </div>
            </template>
          </UTable>
        </div>

        <!-- Table Footer / Pagination -->
        <div class="flex flex-wrap justify-between items-center gap-4 shrink-0" v-if="totalCount > 0">
          <span class="text-xs text-slate-500 font-medium">
            Menampilkan
            <strong>{{ (currentPage - 1) * getPerPageValue + 1 }}</strong>
            –
            <strong>{{ Math.min(currentPage * getPerPageValue, totalCount) }}</strong>
            dari <strong>{{ totalCount }}</strong> data
            · Halaman <strong>{{ currentPage }}</strong> / <strong>{{ totalPages }}</strong>
          </span>
          <UPagination
            :page="currentPage"
            :items-per-page="getPerPageValue"
            :total="totalCount"
            @update:page="(p) => { currentPage = p }"
          />
        </div>

    </div>

    <!-- ══ SELFIE MODAL ══════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="selfie-fade">
        <div
          v-if="selfieModal.open"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          @click.self="closeSelfie"
        >
          <div class="relative max-w-lg w-full mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <span class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ selfieModal.label }}</span>
              <button
                class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                @click="closeSelfie"
              >
                <span class="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <!-- Image -->
            <div class="flex items-center justify-center bg-slate-100 dark:bg-slate-800 p-2 min-h-[280px]">
              <img
                :src="selfieModal.url"
                :alt="selfieModal.label"
                class="max-h-[70vh] max-w-full rounded-lg object-contain shadow"
              />
            </div>
            <!-- Footer -->
            <div class="px-4 py-2 flex justify-end border-t border-slate-200 dark:border-slate-700">
              <a
                :href="selfieModal.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-primary underline hover:opacity-80"
              >Buka di tab baru</a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CalendarDate, type DateValue } from '@internationalized/date'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({
  title: 'Presensi UPTD - SHiFT Flow',
  description: 'Pantau presensi pegawai UPTD dari Dinas Pendidikan.',
})

// ── Loading State ─────────────────────────────────────────────────────
const isLoading = ref(false)

// ── Session User ─────────────────────────────────────────────────────
const user = useCookie<any>('user')

// ── Helper: today as CalendarDate ─────────────────────────────────────
const todayCalendar = () => {
  const now = new Date()
  return new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

// ── Filters & Select Options ─────────────────────────────────────────
const uptds = ref<any[]>([])
const selectedUptd = ref<any>(null)

// ── Search & Pagination State ────────────────────────────────────────
const searchQuery = ref('')
const currentPage = ref(1)

const perPageOptions = [
  { id: 10, label: '10' },
  { id: 25, label: '25' },
  { id: 50, label: '50' },
]
const perPageSelect = ref<any>(perPageOptions[0])

const getPerPageValue = computed(() => {
  if (typeof perPageSelect.value === 'object' && perPageSelect.value !== null) {
    return perPageSelect.value.id || 10
  }
  return Number(perPageSelect.value) || 10
})

// Columns for UTable
const columns = [
  { accessorKey: 'no',            header: 'No' },
  { accessorKey: 'pegawai',       header: 'Pegawai' },
  { accessorKey: 'nama_opd',      header: 'Unit Kerja' },
  { accessorKey: 'tgl_presensi',  header: 'Tanggal' },
  { accessorKey: 'waktu_masuk',   header: 'Masuk' },
  { accessorKey: 'selfie_masuk',  header: 'Selfie Masuk' },
  { accessorKey: 'waktu_pulang',  header: 'Pulang' },
  { accessorKey: 'selfie_pulang', header: 'Selfie Pulang' },
  { accessorKey: 'alasan',        header: 'Keterangan' },
  { accessorKey: 'bukti_surat',   header: 'Bukti' },
]

// ── Foto Selfie Modal ─────────────────────────────────────────────────
const selfieModal = ref({ open: false, url: '', label: '' })

const BASE_SELFIE = 'https://siap.tanjungpinangkota.go.id/resources/image_presensi'

const getSelfieUrl = (pin: string | null, filename: string | null) => {
  if (!pin || !filename) return null
  return `${BASE_SELFIE}/${pin}/${filename}`
}

const openSelfie = (url: string, label: string) => {
  selfieModal.value = { open: true, url, label }
}

const closeSelfie = () => {
  selfieModal.value = { open: false, url: '', label: '' }
}

// ── Calendar state (date range) ─────────────────────────────────────────
const dateRange = ref<any>({
  start: todayCalendar(),
  end:   todayCalendar(),
})

const dateStart = computed(() => {
  const s = dateRange.value.start
  return s ? `${s.year}-${String(s.month).padStart(2,'0')}-${String(s.day).padStart(2,'0')}` : ''
})
const dateEnd = computed(() => {
  const e = dateRange.value.end
  return e ? `${e.year}-${String(e.month).padStart(2,'0')}-${String(e.day).padStart(2,'0')}` : ''
})

const dateRangeLabel = computed(() => {
  const fmt = (d?: { year: number; month: number; day: number }) =>
    d ? format(new Date(`${d.year}-${String(d.month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`), 'd MMM yyyy', { locale: idLocale }) : '...'
  const s = dateRange.value.start
  const e = dateRange.value.end
  if (!s && !e) return 'Pilih periode'
  if (s && e && dateStart.value === dateEnd.value) return fmt(s)
  return `${fmt(s)} – ${fmt(e)}`
})

const uptdOptions = computed(() => uptds.value.map(u => ({ id: u.id_opd, label: u.nama_opd || u.nama_unit_opd || u.nama, ...u })))

// ── Presensi Harian Data (server-driven) ─────────────────────────────
const presensiList = ref<any[]>([])
const totalCount   = ref(0)
const totalPages   = ref(0)

const fetchPresensiHarian = async () => {
  if (!selectedUptd.value?.id) {
    presensiList.value = []
    totalCount.value = 0
    return
  }
  isLoading.value = true
  try {
    const res: any = await $fetch('/api/uptd/presensi-harian', {
      method: 'POST',
      body: {
        id_opd:  selectedUptd.value.id,
        page:    currentPage.value,
        limit:   getPerPageValue.value,
        name:    searchQuery.value.trim() || undefined,
        datemin: dateStart.value || undefined,
        datemax: dateEnd.value   || undefined,
      },
    })
    totalCount.value   = res.total_count  ?? 0
    totalPages.value   = res.total_pages  ?? Math.ceil((res.total_count ?? 0) / getPerPageValue.value)
    const offset       = (currentPage.value - 1) * getPerPageValue.value
    presensiList.value = (res.data ?? []).map((item: any, idx: number) => ({
      ...item,
      no:   offset + idx + 1,
      nama: item.nama_pegawai,
      nip:  item.nip,
    }))
  } catch (e) {
    console.error('Gagal mengambil presensi harian', e)
    presensiList.value = []
    totalCount.value   = 0
  } finally {
    isLoading.value = false
  }
}

// Reset page when page-size changes (still re-fetch)
watch(perPageSelect, () => {
  currentPage.value = 1
  fetchPresensiHarian()
})

// Page change triggers fetch
watch(currentPage, fetchPresensiHarian)

// Tombol Cari
const handleSearch = () => {
  currentPage.value = 1
  fetchPresensiHarian()
}

// Tombol Reset
const handleReset = () => {
  searchQuery.value  = ''
  dateRange.value    = { start: todayCalendar(), end: todayCalendar() }
  selectedUptd.value = null
  currentPage.value  = 1
  presensiList.value = []
  totalCount.value   = 0
  totalPages.value   = 0
}

// ── Data Fetching ─────────────────────────────────────────────────────
const fetchUptdList = async () => {
  try {
    const res: any = await $fetch(`/api/ref/uptd`)
    uptds.value = res.data || []
  } catch (e) { 
    console.error('Gagal mengambil daftar UPTD', e) 
  }
}

let isMounting = true

watch(selectedUptd, async (val) => {
  if (isMounting) return   // skip saat init mount
  currentPage.value = 1
  fetchPresensiHarian()
})


onMounted(async () => {
  // Set UPTD dari session langsung — tidak perlu tunggu list UPTD
  const userIdOpd = user.value?.id_opd
  if (userIdOpd) {
    // Set selectedUptd synthetic agar fetchPresensiHarian bisa jalan
    selectedUptd.value = {
      id:    userIdOpd,
      label: user.value?.nama_opd || user.value?.nama_unit_opd || '',
      ...user.value,
    }

    // Jalankan presensi & UPTD list secara parallel
    await Promise.all([
      fetchPresensiHarian(),
      fetchUptdList(),
    ])

    // Setelah UPTD list dimuat, update selectedUptd dengan data lengkap dari list
    const match = uptdOptions.value.find(u => String(u.id) === String(userIdOpd))
    if (match) selectedUptd.value = match
  } else {
    // Fallback: muat UPTD list saja jika tidak ada session id_opd
    await fetchUptdList()
  }

  isMounting = false  // aktifkan watcher setelah init selesai
})
</script>

<style>

/* Selfie modal transition */
.selfie-fade-enter-active,
.selfie-fade-leave-active {
  transition: opacity 0.2s ease;
}
.selfie-fade-enter-from,
.selfie-fade-leave-to {
  opacity: 0;
}
</style>

