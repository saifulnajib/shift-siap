<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'SHiFT Flow - Employees',
  description: 'The all-in-one platform for seamless scheduling, workforce planning, and real-time team coordination.',
  ogTitle: 'SHiFT Flow - Modern Shift Management',
  ogDescription: 'The all-in-one platform for seamless scheduling, workforce planning, and real-time team coordination.',
  twitterCard: 'summary_large_image',
})

const { fetchAllPegawai } = useSiapApi()

// State
const user = useCookie<any>('user')
const unitOpds = ref<any[]>([])
const selectedUnitOpd = ref<any>(null)
const employees = ref<any[]>([])
const searchQuery = ref('')
const isLoading = ref(false)

// Pagination
const page = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 25, 50, 100]

// Computed
const unitOpdOptions = computed(() => {
    return unitOpds.value.map(u => ({
        id: u.id_unit_opd,
        label: u.nama_unit_opd,
        ...u
    }))
})

// Filtered employees based on search query
const filteredEmployees = computed(() => {
    if (!searchQuery.value) return employees.value
    
    const query = searchQuery.value.toLowerCase()
    return employees.value.filter((emp: any) => {
        const pin = emp.pin?.toLowerCase() || ''
        const nip = emp.nip?.toLowerCase() || ''
        const nama = emp.nama?.toLowerCase() || ''
        
        return pin.includes(query) || nip.includes(query) || nama.includes(query)
    })
})

