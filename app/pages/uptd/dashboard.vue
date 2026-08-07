<template>
  <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-display overflow-hidden">

    <!-- ══ FILTER BAR ══════════════════════════════════════════════════════ -->
    <section class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-end gap-4 shrink-0">
      
      <!-- UPTD Selector -->
      <div class="flex flex-col gap-1 min-w-[240px]">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih UPTD</label>
        <USelectMenu
          v-model="selectedUptd"
          :items="uptdOptions"
          placeholder="Pilih UPTD..."
          class="w-full"
          searchable
          searchable-placeholder="Cari UPTD..."
        />
      </div>

      <!-- Tanggal Picker (Single Date) -->
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</label>
        <UPopover :content="{ align: 'start' }">
          <UButton color="neutral" variant="outline" icon="i-heroicons-calendar-days" class="justify-start font-normal min-w-[200px]">
            {{ dateLabel }}
          </UButton>
          <template #content>
            <UCalendar v-model="selectedDate" class="p-2" />
          </template>
        </UPopover>
      </div>

      <div class="flex items-center gap-2 pb-0.5">
        <UButton icon="i-heroicons-arrow-path" color="primary" :loading="isLoading" @click="fetchDashboard">
          Tampilkan
        </UButton>
        <UButton icon="i-heroicons-x-circle" color="neutral" variant="outline" :disabled="isLoading" @click="handleReset">
          Reset
        </UButton>
      </div>

      <div v-if="lastFetched" class="ml-auto flex flex-col items-end justify-end pb-0.5">
        <span class="text-[10px] text-slate-400 font-medium">Update terakhir</span>
        <span class="text-xs text-slate-600 font-bold dark:text-slate-300">{{ lastFetched }}</span>
      </div>
    </section>

    <!-- ══ MAIN CONTENT ════════════════════════════════════════════════════ -->
    <div class="flex-1 overflow-y-auto scrollbar-thin p-6">

      <!-- Header -->
      <header class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">
              Dashboard Presensi UPTD
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ isSemuaUptd ? (user?.nama_opd || user?.nama_unit_opd || 'Semua UPTD') : selectedUptd?.label }} &middot; {{ dateLabel }}
            </p>
          </div>
          <UBadge color="primary" variant="subtle" size="md" class="gap-1.5">
            <span class="material-symbols-outlined text-sm">domain</span>
            {{ stats.total_opd }} Unit UPTD
          </UBadge>
        </div>
      </header>

      <!-- EMPTY & LOADING STATES -->
      <div v-if="isLoading && !hasData" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p class="text-sm font-medium text-slate-500">Memuat data dashboard...</p>
      </div>
      
      <div v-else-if="!hasData" class="flex flex-col items-center justify-center py-20">
        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-4xl text-slate-400">dashboard</span>
        </div>
        <p class="text-sm font-medium text-slate-500">Pilih UPTD dan klik Tampilkan untuk melihat data.</p>
      </div>

      <!-- DASHBOARD WIDGETS -->
      <div v-else class="space-y-6">

        <!-- ── 1. STAT CARDS ── -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Total Pegawai -->
          <div class="stat-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">groups</span>
            </div>
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pegawai</p>
              <p class="text-2xl font-black text-slate-800 dark:text-white leading-none mt-1">{{ stats.total_pegawai.toLocaleString() }}</p>
            </div>
          </div>
          
          <!-- Persentase Kehadiran -->
          <div class="stat-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">pie_chart</span>
            </div>
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tingkat Kehadiran</p>
              <div class="flex items-end gap-1 mt-1">
                <p class="text-2xl font-black text-slate-800 dark:text-white leading-none">{{ stats.pct_hadir }}<span class="text-sm">%</span></p>
              </div>
            </div>
          </div>

          <!-- Total Hadir -->
          <div class="stat-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hadir</p>
              </div>
              <span class="material-symbols-outlined text-emerald-500/50">how_to_reg</span>
            </div>
            <p class="text-2xl font-black text-slate-800 dark:text-white leading-none">{{ stats.total_hadir.toLocaleString() }}</p>
            <!-- Progress bar -->
            <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${stats.total_pegawai > 0 ? (stats.total_hadir / stats.total_pegawai * 100) : 0}%` }"></div>
            </div>
          </div>

          <!-- Total Belum Hadir -->
          <div class="stat-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-rose-500"></div>
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Belum Hadir</p>
              </div>
              <span class="material-symbols-outlined text-rose-500/50">person_off</span>
            </div>
            <p class="text-2xl font-black text-slate-800 dark:text-white leading-none">{{ stats.total_belum_hadir.toLocaleString() }}</p>
            <!-- Progress bar -->
            <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div class="h-full bg-rose-500 rounded-full" :style="{ width: `${stats.total_pegawai > 0 ? (stats.total_belum_hadir / stats.total_pegawai * 100) : 0}%` }"></div>
            </div>
          </div>
        </div>

        <!-- ── 2. CHARTS & REKAP ── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Top 10 UPTD Bar Chart -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col h-[400px]">
            <div class="flex items-center justify-between mb-6 shrink-0">
              <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-xl">bar_chart</span>
                Top 10 Kehadiran UPTD
              </h3>
            </div>
            
            <div class="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              <div v-if="opdChart.length === 0" class="h-full flex items-center justify-center text-sm text-slate-400 font-medium">
                Belum ada data UPTD
              </div>
              <div v-else class="space-y-4">
                <div v-for="(opd, idx) in opdChart" :key="idx" class="group">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]" :title="opd.nama_opd">
                      {{ opd.nama_opd }}
                    </span>
                    <span class="font-medium" :class="opd.pct >= 80 ? 'text-emerald-600' : (opd.pct >= 60 ? 'text-amber-600' : 'text-rose-600')">
                      {{ opd.pct }}% ({{ opd.total }}/{{ opd.max }})
                    </span>
                  </div>
                  <!-- Track -->
                  <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="getOpdBarColor(opd.pct)"
                      :style="{ width: `${opd.pct}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabel Rekap Keseluruhan -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col h-[400px] overflow-hidden">
            <div class="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-xl">table_rows</span>
                Rekapitulasi Semua UPTD
              </h3>
            </div>
            <div class="flex-1 overflow-auto scrollbar-thin">
              <table class="w-full text-left text-sm border-collapse">
                <thead class="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 shadow-sm">
                  <tr>
                    <th class="py-2.5 px-4 font-bold text-slate-500 text-xs uppercase">Nama UPTD</th>
                    <th class="py-2.5 px-4 font-bold text-slate-500 text-xs uppercase text-center">Pegawai</th>
                    <th class="py-2.5 px-4 font-bold text-slate-500 text-xs uppercase text-center">Hadir</th>
                    <th class="py-2.5 px-4 font-bold text-slate-500 text-xs uppercase text-center">Belum</th>
                    <th class="py-2.5 px-4 font-bold text-slate-500 text-xs uppercase text-right">%</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr v-for="(opd, i) in rekapAll" :key="i" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-2 px-4">
                      <span class="font-semibold text-slate-700 dark:text-slate-200 text-xs">{{ opd.nama_opd }}</span>
                    </td>
                    <td class="py-2 px-4 text-center text-slate-600 dark:text-slate-400 font-mono text-xs">{{ opd.total_pegawai }}</td>
                    <td class="py-2 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">{{ opd.total_hadir }}</td>
                    <td class="py-2 px-4 text-center font-bold text-rose-600 dark:text-rose-400 font-mono text-xs">{{ opd.belum_hadir }}</td>
                    <td class="py-2 px-4 text-right">
                      <UBadge :color="opd.persentase >= 80 ? 'success' : (opd.persentase >= 60 ? 'warning' : 'error')" variant="subtle" size="xs">
                        {{ opd.persentase }}%
                      </UBadge>
                    </td>
                  </tr>
                  <tr v-if="rekapAll.length === 0">
                    <td colspan="5" class="py-8 text-center text-slate-400 text-xs">Belum ada data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parse } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({
  title: 'Dashboard UPTD - SHiFT Flow',
  description: 'Ringkasan presensi harian UPTD',
})

