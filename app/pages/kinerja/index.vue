<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'SHiFT Flow - Data Kinerja',
  description: 'Data Kinerja dari integrasi API e-Kinerja',
})

const { fetchAllPegawai } = useSiapApi()
const user = useCookie<any>('user')

const isLoading = ref(false)
const opdPegawai = ref<any[]>([]) // Daftar pegawai dari OPD session (untuk left join)
const items = ref<any[]>([]) // Data API e-kinerja akan masuk ke sini
const columns = [
  { accessorKey: 'no', header: 'No' },
  { accessorKey: 'nama', header: 'Nama / Jabatan' },
  { accessorKey: 'nip', header: 'NIP' },
  { accessorKey: 'nilai', header: 'Nilai Kinerja' },
  { accessorKey: 'perilaku', header: 'Perilaku Kerja' },
  { accessorKey: 'predikat', header: 'Predikat' },
]

// Pagination State
const searchQuery = ref('')
const statusFilter = ref<any>({ value: 'semua', label: 'Semua Status' })
const currentPage = ref(1)
const perPage = ref(50)

const filteredItems = computed(() => {
  let result = items.value

  // Filter by status
  const status = typeof statusFilter.value === 'object' ? statusFilter.value?.value : statusFilter.value
  if (status === 'belum') {
    result = result.filter((item) => item.nilai === 'BELUM BUAT')
  } else if (status === 'sudah') {
    result = result.filter((item) => item.nilai !== 'BELUM BUAT')
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((item) =>
      item.nama?.toLowerCase().includes(q) ||
      item.nip?.includes(q)
    )
  }

  return result
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return [...filteredItems.value].slice(start, end)
})

watch(searchQuery, () => { currentPage.value = 1 })
watch(statusFilter, () => { currentPage.value = 1 })
// Filter State
const selectedYear = ref<any>('2026')
const yearOptions = [
  { id: '2026', label: '2026' }
]

const selectedMonth = ref<any>(undefined)
const monthOptions = ref<any[]>([])

const fetchMonths = async () => {
    try {
        const response: any = await $fetch('/api/kinerja/periodes')
        if (response?.success && Array.isArray(response.data)) {
            monthOptions.value = response.data.map((item: any) => ({
                id: item.id,
                label: item.nama
            }))
        } else {
            console.error('Invalid response format', response)
        }
    } catch (error) {
        console.error('Failed to fetch period referensi:', error)
    }
}

const refreshData = async () => {
    if (!selectedMonth.value) {
        alert('Pilih bulan terlebih dahulu')
        return
    }

    isLoading.value = true
    try {
        const response: any = await $fetch('/api/kinerja', {
            params: {
                bulan: typeof selectedMonth.value === 'object' ? selectedMonth.value.id : selectedMonth.value,
                tahun: typeof selectedYear.value === 'object' ? selectedYear.value.id : selectedYear.value
            }
        })
        
        if (response && response.success && response.data) {
           const resultData = response.data
           if (Array.isArray(resultData)) {
               const mappedItems = resultData.map((item: any, index: number) => ({
                   no: index + 1,
                   nama: item.nama || '-',
                   nip: item.nip || '-',
                   jabatan: item.skp_jabatan || '-',
                   nilai: (item.hasil_kerja && item.hasil_kerja !== '-') ? item.hasil_kerja : 'BELUM BUAT',
                   perilaku: (item.perilaku_kerja && item.perilaku_kerja !== '-') ? item.perilaku_kerja : 'BELUM BUAT',
                   predikat: (item.hasil_akhir && item.hasil_akhir !== '-') ? item.hasil_akhir : 'BELUM BUAT',
                   ...item
               }))
               
               // Build Map: NIP → kinerja row
               const kinerjaMap = new Map<string, any>()
               mappedItems.forEach((item: any) => {
                   if (item.nip) kinerjaMap.set(item.nip, item)
               })

               // Left join: all OPD employees, matched or not
               const baseList = opdPegawai.value.length > 0 ? opdPegawai.value : []
               
               if (baseList.length > 0) {
                   items.value = baseList.map((pegawai: any, idx: number) => {
                       const kinerja = kinerjaMap.get(pegawai.nip)
                       if (kinerja) {
                           return { ...kinerja, no: idx + 1 }
                       }
                       return {
                           no: idx + 1,
                           nama: pegawai.nama || '-',
                           nip: pegawai.nip || '-',
                           jabatan: pegawai.jabatan || '-',
                           nilai: 'BELUM BUAT',
                           perilaku: 'BELUM BUAT',
                           predikat: 'BELUM BUAT',
                       }
                   })
               } else {
                   // Fallback: no OPD list loaded, just show all kinerja data
                   items.value = mappedItems
               }
           } else {
               items.value = []
               console.warn('API returned success but data is not an array', resultData)
           }
        } else {
            items.value = []
            console.warn('Response does not have success or data', response)
        }
    } catch (error: any) {
        console.error('Gagal mengambil data:', error)
        alert(error.data?.message || 'Gagal mengambil data kinerja')
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    fetchMonths()

    // Load full pegawai list for session OPD for left join
    if (user.value?.id_opd) {
        try {
            const res: any = await fetchAllPegawai({ id_opd: user.value.id_opd })
            opdPegawai.value = res?.data || []
        } catch (e) {
            console.error('Failed to load OPD employees:', e)
        }
    }
})
</script>

