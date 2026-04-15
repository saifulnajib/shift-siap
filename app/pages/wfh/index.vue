<script setup lang="ts">
import { format, parseISO, differenceInDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({
  title: 'SHiFT Flow - WFH Management',
  description: 'Kelola jadwal kerja dari rumah pegawai.',
})

const { fetchJadwalWfh } = useSiapApi()

// State
const jadwalList = ref<any[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const loadJadwal = async () => {
  isLoading.value = true
  try {
    const res: any = await fetchJadwalWfh()
    jadwalList.value = res.data || []
  } catch (e) {
    console.error('Failed to fetch jadwal:', e)
  } finally {
    isLoading.value = false
  }
}

const filteredJadwal = computed(() => {
  if (!searchQuery.value) return jadwalList.value
  const q = searchQuery.value.toLowerCase()
  return jadwalList.value.filter(j =>
    j.nama_lokasi?.toLowerCase().includes(q) ||
    j.tanggal_mulai?.includes(q)
  )
})

const getStatusBadge = (jadwal: any) => {
  const now = new Date()
  const start = parseISO(jadwal.tanggal_mulai)
  const end = parseISO(jadwal.tanggal_selesai)
  if (now < start) return { label: 'Terjadwal', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  if (now > end)   return { label: 'Berakhir',   cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' }
  return { label: 'Aktif', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
}

const isJadwalExpired = (jadwal: any) => {
  if (!jadwal?.tanggal_selesai) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parseISO(jadwal.tanggal_selesai) < today
}

const getDuration = (jadwal: any) => {
  if (!jadwal?.tanggal_mulai || !jadwal?.tanggal_selesai) return 0
  return differenceInDays(parseISO(jadwal.tanggal_selesai), parseISO(jadwal.tanggal_mulai)) + 1
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy', { locale: idLocale })
  } catch {
    return '-'
  }
}

const activeCount   = computed(() => jadwalList.value.filter(j => getStatusBadge(j).label === 'Aktif').length)
const scheduledCount = computed(() => jadwalList.value.filter(j => getStatusBadge(j).label === 'Terjadwal').length)

onMounted(loadJadwal)
</script>

<template>
  <div class="min-h-[calc(100vh-100px)] flex flex-col gap-6 px-6 pt-6 pb-10">

    <!-- Header -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Manajemen WFH</h1>
          <p class="text-sm text-slate-500 font-medium mt-1">Daftar jadwal kerja dari rumah yang ditetapkan.</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div class="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-2xl text-blue-500">calendar_month</span>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Jadwal</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight mt-0.5">{{ jadwalList.length }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div class="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-2xl text-emerald-500">bolt</span>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktif Sekarang</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight mt-0.5">{{ activeCount }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div class="size-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-2xl text-amber-500">schedule</span>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terjadwal</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight mt-0.5">{{ scheduledCount }}</p>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">

      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div class="relative flex-1 min-w-[220px] max-w-sm">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari lokasi atau tanggal..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-white transition-all"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <div class="size-8 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
        <p class="text-sm text-slate-400">Memuat jadwal WFH...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredJadwal.length === 0" class="flex-1 flex flex-col items-center justify-center py-20 opacity-60">
        <div class="size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl text-slate-400">event_busy</span>
        </div>
        <p class="text-slate-400 font-bold mt-4">Tidak ada jadwal WFH ditemukan</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800">
              <th class="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasi</th>
              <th class="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode</th>
              <th class="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th class="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan</th>
              <th class="text-center px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pegawai</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="jadwal in filteredJadwal"
              :key="jadwal.id_wfh"
              class="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- Lokasi -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                    <span class="material-symbols-outlined text-white text-lg">location_on</span>
                  </div>
                  <div>
                    <p class="font-bold text-slate-800 dark:text-slate-200 leading-tight">{{ jadwal.nama_lokasi }}</p>
                  </div>
                </div>
              </td>

              <!-- Periode -->
              <td class="px-5 py-4">
                <div class="flex flex-col gap-0.5">
                  <p class="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    {{ formatDate(jadwal.tanggal_mulai) }}
                  </p>
                  <p v-if="jadwal.tanggal_mulai !== jadwal.tanggal_selesai" class="text-[11px] text-slate-400 flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">arrow_forward</span>
                    {{ formatDate(jadwal.tanggal_selesai) }}
                    <span class="ml-1 opacity-70">({{ getDuration(jadwal) }} hari)</span>
                  </p>
                  <p v-else class="text-[11px] text-slate-400">1 hari</p>
                </div>
              </td>

              <!-- Status -->
              <td class="px-5 py-4">
                <span
                  class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap"
                  :class="getStatusBadge(jadwal).cls"
                >
                  {{ getStatusBadge(jadwal).label }}
                </span>
              </td>

              <!-- Keterangan -->
              <td class="px-5 py-4">
                <span class="text-xs text-slate-400 italic">{{ jadwal.keterangan || '—' }}</span>
              </td>

              <!-- Total Pegawai -->
              <td class="px-5 py-4 text-center">
                <div class="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                  <span class="material-symbols-outlined text-[14px]">group</span>
                  <span class="text-xs font-bold">{{ jadwal.total_pegawai || '0' }}</span>
                </div>
              </td>

              <!-- Aksi -->
              <td class="px-5 py-4 text-right">
                <NuxtLink
                  :to="`/wfh/create?id_wfh=${jadwal.id_wfh}`"
                  class="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                  :class="isJadwalExpired(jadwal)
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-indigo-900/30'"
                >
                  <span class="material-symbols-outlined text-sm">{{ isJadwalExpired(jadwal) ? 'groups' : 'group_add' }}</span>
                  {{ isJadwalExpired(jadwal) ? 'Lihat Pegawai' : 'Tambah Pegawai' }}
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.dark ::-webkit-scrollbar-thumb { background: #1e293b; }
</style>
