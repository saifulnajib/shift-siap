<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

useSeoMeta({
  title: 'SHiFT Flow - Detail Group Jadwal',
  description: 'Detail jadwal masuk dan pulang per hari.',
  ogTitle: 'SHiFT Flow - Detail Group Jadwal',
  ogDescription: 'Detail jadwal masuk dan pulang per hari.',
  twitterCard: 'summary_large_image',
})

const route = useRoute()
const { groups, fetchGroups, getGroupById } = useShifts()
const toast = useToast()
const user = useCookie('user')

const groupId = computed(() => String(route.params.id || ''))

const { data: detailRes, pending: isLoading, error } = await useFetch(`/api/shifts/detail-jadwal/${String(route.params.id || '')}`)

const jadwalList = ref<any[]>([])
watch(() => detailRes.value?.data, (v) => { jadwalList.value = v || [] }, { immediate: true })
const loadError = computed(() => error.value?.data?.message || error.value?.message || '')

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const group = computed(() => getGroupById(groupId.value))

const isRegulerJadwal = (j: any) => {
  const name = (j.nama_jadwal || '').toLowerCase()
  if (name.includes('reguler')) return true
  return dayNames.some(d => name.includes(d.toLowerCase()))
}

const shiftNames = computed(() => {
  const seen: string[] = []
  const sorted = [...jadwalList.value].sort((a, b) => {
    const sortKey = (j: any) => {
      if (isRegulerJadwal(j)) return 99
      const k = Number(j.kelompok_waktu)
      return Number.isFinite(k) ? k : 98
    }
    return sortKey(a) - sortKey(b)
  })
  sorted.forEach(j => {
    const label = isRegulerJadwal(j) ? 'Reguler' : j.nama_jadwal
    if (!seen.includes(label)) seen.push(label)
  })
  return seen
})

const getCell = (shiftName: string, dayIndex: number) => {
  return jadwalList.value.find(j => {
    const label = isRegulerJadwal(j) ? 'Reguler' : j.nama_jadwal
    return label === shiftName && Number(j.id_hari) === dayIndex
  })
}

const colorFor = (warna: string) => {
  if (!warna) return '#94a3b8'
  if (warna.startsWith('#')) return warna
  const map: Record<string, string> = {
    green: '#22c55e',
    blue: '#3b82f6',
    red: '#ef4444',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#8b5cf6',
  }
  return map[warna.toLowerCase()] || '#94a3b8'
}

const formatTime = (t: string) => (t || '').slice(0, 5)

const toTimeInput = (t: string) => {
  const s = (t || '').slice(0, 8)
  return s.length === 5 ? s + ':00' : s
}

const totalJadwal = computed(() => jadwalList.value.length)
const shiftCount = computed(() => shiftNames.value.length)

const editOpen = ref(false)
const editing = reactive({
  id_jadwal: '',
  nama_jadwal: '',
  hari: '',
  jam_masuk: '',
  jam_pulang: '',
})

const openEdit = (jadwal: any) => {
  editing.id_jadwal = String(jadwal.id_jadwal || '')
  editing.nama_jadwal = jadwal.nama_jadwal || ''
  editing.hari = jadwal.hari || dayNames[Number(jadwal.id_hari)] || ''
  editing.jam_masuk = toTimeInput(jadwal.jam_masuk)
  editing.jam_pulang = toTimeInput(jadwal.jam_pulang)
  editOpen.value = true
}

const saveLoading = ref(false)