// Paginated employees
const paginatedEmployees = computed(() => {
    const start = (page.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredEmployees.value.slice(start, end)
})

// Table columns definition
const columns = [
    { key: 'index', label: 'No', id: 'index' },
    { key: 'pin', label: 'PIN', id: 'pin' },
    { key: 'nip', label: 'NIP', id: 'nip' },
    { key: 'nama', label: 'Nama', id: 'nama' },
    { key: 'nama_group', label: 'Grup Jadwal', id: 'nama_group' },
    { key: 'nama_unit_opd', label: 'Unit OPD', id: 'nama_unit_opd' },
    { key: 'jnspeg', label: 'Jenis PNS', id: 'jnspeg' }
]


// Add index to employees for display
const tableData = computed(() => {
    return paginatedEmployees.value.map((emp, idx) => ({
        ...emp,
        index: (page.value - 1) * pageSize.value + idx + 1
    }))
})

// Data Fetching
const fetchUnitOpds = async () => {
    if (!user.value?.id_opd) return
    
    try {
        const response: any = await $fetch(`/api/ref/all-unit-opd/${user.value.id_opd}`)
        unitOpds.value = response.data || []
    } catch (e) {
        console.error('Failed to fetch Unit OPDs:', e)
    }
}

const fetchEmployees = async () => {
    if (!user.value?.id_opd) return
    
    isLoading.value = true
    try {
        const params: any = {
            id_opd: user.value.id_opd
        }
        
        if (selectedUnitOpd.value?.id) {
            params.id_unit_opd = selectedUnitOpd.value.id
        }
        
        const response: any = await fetchAllPegawai(params)
        employees.value = response.data || []
        
        // Reset to page 1 when data changes
        page.value = 1
    } catch (e) {
        console.error('Failed to fetch employees:', e)
        employees.value = []
    } finally {
        isLoading.value = false
    }
}

// Watchers
watch(selectedUnitOpd, () => {
    fetchEmployees()
})

watch(searchQuery, () => {
    // Reset to page 1 when search changes
    page.value = 1
})

watch(pageSize, () => {
    page.value = 1 // Reset to first page when page size changes
})

// Initial load
onMounted(() => {
    fetchUnitOpds()
    fetchEmployees()
})
</script>

<template>
  <div class="h-[calc(100vh-100px)] flex flex-col gap-4 px-4 pt-4">
    <!-- Header & Filters -->
    <div class="flex  justify-between items-center gap-4">
      
      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Cari PIN, NIP, atau Nama..."
            class=" pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800 min-w-[300px]"
          />
        </div>

        <!-- Unit OPD Filter -->
        <USelectMenu 
            v-model="selectedUnitOpd" 
            :items="unitOpdOptions"
            value-attribute="label"
            placeholder="Semua Unit OPD"
            clear
            class="min-w-[300px] min-h-[42px]"
        />
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="flex justify-between items-center text-sm">
      <div class="text-slate-600 dark:text-slate-400">
        Menampilkan {{ paginatedEmployees.length }} dari {{ filteredEmployees.length }} pegawai
        <span v-if="searchQuery || selectedUnitOpd" class="text-slate-500">({{ employees.length }} total)</span>
      </div>
      
      <!-- Rows per page selector -->
      <div class="flex items-center gap-2">
        <span class="text-slate-600 dark:text-slate-400">Baris per halaman:</span>
        <USelectMenu 
          v-model="pageSize"
          :items="pageSizeOptions"
          class="w-20"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 rounded-lg">
      <div class="flex-1 overflow-auto relative">
        <!-- Loading Overlay -->
        <div v-if="isLoading" class="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-30">
            <div class="flex flex-col items-center gap-3">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-primary"></div>
                <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Memuat data pegawai...</p>
            </div>
        </div>

        <table class="w-full border-collapse text-sm">
          <thead class="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
            <tr>
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 text-left font-semibold">No</th>
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 text-left font-semibold">PIN</th>
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 text-left font-semibold">NIP</th>
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 text-left font-semibold">Nama</th>
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 text-left font-semibold">Grup Jadwal</th>
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 text-left font-semibold">Unit OPD</th>
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 text-left font-semibold">Jenis PNS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tableData.length === 0 && !isLoading">
              <td colspan="7" class="p-8 text-center text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <span class="material-symbols-outlined text-4xl">person_off</span>
                  <p>{{ searchQuery ? 'Tidak ada pegawai yang sesuai dengan pencarian' : 'Tidak ada data pegawai' }}</p>
                </div>
              </td>
            </tr>
            <tr v-for="emp in tableData" :key="emp.pin" class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td class="p-3 border-b border-slate-200 dark:border-slate-700">{{ emp.index }}</td>
              <td class="p-3 border-b border-slate-200 dark:border-slate-700 font-mono text-xs">{{ emp.pin }}</td>
              <td class="p-3 border-b border-slate-200 dark:border-slate-700 font-mono text-xs">{{ emp.nip }}</td>
              <td class="p-3 border-b border-slate-200 dark:border-slate-700 font-medium">{{ emp.nama }}</td>
              <td class="p-3 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">{{ emp.nama_group || '-' }}</td>
              <td class="p-3 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">{{ emp.nama_unit_opd || '-' }}</td>
              <td class="p-3 border-b border-slate-200 dark:border-slate-700">
                <span 
                  class="px-2 py-1 rounded text-xs font-semibold" 
                  :class="emp.jnspeg === 'PPPK' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'"
                >
                  {{ emp.jnspeg || '-' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="border-t border-slate-200 dark:border-slate-700 p-4 flex justify-center items-center gap-2">
        <!-- First Page -->
        <button 
          @click="page = 1" 
          :disabled="page === 1"
          class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <span class="material-symbols-outlined text-sm">keyboard_double_arrow_left</span>
        </button>
        
        <!-- Previous Page -->
        <button 
          @click="page = page - 1" 
          :disabled="page === 1"
          class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <span class="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        
        <!-- Page Info -->
        <div class="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
          Halaman {{ page }} dari {{ Math.ceil(filteredEmployees.length / pageSize) }}
        </div>
        
        <!-- Next Page -->
        <button 
          @click="page = page + 1" 
          :disabled="page >= Math.ceil(filteredEmployees.length / pageSize)"
          class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <span class="material-symbols-outlined text-sm">chevron_right</span>
        </button>
        
        <!-- Last Page -->
        <button 
          @click="page = Math.ceil(filteredEmployees.length / pageSize)" 
          :disabled="page >= Math.ceil(filteredEmployees.length / pageSize)"
          class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <span class="material-symbols-outlined text-sm">keyboard_double_arrow_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

