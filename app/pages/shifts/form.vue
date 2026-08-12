<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

useSeoMeta({
  title: 'SHiFT Flow - Form Shift',
  description: 'Tambah atau ubah group jadwal kerja.',
  ogTitle: 'SHiFT Flow - Form Shift',
  ogDescription: 'Tambah atau ubah group jadwal kerja.',
  twitterCard: 'summary_large_image',
})

const route = useRoute()
const router = useRouter()
const { getGroupById, saveGroup, fetchGroups } = useShifts()

const isEdit = computed(() => !!route.query.id)

const form = reactive({
  id: undefined as string | undefined,
  name: '',
  is_shift: true,
  start_time: '',
  end_time: '',
  keterangan: '',
  batas_masuk: 60,
  batas_pulang: 60,
  color: '#3b82f6'
})

const toMinutes = (time: string) => {
  const [h, m] = (time || '00:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

const durationPreview = computed(() => {
  if (!form.start_time || !form.end_time) return '-'
  let diff = toMinutes(form.end_time) - toMinutes(form.start_time)
  if (diff < 0) diff += 24 * 60
  if (diff === 0) return '-'
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m ? `${h} jam ${m} mnt` : `${h} jam`
})

const randomColor = () => {
  form.color = ['#3b82f6', '#f97316', '#6366f1', '#14b8a6', '#ef4444', '#10b981'][Math.floor(Math.random() * 6)]
}

onMounted(async () => {
  const id = String(route.query.id || '')
  if (id) {
    await fetchGroups()
    const group = getGroupById(id)
    if (group) {
      form.id = group.id
      form.name = group.name
      form.is_shift = !!group.is_shift
      form.start_time = group.start_time
      form.end_time = group.end_time
      form.keterangan = group.keterangan || ''
      form.batas_masuk = Number(group.batas_masuk) || 60
      form.batas_pulang = Number(group.batas_pulang) || 60
      form.color = group.color || '#3b82f6'
    }
  }
})

const handleSubmit = () => {
  if (!form.name || !form.start_time || !form.end_time) return
  saveGroup({ ...form })
  router.push('/shifts')
}
</script>

<template>
  <div class="min-h-[calc(100vh-100px)] flex flex-col px-6 pt-6 pb-10 gap-6">

    <!-- Top Bar -->
    <div class="flex items-center gap-3">
      <UButton to="/shifts" color="neutral" variant="ghost" icon="i-heroicons-arrow-left" size="sm" class="rounded-xl" />
      <div class="flex-1">
        <h1 class="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
          {{ isEdit ? 'Edit Shift' : 'Tambah Shift' }}
        </h1>
        <p class="text-xs text-slate-400 font-medium mt-0.5">
          {{ isEdit ? 'Ubah detail group jadwal yang sudah ada.' : 'Buat group jadwal kerja baru.' }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

      <!-- LEFT: Form (3 cols) -->
      <div class="lg:col-span-3 flex flex-col gap-4">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <div class="size-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <span class="material-symbols-outlined text-indigo-600 text-lg">schedule</span>
            </div>
            <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">Detail Group Jadwal</span>
          </div>

          <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Group</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Contoh: RSUD SHIFT (LABOR, RADIOLOGI)"
                required
                class="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Jadwal</label>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 h-11 rounded-xl text-sm font-bold transition-all border"
                  :class="form.is_shift
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'"
                  @click="form.is_shift = true"
                >
                  Shift Bergilir
                </button>
                <button
                  type="button"
                  class="flex-1 h-11 rounded-xl text-sm font-bold transition-all border"
                  :class="!form.is_shift
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'"
                  @click="form.is_shift = false"
                >
                  Reguler
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Masuk</label>
                <input
                  v-model="form.start_time"
                  type="time"
                  required
                  class="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Pulang</label>
                <input
                  v-model="form.end_time"
                  type="time"
                  required
                  class="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan</label>
              <input
                v-model="form.keterangan"
                type="text"
                placeholder="Contoh: LABOR, RADIOLOGI"
                class="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Batas Masuk (menit)</label>
                <input
                  v-model.number="form.batas_masuk"
                  type="number"
                  min="0"
                  class="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Batas Pulang (menit)</label>
                <input
                  v-model.number="form.batas_pulang"
                  type="number"
                  min="0"
                  class="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Warna Label</label>
              <div class="flex gap-3">
                <input type="color" v-model="form.color" class="h-11 w-14 p-1 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800" />
                <input
                  v-model="form.color"
                  type="text"
                  class="flex-1 h-11 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-white font-mono border border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  class="h-11 px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-200 dark:border-slate-700 transition-colors"
                  @click="randomColor"
                >
                  Acak
                </button>
              </div>
            </div>

            <p class="text-[11px] text-slate-400 pt-1">
              {{ isEdit ? 'Perubahan akan tercatat pada daftar group jadwal.' : 'Data disimpan sementara, siap dihubungkan ke API.' }}
            </p>
          </form>
        </div>
      </div>

      <!-- RIGHT: Preview & Action (2 cols) -->
      <div class="lg:col-span-2 flex flex-col gap-4">

        <!-- Preview -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="size-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-600 text-lg">visibility</span>
            </div>
            <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">Pratinjau</span>
          </div>

          <div class="rounded-2xl border-2 p-5 flex items-center gap-4" :style="{ borderColor: form.color, backgroundColor: form.color + '10' }">
            <div class="size-12 rounded-xl flex items-center justify-center shadow-sm shrink-0" :style="{ backgroundColor: form.color + '22' }">
              <span class="material-symbols-outlined text-2xl" :style="{ color: form.color }">schedule</span>
            </div>
            <div class="min-w-0">
              <p class="font-extrabold text-slate-800 dark:text-white text-lg leading-tight truncate">{{ form.name || 'Nama Group' }}</p>
              <p class="text-xs font-bold mt-1" :style="{ color: form.color }">
                {{ form.start_time || '--:--' }} – {{ form.end_time || '--:--' }}
              </p>
              <span
                class="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest"
                :class="form.is_shift
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'"
              >
                {{ form.is_shift ? 'Shift' : 'Reguler' }}
              </span>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Nama</span>
              <span class="font-bold text-slate-700 dark:text-slate-300 text-right max-w-[180px] truncate">{{ form.name || '—' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Jam</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ form.start_time || '--:--' }} – {{ form.end_time || '--:--' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Durasi</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ durationPreview }}</span>
            </div>
            <div v-if="form.keterangan" class="flex justify-between text-sm">
              <span class="text-slate-400">Keterangan</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300 text-right max-w-[180px] truncate">{{ form.keterangan }}</span>
            </div>
          </div>
        </div>

        <!-- Submit card -->
        <div class="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 p-6 text-white">
          <p class="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-4">{{ isEdit ? 'Simpan Perubahan' : 'Simpan Shift Baru' }}</p>

          <button
            type="button"
            :disabled="!form.name || !form.start_time || !form.end_time"
            class="w-full h-12 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg"
            @click="handleSubmit"
          >
            <span class="material-symbols-outlined text-lg">check_circle</span>
            {{ isEdit ? 'Simpan Perubahan' : 'Simpan Shift' }}
          </button>

          <UButton
            to="/shifts"
            color="neutral"
            variant="ghost"
            label="Kembali"
            class="w-full h-10 rounded-2xl font-bold text-indigo-200 hover:text-white hover:bg-white/10 mt-2"
          />
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
