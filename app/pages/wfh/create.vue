<script setup lang="ts">
import { format, parseISO, differenceInDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'Tambah Pegawai WFH', description: 'Tambah pegawai ke jadwal WFH.' })

const { fetchAllPegawai } = useSiapApi()
const user = useCookie<any>('user')
const router = useRouter()
const route = useRoute()

// ── State ──────────────────────────────────────────────────────────────────
const isSaving        = ref(false)
const errorMessage    = ref('')
const allEmployees    = ref<any[]>([])
const isLoadingEmployees = ref(false)
const searchTerm      = ref('')
const showDropdown    = ref(false)
const searchInputRef  = ref<HTMLInputElement | null>(null)
const selectedEmployees = ref<any[]>([])

// Jadwal (pre-filled from query param)
const jadwal          = ref<any>(null)
const isLoadingJadwal = ref(false)

// Already-registered employees for this jadwal
const registeredEmployees = ref<any[]>([])
const isLoadingRegistered = ref(false)
const removedPins = ref<Set<string>>(new Set())

// Registered Employees Pagination
const searchRegistered = ref('')
const pageRegistered = ref(1)
const perPageRegistered = ref(10)
const perPageOptions = [10, 25, 50, 100]

const registeredColumns = [
  { accessorKey: 'pegawai', header: 'Pegawai' },
  { accessorKey: 'nip', header: 'NIP' },
  { accessorKey: 'terdaftar', header: 'Terdaftar' },
  { accessorKey: 'actions', header: ' ' }
]

// ── Computed ───────────────────────────────────────────────────────────────
// Pins currently active (registered and not marked for removal)
const activeRegisteredPins = computed(() =>
  new Set(registeredEmployees.value.filter((e: any) => !removedPins.value.has(e.pin)).map((e: any) => e.pin))
)

const filteredRegisteredEmployees = computed(() => {
  let list = registeredEmployees.value
  if (searchRegistered.value.trim()) {
    const q = searchRegistered.value.toLowerCase()
    list = list.filter((e: any) => 
      e.nama?.toLowerCase().includes(q) || 
      e.pin?.toLowerCase().includes(q) || 
      e.nip?.toLowerCase().includes(q)
    )
  }
  return list
})

const paginatedRegisteredEmployees = computed(() => {
  const start = (pageRegistered.value - 1) * perPageRegistered.value
  return filteredRegisteredEmployees.value.slice(start, start + perPageRegistered.value)
})

watch(searchRegistered, () => { pageRegistered.value = 1 })

const filteredEmployees = computed(() => {
  // Exclude active-registered AND already-selected (allow removed ones to be re-added)
  const excludedPins = new Set([
    ...activeRegisteredPins.value,
    ...selectedEmployees.value.map((e: any) => e.pin),
  ])
  const pool = allEmployees.value.filter((e: any) => !excludedPins.has(e.pin))
  if (!searchTerm.value) return pool.slice(0, 40)
  const q = searchTerm.value.toLowerCase()
  return pool.filter((e: any) =>
    e.nama?.toLowerCase().includes(q) ||
    e.pin?.toLowerCase().includes(q) ||
    e.nip?.toLowerCase().includes(q)
  ).slice(0, 40)
})

const hasPendingChanges = computed(() =>
  selectedEmployees.value.length > 0 || removedPins.value.size > 0
)

const isLocked = computed(() => {
  if (!jadwal.value?.tanggal_mulai) return false
  const start = parseISO(jadwal.value.tanggal_mulai)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today >= start
})

const duration = computed(() => {
  if (!jadwal.value) return 0
  return differenceInDays(parseISO(jadwal.value.tanggal_selesai), parseISO(jadwal.value.tanggal_mulai)) + 1
})

const formattedEnd = computed(() => {
  try { return format(parseISO(jadwal.value.tanggal_selesai), 'dd MMM yyyy', { locale: idLocale }) }
  catch { return '-' }
})

// ── Methods ────────────────────────────────────────────────────────────────
const fetchJadwalById = async (id_wfh: string) => {
  isLoadingJadwal.value = true
  try {
    const res: any = await $fetch('/api/ref/jadwal-wfh')
    const all = res.data || []
    jadwal.value = all.find((j: any) => j.id_wfh === id_wfh) || null
  } catch (e) {
    console.error('Failed to fetch jadwal:', e)
  } finally {
    isLoadingJadwal.value = false
  }
}

