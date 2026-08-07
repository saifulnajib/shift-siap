<template>
  <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-display overflow-hidden">

    <!-- ══ FILTER BAR ══════════════════════════════════════════════════════ -->
    <section class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-end gap-4 shrink-0">

      <!-- Cari Nama / NIP (client-side) -->
      <div class="flex flex-col gap-1 flex-1 min-w-[200px] max-w-xs">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cari Pegawai</label>
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Nama atau NIP..."
          :disabled="isLoading"
        />
      </div>

      <!-- Filter Pangkat (client-side) -->
      <div class="flex flex-col gap-1 min-w-[180px]">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pangkat</label>
        <USelectMenu
          v-model="filterPangkat"
          :items="pangkatOptions"
          placeholder="Semua Pangkat"
          class="w-full"
          :disabled="isLoading"
          searchable
        />
      </div>

      <!-- Filter Unit OPD (client-side) -->
      <div class="flex flex-col gap-1 min-w-[200px]">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit</label>
        <USelectMenu
          v-model="filterUnit"
          :items="unitOptions"
          placeholder="Semua Unit"
          class="w-full"
          :disabled="isLoading"
          searchable
        />
      </div>

      <!-- Reset Filter -->
      <div class="flex items-center gap-2 pb-0.5">
        <UButton
          v-if="hasActiveFilter"
          icon="i-heroicons-x-circle"
          color="neutral"
          variant="outline"
          @click="handleReset"
        >
          Reset
        </UButton>
      </div>

      <!-- Total badge -->
      <div class="ml-auto flex items-center gap-2 pb-0.5 shrink-0">
        <UBadge v-if="!isLoading" color="primary" variant="subtle" size="md">
          <span class="material-symbols-outlined text-sm mr-1">groups</span>
          {{ filteredList.length.toLocaleString() }}
          <template v-if="filteredList.length !== allPegawai.length">
            / {{ allPegawai.length.toLocaleString() }}
          </template>
          Pegawai
        </UBadge>
      </div>
    </section>

    <!-- ══ MAIN CONTENT ════════════════════════════════════════════════════ -->
    <div class="flex-1 flex flex-col overflow-hidden p-6 gap-4">

      <!-- ── LOADING ───────────────────────────────────────────────────── -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center flex-1 gap-4">
        <div class="relative w-16 h-16">
          <div class="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-lg">groups</span>
          </div>
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">Memuat Data Pegawai</p>
          <p class="text-xs text-slate-400 mt-0.5">Mohon tunggu sebentar...</p>
        </div>
      </div>

      <!-- ── TABLE CONTENT ─────────────────────────────────────────────── -->
      <template v-else>

        <!-- Per-page row -->
        <div class="flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
            Tampilkan:
            <USelectMenu v-model="perPageSelect" :items="perPageOptions" class="w-20" />
            <span class="text-slate-400">·</span>
            <span>
              <strong class="text-slate-700 dark:text-slate-200">{{ (currentPage - 1) * getPerPageValue + 1 }}</strong>
              –
              <strong class="text-slate-700 dark:text-slate-200">{{ Math.min(currentPage * getPerPageValue, filteredList.length) }}</strong>
              dari
              <strong class="text-slate-700 dark:text-slate-200">{{ filteredList.length.toLocaleString() }}</strong>
            </span>
          </div>
        </div>

        <!-- Table -->
        <div class="flex-1 overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
          <UTable
            :columns="columns"
            :data="pagedList"
            class="w-full"
          >
            <!-- No -->
            <template #no-cell="{ row }">
              <span class="text-xs font-semibold text-slate-400">{{ row.original.no }}</span>
            </template>

            <!-- Pegawai (nama + NIP) -->
            <template #pegawai-cell="{ row }">
              <div class="py-1">
                <p class="text-sm font-bold text-slate-900 dark:text-white leading-snug">{{ row.original.nama || '-' }}</p>
                <p class="text-[10px] font-mono text-slate-400 mt-0.5">{{ row.original.nip || '-' }}</p>
              </div>
            </template>

            <!-- Pangkat -->
            <template #pangkat-cell="{ row }">
              <span class="text-xs text-slate-600 dark:text-slate-300 leading-snug">{{ row.original.pangkat || '-' }}</span>
            </template>

            <!-- Golongan -->
            <template #golongan-cell="{ row }">
              <UBadge v-if="row.original.golongan" color="neutral" variant="subtle" size="xs" class="font-semibold">
                {{ row.original.golongan }}
              </UBadge>
              <span v-else class="text-xs text-slate-300">-</span>
            </template>

            <!-- Unit OPD -->
            <template #unit-cell="{ row }">
              <span class="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                {{ row.original.nama_opd || '-' }}
              </span>
            </template>

            <!-- Empty state -->
            <template #empty>
              <div class="flex flex-col items-center justify-center py-20 gap-4">
                <div class="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span class="material-symbols-outlined text-4xl text-slate-400">search_off</span>
                </div>
                <div class="text-center">
                  <h3 class="text-sm font-bold text-slate-700 dark:text-white mb-1">Tidak Ada Data</h3>
                  <p class="text-xs text-slate-400">Tidak ditemukan pegawai yang sesuai filter.</p>
                </div>
              </div>
            </template>
          </UTable>
        </div>

        <!-- Bottom Pagination -->
        <div v-if="totalPages > 1" class="flex justify-end shrink-0">
          <UPagination
            :page="currentPage"
            :items-per-page="getPerPageValue"
            :total="filteredList.length"
            @update:page="(p) => { currentPage = p }"
          />
        </div>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({
  title: 'Pegawai UPTD - SHiFT Flow',
  description: 'Daftar pegawai UPTD Dinas Pendidikan.',
})