const saveEdit = async () => {
  saveLoading.value = true
  try {
    const res: any = await $fetch('/api/shifts/update-jadwal', {
      method: 'POST',
      body: {
        id_jadwal: editing.id_jadwal,
        jam_masuk: editing.jam_masuk,
        jam_pulang: editing.jam_pulang,
        user_id: user.value?.user_id,
      },
    })

    const ok = res?.success === true || res?.success === undefined || res?.message === 'success' || res?.message === undefined
    if (!ok) {
      throw new Error(res?.message || 'Gagal menyimpan perubahan')
    }

    const target = jadwalList.value.find(j => String(j.id_jadwal) === editing.id_jadwal)
    if (target) {
      target.jam_masuk = editing.jam_masuk
      target.jam_pulang = editing.jam_pulang
    }
    editOpen.value = false
    toast.add({ title: res?.message || 'Jadwal diperbarui', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Gagal menyimpan', description: e?.data?.message || e?.message || 'Terjadi kesalahan', color: 'error' })
  } finally {
    saveLoading.value = false
  }
}

onMounted(fetchGroups)
</script>

<template>
  <div class="min-h-[calc(100vh-100px)] flex flex-col px-6 pt-6 pb-10 gap-6">

    <!-- Top Bar -->
    <div class="flex items-center gap-3">
      <UButton to="/shifts" color="neutral" variant="ghost" icon="i-heroicons-arrow-left" size="sm" class="rounded-xl" />
      <div class="flex-1">
        <h1 class="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">Detail Group Jadwal</h1>
        <p class="text-xs text-slate-400 font-medium mt-0.5">{{ group?.name || 'Memuat group jadwal...' }}</p>
      </div>
      <UButton
        :to="`/shifts/form?id=${groupId}`"
        icon="i-heroicons-pencil-square"
        color="neutral"
        variant="outline"
        size="sm"
        class="rounded-xl"
      >
        Edit
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center py-24 gap-3">
      <div class="size-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-sm text-slate-400">Memuat detail jadwal...</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="flex-1 flex flex-col items-center justify-center py-24 gap-3">
      <div class="size-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <span class="material-symbols-outlined text-4xl text-red-400">cloud_off</span>
      </div>
      <p class="text-slate-400 font-bold mt-2">Gagal memuat detail jadwal</p>
      <p class="text-xs text-slate-400 max-w-md text-center">{{ loadError }}</p>
    </div>

    <template v-else>
      <!-- Info card -->
      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="size-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0" :style="{ backgroundColor: (group?.color || '#3b82f6') + '22' }">
            <span class="material-symbols-outlined text-3xl" :style="{ color: group?.color || '#3b82f6' }">schedule</span>
          </div>
          <div class="flex-1 min-w-[200px]">
            <div class="flex items-center gap-2">
              <span class="size-3.5 rounded-full shrink-0" :style="{ backgroundColor: group?.color || '#3b82f6' }"></span>
              <h2 class="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">{{ group?.name || '—' }}</h2>
              <span
                class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap"
                :class="group?.is_shift
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'"
              >
                {{ group?.is_shift ? 'Shift' : 'Reguler' }}
              </span>
            </div>
            <p class="text-sm text-slate-500 font-medium mt-1">{{ group?.keterangan || 'Tanpa keterangan' }}</p>
          </div>
          <div class="flex items-center gap-6 shrink-0">
            <div class="text-center">
              <p class="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{{ totalJadwal }}</p>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Jadwal</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{{ shiftCount }}</p>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Shift</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Jadwal matrix -->
      <div class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <div class="size-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <span class="material-symbols-outlined text-indigo-600 text-lg">calendar_view_week</span>
          </div>
          <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">Jadwal Masuk / Pulang</span>
          <span class="ml-auto text-[11px] text-slate-400 font-medium hidden sm:block">Klik nama jam jadwal untuk mengubah</span>
        </div>

        <div v-if="jadwalList.length === 0" class="flex flex-col items-center justify-center py-20 opacity-60">
          <div class="size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <span class="material-symbols-outlined text-4xl text-slate-400">event_busy</span>
          </div>
          <p class="text-slate-400 font-bold mt-4">Tidak ada jadwal pada group ini</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <th class="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Hari</th>
                <th
                  v-for="name in shiftNames"
                  :key="name"
                  class="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                >
                  {{ name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(day, dayIndex) in dayNames"
                :key="day"
                class="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td class="px-6 py-4">
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ day }}</span>
                </td>
                <td v-for="name in shiftNames" :key="name" class="px-6 py-4">
                  <template v-if="getCell(name, dayIndex)">
                    <button
                      type="button"
                      title="Klik untuk ubah jam"
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap hover:ring-2 hover:ring-indigo-400/60 transition-all cursor-pointer"
                      :style="{ backgroundColor: colorFor(getCell(name, dayIndex).warna) + '1A' }"
                      @click="openEdit(getCell(name, dayIndex))"
                    >
                      <span class="size-2.5 rounded-full shrink-0" :style="{ backgroundColor: colorFor(getCell(name, dayIndex).warna) }"></span>
                      <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {{ formatTime(getCell(name, dayIndex).jam_masuk) }} – {{ formatTime(getCell(name, dayIndex).jam_pulang) }}
                      </span>
                      <span class="material-symbols-outlined text-[13px] text-slate-400">edit</span>
                    </button>
                  </template>
                  <span v-else class="text-xs text-slate-300 dark:text-slate-600">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <UModal v-model:open="editOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-bold">Edit Jam Jadwal</h3>
          </template>

          <div v-if="editing.nama_jadwal" class="mb-4 flex items-center gap-2 text-sm">
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">{{ editing.nama_jadwal }}</span>
            <span class="text-slate-500 dark:text-slate-400">{{ editing.hari }}</span>
            <span class="ml-auto text-[10px] font-mono text-slate-400">ID: {{ editing.id_jadwal }}</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Masuk</label>
              <input
                v-model="editing.jam_masuk"
                type="time"
                step="1"
                class="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Pulang</label>
              <input
                v-model="editing.jam_pulang"
                type="time"
                step="1"
                class="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
              />
            </div>
          </div>

          <p class="text-[11px] text-slate-400 mt-3">Perubahan langsung disimpan ke SIAP.</p>

          <div class="flex justify-end gap-2 mt-5">
            <UButton color="neutral" variant="ghost" :disabled="saveLoading" @click="editOpen = false">Batal</UButton>
            <UButton color="primary" :loading="saveLoading" @click="saveEdit">Simpan</UButton>
          </div>
        </UCard>
      </template>
    </UModal>
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