const fetchRegisteredEmployees = async (id_wfh: string) => {
  isLoadingRegistered.value = true
  try {
    const res: any = await $fetch('/api/wfh/pegawai', { params: { id_wfh } })
    registeredEmployees.value = res.data || []
  } catch (e) {
    console.error('Failed to fetch registered employees:', e)
  } finally {
    isLoadingRegistered.value = false
  }
}

const fetchEmployees = async () => {
  if (!user.value?.id_opd) return
  isLoadingEmployees.value = true
  try {
    const res: any = await fetchAllPegawai({ id_opd: user.value.id_opd })
    const data = res.data || []
    allEmployees.value = data.sort((a: any, b: any) => a.nama.localeCompare(b.nama))
  } catch (e) {
    console.error('Failed to fetch employees:', e)
  } finally {
    isLoadingEmployees.value = false
  }
}

const selectEmployee = (emp: any) => {
  if (!selectedEmployees.value.find((e: any) => e.pin === emp.pin)) {
    selectedEmployees.value.push(emp)
  }
  searchTerm.value = ''
  nextTick(() => searchInputRef.value?.focus())
}

const removeEmployee = (pin: string) => {
  selectedEmployees.value = selectedEmployees.value.filter((e: any) => e.pin !== pin)
}

const removeRegistered = (pin: string) => {
  const next = new Set(removedPins.value)
  next.add(pin)
  removedPins.value = next
}

const restoreRegistered = (pin: string) => {
  const next = new Set(removedPins.value)
  next.delete(pin)
  removedPins.value = next
}

const handleBlur = () => setTimeout(() => { showDropdown.value = false }, 200)

const handleSubmit = async () => {
  if (!hasPendingChanges.value || !jadwal.value) return
  errorMessage.value = ''
  isSaving.value = true
  try {
    // Merge: keep registered that are NOT removed, plus all newly selected
    const keptRegisteredPins = registeredEmployees.value
      .filter((e: any) => !removedPins.value.has(e.pin))
      .map((e: any) => e.pin)
    const newPins = selectedEmployees.value.map((emp: any) => emp.pin)
    const finalPins = [...keptRegisteredPins, ...newPins]

    await $fetch('/api/wfh/create-pegawai', {
      method: 'POST',
      body: {
        id_wfh: jadwal.value.id_wfh,
        user_id: user.value?.user_id,
        id_opd: user.value?.id_opd,
        pins: finalPins,
      }
    })
    router.push('/wfh')
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Terjadi kesalahan saat menyimpan'
    console.error('Failed to save:', e)
  } finally {
    isSaving.value = false
  }
}

// Avatar colors
const avatarColors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']
const getAvatarColor = (name: string) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]

onMounted(async () => {
  const id_wfh = route.query.id_wfh as string
  await Promise.all([
    fetchEmployees(),
    id_wfh ? fetchJadwalById(id_wfh) : Promise.resolve(),
    id_wfh ? fetchRegisteredEmployees(id_wfh) : Promise.resolve(),
  ])
})
</script>