const user = useCookie<any>('user')
const isLoading = ref(false)

// ── Table Columns ──────────────────────────────────────────────────────
const columns = [
  { accessorKey: 'no',       header: 'No',      size: 50  },
  { accessorKey: 'pegawai',  header: 'Pegawai'            },
  { accessorKey: 'pangkat',  header: 'Pangkat'            },
  { accessorKey: 'golongan', header: 'Gol.',    size: 80  },
  { accessorKey: 'unit',     header: 'Unit OPD'           },
]

// ── Raw Data ──────────────────────────────────────────────────────────
const allPegawai = ref<any[]>([])

// ── Client-side Filter & Search ───────────────────────────────────────
const searchQuery  = ref('')
const filterPangkat = ref<any>(null)
const filterUnit    = ref<any>(null)

const pangkatOptions = computed(() => {
  const set = new Set(allPegawai.value.map(p => p.pangkat).filter(Boolean))
  return [...set].sort().map(j => ({ id: j, label: j }))
})

const unitOptions = computed(() => {
  const set = new Set(allPegawai.value.map(p => p.nama_opd).filter(Boolean))
  return [...set].sort().map(u => ({ id: u, label: u }))
})

const hasActiveFilter = computed(() =>
  searchQuery.value.trim() !== '' || !!filterPangkat.value || !!filterUnit.value
)

const filteredList = computed(() => {
  let list = allPegawai.value

  // Search nama / NIP
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      (p.nama ?? '').toLowerCase().includes(q) ||
      (p.nip  ?? '').toLowerCase().includes(q)
    )
  }

  // Filter pangkat
  if (filterPangkat.value?.id) {
    list = list.filter(p => p.pangkat === filterPangkat.value.id)
  }

  // Filter unit
  if (filterUnit.value?.id) {
    list = list.filter(p =>
      p.nama_opd === filterUnit.value.id
    )
  }

  // Re-number
  return list.map((p, i) => ({ ...p, no: i + 1 }))
})

// Reset to page 1 whenever filter changes
watch([searchQuery, filterPangkat, filterUnit], () => { currentPage.value = 1 })

// ── Pagination (client-side) ───────────────────────────────────────────
const currentPage = ref(1)

const perPageOptions = [
  { id: 25,  label: '25'  },
  { id: 50,  label: '50'  },
  { id: 100, label: '100' },
]
const perPageSelect = ref<any>(perPageOptions[0])
const getPerPageValue = computed(() => {
  if (typeof perPageSelect.value === 'object' && perPageSelect.value !== null) return perPageSelect.value.id || 25
  return Number(perPageSelect.value) || 25
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / getPerPageValue.value))

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * getPerPageValue.value
  return filteredList.value.slice(start, start + getPerPageValue.value)
})

watch(perPageSelect, () => { currentPage.value = 1 })

// ── Helpers ───────────────────────────────────────────────────────────

// ── Reset ──────────────────────────────────────────────────────────────
const handleReset = () => {
  searchQuery.value   = ''
  filterPangkat.value = null
  filterUnit.value    = null
  currentPage.value   = 1
}

// ── Fetch All Data (sekali, tanpa paginasi server) ────────────────────
const fetchPegawai = async () => {
  const id_opd = user.value?.id_opd
  if (!id_opd) return

  isLoading.value = true
  allPegawai.value = []
  try {
    // Ambil semua data dengan limit besar — filter di client
    const res: any = await $fetch('/api/uptd/pegawai', {
      method: 'POST',
      body: { id_opd, page: 1, limit: 9999 },
    })
    allPegawai.value = (res.data ?? []).map((p: any, i: number) => ({ ...p, no: i + 1 }))
  } catch (e) {
    console.error('Gagal mengambil pegawai UPTD', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { fetchPegawai() })
</script>