<template>
  <div class="h-[calc(100vh-100px)] flex flex-col px-4 pt-4">
    <div class="flex justify-between items-center mb-4 gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Data Kinerja</h1>
        <p class="text-slate-500 text-sm mt-1">Data table kinerja pegawai yang terintegrasi dengan API e-Kinerja BKN.</p>
      </div>

      <div class="flex items-center gap-3">
         <!-- Month Filter -->
         <USelectMenu 
             v-model="selectedMonth" 
             :items="monthOptions"
             value-attribute="id"
             option-attribute="label"
             placeholder="Pilih Bulan"
             class="min-w-[150px]"
         >
         </USelectMenu>

         <!-- Year Filter -->
         <USelectMenu 
             v-model="selectedYear" 
             :items="yearOptions"
             value-attribute="id"
             class="min-w-[100px]"
         />

         <!-- Search -->
         <UInput
             v-model="searchQuery"
             icon="i-heroicons-magnifying-glass"
             placeholder="Cari nama atau NIP..."
             class="min-w-[220px]"
             :disabled="items.length === 0"
         />

         <!-- Status Filter -->
         <USelectMenu
             v-model="statusFilter"
             :items="[
               { value: 'semua', label: 'Semua Status' },
               { value: 'sudah', label: '✅ Sudah Buat' },
               { value: 'belum', label: '⚠️ Belum Buat' },
             ]"
             value-attribute="value"
             option-attribute="label"
             class="min-w-[160px]"
             :disabled="items.length === 0"
         />

         <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

         <UButton
           icon="i-heroicons-arrow-path"
           color="primary"
           variant="soft"
           size="sm"
           :loading="isLoading"
           @click="refreshData"
         >
           Tampilkan Data
         </UButton>
      </div>
    </div>

    <div class="flex-1 overflow-auto border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 relative">
        <UTable 
            :columns="columns" 
            :data="paginatedItems" 
            :loading="isLoading"
            class="w-full"
        >
            <template #nama-cell="{ row }">
              <div class="min-w-0">
                <p class="font-medium text-slate-900 dark:text-white break-words whitespace-normal leading-snug">{{ row.original.nama }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 break-words whitespace-normal leading-snug mt-0.5">{{ row.original.jabatan }}</p>
              </div>
            </template>
            <template #nilai-cell="{ row }">
              <UBadge :color="row.original.nilai?.toLowerCase() === 'sesuai' ? 'success' : 'warning'" variant="subtle">
                {{ row.original.nilai?.toUpperCase() }}
              </UBadge>
            </template>
            <template #perilaku-cell="{ row }">
              <UBadge :color="row.original.perilaku?.toLowerCase() === 'sesuai' ? 'success' : 'warning'" variant="subtle">
                {{ row.original.perilaku?.toUpperCase() }}
              </UBadge>
            </template>
            <template #predikat-cell="{ row }">
              <UBadge :color="row.original.predikat?.toLowerCase() === 'baik' ? 'success' : 'warning'">
                {{ row.original.predikat?.toUpperCase() }}
              </UBadge>
            </template>
            <template #empty>
                <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-full mb-4">
                        <span class="material-symbols-outlined text-4xl text-slate-400">analytics</span>
                    </div>
                    <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">Data belum tersedia</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                        Silakan pilih bulan dan klik "Tampilkan Data" untuk memuat data kinerja dari API.
                    </p>
                </div>
            </template>
        </UTable>
    </div>
    
    <div class="mt-4 flex justify-between items-center" v-if="filteredItems.length > 0">
        <span class="text-sm text-slate-500">Menampilkan {{ (currentPage - 1) * perPage + 1 }} - {{ Math.min(currentPage * perPage, filteredItems.length) }} dari {{ filteredItems.length }} data<template v-if="searchQuery"> (difilter dari {{ items.length }})</template></span>
        <UPagination
            :page="currentPage"
            :items-per-page="perPage"
            :total="filteredItems.length"
            @update:page="(p) => { currentPage = p }"
        />
    </div>
  </div>
</template>