<template>
  <div class="min-h-[calc(100vh-100px)] flex flex-col px-6 pt-6 pb-10 gap-6">

    <!-- Top Bar -->
    <div class="flex items-center gap-3">
      <UButton to="/wfh" color="neutral" variant="ghost" icon="i-heroicons-arrow-left" size="sm" class="rounded-xl" />
      <div class="flex-1">
        <h1 class="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
          Tambah Pegawai WFH
        </h1>
        <p class="text-xs text-slate-400 font-medium mt-0.5">
          <span v-if="jadwal">
            {{ jadwal.nama_lokasi }} ·
            {{ format(parseISO(jadwal.tanggal_mulai), 'dd MMM yyyy', { locale: idLocale }) }}
            <span v-if="jadwal.tanggal_mulai !== jadwal.tanggal_selesai">
              – {{ format(parseISO(jadwal.tanggal_selesai), 'dd MMM yyyy', { locale: idLocale }) }}
            </span>
          </span>
          <span v-else>Memuat jadwal...</span>
        </p>
      </div>
      <!-- Jadwal info badge -->
      <div v-if="jadwal && !isLocked" class="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-2xl px-4 py-2">
        <span class="material-symbols-outlined text-base">timer</span>
        <span class="text-xs font-bold">{{ duration }} hari</span>
      </div>
      <div v-if="jadwal && isLocked" class="hidden sm:flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl px-4 py-2">
        <span class="material-symbols-outlined text-base">lock</span>
        <span class="text-xs font-bold">Terkunci (Maks H-1)</span>
      </div>
    </div>

    <!-- Expired banner -->
    <div v-if="isLocked" class="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl px-5 py-4">
      <div class="size-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-red-500 text-lg">lock</span>
      </div>
      <div>
        <p class="font-bold text-sm">Jadwal WFH Terkunci</p>
        <p class="text-xs opacity-70 mt-0.5">Penambahan atau penghapusan pegawai hanya dapat dilakukan maksimal H-1 sebelum tanggal mulai (<span v-if="jadwal">{{ format(parseISO(jadwal.tanggal_mulai), 'dd MMM yyyy', { locale: idLocale }) }}</span>).</p>
      </div>
    </div>

    <!-- ── ALREADY REGISTERED EMPLOYEES ────────────────────────────── -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="size-8 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
            <span class="material-symbols-outlined text-teal-600 text-lg">groups</span>
          </div>
          <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">Pegawai Terdaftar</span>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="removedPins.size > 0" class="text-[10px] font-black text-red-400 uppercase tracking-widest">
            {{ removedPins.size }} akan dihapus
          </span>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {{ isLoadingRegistered ? '...' : registeredEmployees.length + ' pegawai' }}
          </span>
        </div>
      </div>

      <!-- Loading registered -->
      <div v-if="isLoadingRegistered" class="py-8 flex flex-col items-center gap-2">
        <div class="size-6 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin"></div>
        <p class="text-xs text-slate-400">Memuat data...</p>
      </div>

      <!-- Empty registered -->
      <div v-else-if="registeredEmployees.length === 0" class="py-8 text-center">
        <span class="material-symbols-outlined text-3xl text-slate-300">person_off</span>
        <p class="text-xs text-slate-400 mt-2">Belum ada pegawai terdaftar pada jadwal ini</p>
      </div>

      <!-- Actions & Filters -->
      <div v-if="registeredEmployees.length > 0" class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <UInput
          v-model="searchRegistered"
          icon="i-heroicons-magnifying-glass"
          placeholder="Cari nama, PIN, atau NIP..."
          class="max-w-xs flex-1"
        />
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs text-slate-400 font-medium whitespace-nowrap">Tampilkan</span>
          <USelectMenu
            v-model="perPageRegistered"
            :items="perPageOptions"
            class="w-20"
            @update:model-value="() => { pageRegistered = 1 }"
          />
          <span class="text-xs text-slate-400 font-medium">data</span>
        </div>
      </div>

      <!-- Registered table -->
      <div v-if="registeredEmployees.length > 0" class="overflow-x-auto">
        <UTable 
          :columns="registeredColumns" 
          :data="paginatedRegisteredEmployees" 
          :loading="isLoadingRegistered"
          class="w-full"
        >
          <template #pegawai-cell="{ row }">
            <div class="flex items-center gap-2.5">
              <div
                class="size-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                :style="`background: ${getAvatarColor(row.original.nama || 'A')}`"
              >{{ row.original.nama?.charAt(0)?.toUpperCase() }}</div>
              <div>
                <p
                  class="font-semibold text-slate-800 dark:text-slate-200 leading-tight text-xs"
                  :class="{ 'line-through text-slate-400': removedPins.has(row.original.pin) }"
                >{{ row.original.nama }}</p>
                <p class="text-[10px] text-slate-400 font-mono">{{ row.original.pin }}</p>
              </div>
            </div>
          </template>
          <template #nip-cell="{ row }">
             <span class="text-[11px] text-slate-500 font-mono">{{ row.original.nip || '—' }}</span>
          </template>
          <template #terdaftar-cell="{ row }">
             <span class="text-[11px] text-slate-400">
               {{ row.original.created_on ? format(new Date(row.original.created_on), 'dd MMM yyyy HH:mm', { locale: idLocale }) : '—' }}
             </span>
          </template>
          <template #actions-cell="{ row }">
             <div class="text-right">
               <template v-if="!isLocked">
                  <button
                    v-if="!removedPins.has(row.original.pin)"
                    type="button"
                    class="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1 rounded-lg transition-colors"
                    @click="removeRegistered(row.original.pin)"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                    Hapus
                  </button>
                  <button
                    v-else
                    type="button"
                    class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2.5 py-1 rounded-lg transition-colors"
                    @click="restoreRegistered(row.original.pin)"
                  >
                    <span class="material-symbols-outlined text-sm">undo</span>
                    Batalkan
                  </button>
               </template>
             </div>
          </template>
        </UTable>
        <!-- Pagination -->
        <div class="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 dark:border-slate-800" v-if="filteredRegisteredEmployees.length > 0">
           <div class="flex items-center gap-3">
             <span class="text-sm text-slate-500">
                 Menampilkan {{ (pageRegistered - 1) * perPageRegistered + 1 }} – {{ Math.min(pageRegistered * perPageRegistered, filteredRegisteredEmployees.length) }} dari {{ filteredRegisteredEmployees.length }} pegawai
                 <template v-if="searchRegistered"> (difilter dari {{ registeredEmployees.length }})</template>
             </span>
           </div>
           <UPagination
               :page="pageRegistered"
               :items-per-page="perPageRegistered"
               :total="filteredRegisteredEmployees.length"
               @update:page="(p) => { pageRegistered = p }"
           />
        </div>
      </div>
    </div>

    <!-- ── ADD EMPLOYEE FORM ────────────────────────────────────────── -->
    <div v-if="!isLocked" class="grid grid-cols-1 lg:grid-cols-5 gap-6">

      <!-- LEFT: Employee Picker (3 cols) -->
      <div class="lg:col-span-3 flex flex-col gap-4">

        <!-- Search Card -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="size-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <span class="material-symbols-outlined text-indigo-600 text-lg">group_add</span>
                </div>
                <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">Tambah Pegawai</span>
              </div>
              <div v-if="selectedEmployees.length" class="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full px-3 py-1 text-xs font-bold">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                {{ selectedEmployees.length }} dipilih
              </div>
            </div>

            <!-- Search Input -->
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
              <input
                ref="searchInputRef"
                v-model="searchTerm"
                type="text"
                placeholder="Cari nama, PIN, atau NIP..."
                :disabled="isLoadingEmployees"
                class="w-full h-11 pl-11 pr-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
                @focus="showDropdown = true"
                @blur="handleBlur"
              />
              <div v-if="isLoadingEmployees" class="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div class="size-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>

          <!-- Employee List -->
          <div class="max-h-72 overflow-y-auto">
            <div v-if="isLoadingEmployees" class="py-10 text-center">
              <div class="size-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p class="text-xs text-slate-400">Memuat data pegawai...</p>
            </div>

            <div v-else-if="filteredEmployees.length === 0 && searchTerm" class="py-8 text-center px-6">
              <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">person_off</span>
              <p class="text-sm text-slate-400">Tidak ada pegawai untuk "<strong>{{ searchTerm }}</strong>"</p>
            </div>

            <div v-else-if="!searchTerm && !showDropdown" class="py-7 text-center px-6">
              <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">manage_search</span>
              <p class="text-sm text-slate-400 font-medium">Klik kolom pencarian</p>
              <p class="text-xs text-slate-300 mt-1">{{ allEmployees.length }} pegawai tersedia</p>
            </div>

            <div v-else>
              <div
                v-for="emp in filteredEmployees"
                :key="emp.pin"
                class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group border-b border-slate-50 dark:border-slate-800/60 last:border-0"
                @mousedown.prevent="selectEmployee(emp)"
              >
                <div
                  class="size-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  :style="`background: ${getAvatarColor(emp.nama || 'A')}`"
                >{{ emp.nama?.charAt(0)?.toUpperCase() }}</div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate leading-tight">{{ emp.nama }}</p>
                  <p class="text-[10px] text-slate-400 font-mono tracking-wide">{{ emp.pin }} · {{ emp.nip }}</p>
                </div>
                <div class="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="material-symbols-outlined text-indigo-500 text-base">add</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Employees chips -->
        <div v-if="selectedEmployees.length" class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Akan Ditambahkan</p>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="emp in selectedEmployees"
              :key="emp.pin"
              class="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-2xl pl-2 pr-2.5 py-1.5"
            >
              <div
                class="size-6 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                :style="`background: ${getAvatarColor(emp.nama || 'A')}`"
              >{{ emp.nama?.charAt(0)?.toUpperCase() }}</div>
              <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 max-w-[130px] truncate">{{ emp.nama }}</span>
              <button
                type="button"
                class="size-4 rounded-full flex items-center justify-center text-indigo-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                @click="removeEmployee(emp.pin)"
              >
                <span class="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Summary & Action (2 cols) -->
      <div class="lg:col-span-2 flex flex-col gap-4">

        <!-- Jadwal info card -->
        <div v-if="jadwal" class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <span class="material-symbols-outlined text-emerald-600 text-lg">event_available</span>
            </div>
            <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">Jadwal WFH</span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Lokasi</span>
              <span class="font-bold text-slate-700 dark:text-slate-300 text-right max-w-[160px]">{{ jadwal.nama_lokasi }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Mulai</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ format(parseISO(jadwal.tanggal_mulai), 'dd MMM yyyy', { locale: idLocale }) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Selesai</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ format(parseISO(jadwal.tanggal_selesai), 'dd MMM yyyy', { locale: idLocale }) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Durasi</span>
              <span class="font-bold text-emerald-600">{{ duration }} hari</span>
            </div>
          </div>
        </div>
        <div v-else-if="isLoadingJadwal" class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex items-center justify-center gap-2 py-10">
          <div class="size-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
          <p class="text-xs text-slate-400">Memuat jadwal...</p>
        </div>

        <!-- Submit card -->
        <div class="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 p-6 text-white">
          <p class="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-3">Ringkasan</p>

          <div class="space-y-2 mb-5">
            <div class="flex items-center justify-between text-sm">
              <span class="text-indigo-200">Terdaftar saat ini</span>
              <span class="font-extrabold">{{ registeredEmployees.length }} orang</span>
            </div>
            <div v-if="removedPins.size > 0" class="flex items-center justify-between text-sm">
              <span class="text-red-300">Akan dihapus</span>
              <span class="font-extrabold text-red-300">-{{ removedPins.size }} orang</span>
            </div>
            <div v-if="selectedEmployees.length > 0" class="flex items-center justify-between text-sm">
              <span class="text-emerald-300">Akan ditambahkan</span>
              <span class="font-extrabold text-emerald-300">+{{ selectedEmployees.length }} orang</span>
            </div>
            <div class="border-t border-indigo-500/40 pt-2 flex items-center justify-between text-sm">
              <span class="text-indigo-200 font-bold">Total akhir</span>
              <span class="font-extrabold">{{ registeredEmployees.length - removedPins.size + selectedEmployees.length }} orang</span>
            </div>
          </div>

          <!-- Validation hint -->
          <div class="space-y-1 mb-3">
            <p v-if="!jadwal" class="text-indigo-300 text-xs flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">info</span>
              Tidak ada jadwal dipilih
            </p>
            <p v-if="!hasPendingChanges" class="text-indigo-300 text-xs flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">info</span>
              Tidak ada perubahan
            </p>
          </div>

          <!-- Error -->
          <div v-if="errorMessage" class="bg-red-500/20 border border-red-400/40 rounded-2xl px-4 py-3 flex items-start gap-2 mb-3">
            <span class="material-symbols-outlined text-red-300 text-base shrink-0 mt-0.5">error</span>
            <p class="text-red-200 text-xs leading-relaxed">{{ errorMessage }}</p>
          </div>

          <div class="flex flex-col gap-2">
            <button
              type="button"
              :disabled="!hasPendingChanges || !jadwal || isSaving"
              class="w-full h-12 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              :class="hasPendingChanges && jadwal ? 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg' : 'bg-white/20 text-white/60'"
              @click="handleSubmit"
            >
              <span v-if="isSaving" class="size-4 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined text-lg">check_circle</span>
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>

            <UButton
              to="/wfh"
              color="neutral"
              variant="ghost"
              label="Kembali"
              class="w-full h-10 rounded-2xl font-bold text-indigo-200 hover:text-white hover:bg-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