// ── Session User ───────────────────────────────────────────────────────
const user = useCookie<any>('user')

// ── UPTD Options ───────────────────────────────────────────────────────
const SEMUA_UPTD_ID = '__SEMUA__'
const semuaUptdOption = computed(() => ({
  id:    SEMUA_UPTD_ID,
  label: 'Semua UPTD',
  _isAll: true,
}))

const uptds        = ref<any[]>([])
const selectedUptd = ref<any>(null)
const uptdOptions  = computed(() => [
  semuaUptdOption.value,
  ...uptds.value.map(u => ({ id: u.id_opd, label: u.nama_opd || u.nama_unit_opd || u.nama, ...u })),
])
const isSemuaUptd = computed(() => selectedUptd.value?.id === SEMUA_UPTD_ID || selectedUptd.value?._isAll)

// ── Date Picker ────────────────────────────────────────────────────────
const df = new DateFormatter('id-ID', { dateStyle: 'medium' })
const todayCalendar = () => {
  const now = new Date()
  return new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

const selectedDate = ref<CalendarDate>(todayCalendar())

const fmtDate = (d: CalendarDate | null) =>
  d ? `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` : ''

const dateLabel = computed(() => {
  return selectedDate.value ? df.format(selectedDate.value.toDate(getLocalTimeZone())) : 'Pilih Tanggal'
})

// ── Loading & State ────────────────────────────────────────────────────
const isLoading   = ref(false)
const hasData     = ref(false)
const lastFetched = ref('')

// ── Dashboard Data ─────────────────────────────────────────────────────
const stats = ref({
  total_pegawai: 0, total_hadir: 0, total_belum_hadir: 0, pct_hadir: 0, total_opd: 0
})
const opdChart = ref<any[]>([])
const rekapAll = ref<any[]>([])

// ── Helpers ────────────────────────────────────────────────────────────
const getOpdBarColor = (pct: number) =>
  pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-rose-500'

// ── Fetching ───────────────────────────────────────────────────────────
const fetchDashboard = async () => {
  if (!selectedUptd.value?.id) return

  // Jika "Semua UPTD" dipilih → gunakan id_opd induk dari sesi aktif
  const targetIdOpd = isSemuaUptd.value
    ? user.value?.id_opd
    : selectedUptd.value.id

  if (!targetIdOpd) return

  isLoading.value = true
  hasData.value   = false
  try {
    const res: any = await $fetch('/api/uptd/dashboard-stats', {
      method: 'POST',
      body: {
        id_opd:  targetIdOpd,
        tanggal: fmtDate(selectedDate.value)
      },
    })
    
    stats.value     = res.stats     ?? stats.value
    opdChart.value  = res.opd_chart ?? []
    rekapAll.value  = res.rekap_all ?? []
    
    hasData.value     = true
    lastFetched.value = format(new Date(), 'HH:mm:ss', { locale: idLocale })
  } catch (e) {
    console.error('Gagal mengambil dashboard stats', e)
  } finally {
    isLoading.value = false
  }
}

const handleReset = () => {
  selectedUptd.value = semuaUptdOption.value
  selectedDate.value = todayCalendar()
  hasData.value      = false
  lastFetched.value  = ''
  stats.value        = { total_pegawai: 0, total_hadir: 0, total_belum_hadir: 0, pct_hadir: 0, total_opd: 0 }
  opdChart.value     = []
  rekapAll.value     = []
}

const fetchUptdList = async () => {
  try {
    const res: any = await $fetch('/api/ref/uptd')
    uptds.value = res.data || []
  } catch (e) {
    console.error('Gagal mengambil daftar UPTD', e)
  }
}

// ── Init ───────────────────────────────────────────────────────────────
onMounted(async () => {
  selectedUptd.value = semuaUptdOption.value
  await Promise.all([
    fetchUptdList(),
    fetchDashboard(),
  ])
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -4px rgb(0 0 0 / 0.1);
}
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
.scrollbar-thin::-webkit-scrollbar { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 2px; }
</style>
