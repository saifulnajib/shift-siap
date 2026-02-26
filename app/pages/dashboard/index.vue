<template>
  <div class="flex flex-col h-full bg-background-light dark:bg-background-dark font-display">
    <!-- Filters Bar -->
    <section class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-3 flex items-center gap-4 overflow-x-auto no-scrollbar shrink-0">
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Filters:</span>
        
        <!-- Unit OPD Filter -->
        <USelectMenu 
            v-model="selectedUnitOpd" 
            :items="unitOpdOptions"
            value-attribute="label"
            placeholder="Pilih Unit OPD"
            clear
            class="min-w-[200px]"
        />

        <!-- Employee Filter -->
        <USelectMenu 
            v-model="selectedEmployee" 
            :items="employeeOptions"
            :disabled="!selectedUnitOpd"
            value-attribute="label"
            placeholder="Pilih Pegawai"
            clear
            class="min-w-[200px]"
        />
      </div>
      <div class="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-2"></div>
      <div class="flex items-center gap-4 shrink-0">
        <div class="flex items-center gap-2">
          <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" @click="date = new Date(date.getFullYear(), date.getMonth() - 1, 1)"><span class="material-symbols-outlined text-lg">chevron_left</span></button>
           <div class="flex flex-col items-center min-w-[150px]">
              <span class="text-sm font-bold capitalize">{{ format(date, 'MMMM yyyy', { locale: id }) }}</span>
              <span class="text-[10px] text-gray-500">
                  {{ format(setDate(subMonths(date, 1), 21), 'd MMM') }} - {{ format(setDate(date, 20), 'd MMM') }}
              </span>
           </div>
          <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" @click="date = new Date(date.getFullYear(), date.getMonth() + 1, 1)"><span class="material-symbols-outlined text-lg">chevron_right</span></button>
        </div>
        <button class="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded" @click="date = new Date()">Today</button>
      </div>
    </section>

    <!-- Calendar Container -->
    <section class="flex-1 p-6 overflow-y-auto overflow-x-hidden relative">
      <!-- Loading Overlay -->
      <div v-if="isLoading" class="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
        <div class="flex flex-col items-center gap-3">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-primary"></div>
          <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Memuat data jadwal...</p>
        </div>
      </div>

      <ClientOnly>
        <div class="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <!-- Days of Week -->
          <div v-for="day in ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']" :key="day" class="bg-slate-50 dark:bg-slate-900 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
            {{ day }}
          </div>
          
          <!-- Calendar Days -->
          <div v-for="day in daysInMonth" :key="day.toString()" class="bg-white dark:bg-slate-900 min-h-[140px] p-2 flex flex-col gap-1.5"
               :class="{ 'opacity-50': !isCurrentPeriod(day) }">
            <span class="text-sm font-bold" :class="{ 'text-primary': isSameDay(day, new Date()) }">{{ format(day, 'd') }}</span>
            
            <!-- Shifts for this day -->
            <div v-for="schedule in getSchedulesForDay(day)" :key="schedule.id" 
                 class="h-full w-full rounded p-1.5 text-left border-l-4"
                 :style="{ backgroundColor: schedule.shift_color + '20', borderColor: schedule.shift_color }">
                <p class="text-[10px] font-bold mb-0.5" :style="{ color: schedule.shift_color }">
                    {{ schedule.shift_name }}
                </p>
                <p class="text-[10px] mb-0.5" >({{ schedule.jadwal_masuk }} - {{ schedule.jadwal_pulang }})</p>
                <p class="text-[11px] font-semibold truncate text-gray-700 dark:text-gray-300">
                    {{ schedule.employee_name }}
                </p>
            </div>
          </div>
        </div>
      </ClientOnly>
    </section>
  </div>
</template>

<script setup lang="ts">
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDaysInMonth, subMonths, setDate, isWithinInterval } from 'date-fns'
import { id } from 'date-fns/locale'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'SHiFT Flow - Dashboard',
  description: 'The all-in-one platform for seamless scheduling, workforce planning, and real-time team coordination.',
  ogTitle: 'SHiFT Flow - Modern Shift Management',
  ogDescription: 'The all-in-one platform for seamless scheduling, workforce planning, and real-time team coordination.',
  twitterCard: 'summary_large_image',
})

// Inisialisasi ke periode yang sedang berjalan:
// Periode = 21 bulan lalu s/d 20 bulan ini.
// Jika hari ini sudah lewat tanggal 20, periode aktif ada di bulan depan.
const _today = new Date()
const date = ref(_today.getDate() > 20
    ? new Date(_today.getFullYear(), _today.getMonth() + 1, 1)
    : new Date(_today.getFullYear(), _today.getMonth(), 1)
)
const schedules = ref<any[]>([])
const isLoading = ref(false)
const user = useCookie<any>('user')
const unitOpds = ref<any[]>([])
const selectedUnitOpd = ref<any>(null)
const employees = ref<any[]>([])
const selectedEmployee = ref<any>(null)
const { fetchEmployeesByUnitOpd, fetchDetailPresensi } = useSiapApi()

// Month Navigation with Custom Period (21st Prev - 20th Curr)
const periodStart = computed(() => setDate(subMonths(date.value, 1), 21))
const periodEnd = computed(() => setDate(date.value, 20))

const daysInMonth = computed(() => {
  return eachDayOfInterval({ start: periodStart.value, end: periodEnd.value })
})

const isCurrentPeriod = (day: Date) => {
    return isWithinInterval(day, { start: periodStart.value, end: periodEnd.value })
}

const unitOpdOptions = computed(() => {
    return unitOpds.value.map(u => ({
        id: u.id_unit_opd,
        label: u.nama_unit_opd,
        ...u
    }))
})

const employeeOptions = computed(() => {
    return employees.value.map(emp => ({
        id: emp.pin,
        label: emp.nama,
        ...emp
    }))
})

// Data Fetching
const fetchUnitOpds = async () => {
    if (!user.value?.id_opd) return
    try {
        
        const response: any = await $fetch(`/api/ref/unit-opd/${user.value.id_opd}`)
        unitOpds.value = response.data || []
        
    } catch (e) {
        console.error('Failed to fetch Unit OPDs', e)
    }
}

const fetchEmployees = async (idUnitOpd: string) => {
    if (!idUnitOpd) {
        employees.value = []
        return
    }
    
    try {
        const response: any = await fetchEmployeesByUnitOpd(idUnitOpd)
        employees.value = response.data || []
    } catch (e) {
        console.error('Failed to fetch employees', e)
        employees.value = []
    }
}

const fetchEmployeeSchedule = async (pin: string) => {
    if (!pin) {
        schedules.value = []
        return
    }
    
    isLoading.value = true
    try {
        const bulan = date.value.getMonth() + 1 // JavaScript months are 0-indexed
        const tahun = date.value.getFullYear()
        
        const response: any = await fetchDetailPresensi({ pin, bulan, tahun })
        const presensiData = response.data || []
        
        // Transform presensi data to match calendar schedule format
        schedules.value = presensiData.map((item: any) => ({
            id: `${item.pin}-${item.tgl_presensi}`,
            date: item.tgl_presensi,
            employee_name: selectedEmployee.value?.label || '',
            shift_name: item.nama_jadwal,
            shift_color: item.warna,
            jadwal_masuk: item.jadwal_masuk,
            jadwal_pulang: item.jadwal_pulang,
            ...item
        }))
        
        console.log('Transformed schedules:', schedules.value)
    } catch (e) {
        console.error('Failed to fetch employee schedule', e)
        schedules.value = []
    } finally {
        isLoading.value = false
    }
}

const fetchUnitSchedule = async (idUnitOpd: string) => {
    if (!idUnitOpd) {
        schedules.value = []
        return
    }
    
    isLoading.value = true
    try {
        const bulan = date.value.getMonth() + 1 // JavaScript months are 0-indexed
        const tahun = date.value.getFullYear()
        
        const response: any = await fetchDetailPresensi({ id_unit_opd: idUnitOpd, bulan, tahun })
        const presensiData = response.data || []
        
        // Transform presensi data to match calendar schedule format
        // For unit schedules, we need to find employee names from the employees list
        schedules.value = presensiData.map((item: any) => {
            const employee = employees.value.find(emp => emp.pin === item.pin)
            return {
                id: `${item.pin}-${item.tgl_presensi}`,
                date: item.tgl_presensi,
                employee_name: employee?.nama || item.pin,
                shift_name: item.nama_jadwal,
                shift_color: item.warna,
                jadwal_masuk: item.jadwal_masuk,
                jadwal_pulang: item.jadwal_pulang,
                ...item
            }
        })
        
        console.log('Transformed unit schedules:', schedules.value)
    } catch (e) {
        console.error('Failed to fetch unit schedule', e)
        schedules.value = []
    } finally {
        isLoading.value = false
    }
}


const getSchedulesForDay = (day: Date) => {
    return schedules.value.filter(s => isSameDay(new Date(s.date), day))
}

watch(date, () => {
    // Refetch schedule if employee is selected
    if (selectedEmployee.value?.id) {
        fetchEmployeeSchedule(selectedEmployee.value.id)
    } else if (selectedUnitOpd.value?.id) {
        // Refetch unit schedules if unit OPD is selected but no employee
        fetchUnitSchedule(selectedUnitOpd.value.id)
    } 
})

watch(selectedUnitOpd, async (newVal) => {
    selectedEmployee.value = null
    schedules.value = []
    if (newVal?.id) {
        await fetchEmployees(newVal.id)
        // After fetching employees, also fetch schedules for the entire unit
        fetchUnitSchedule(newVal.id)
    } else {
        employees.value = []
    }
})

watch(selectedEmployee, (newVal) => {
    if (newVal?.id) {
        fetchEmployeeSchedule(newVal.id)
    } else {
        schedules.value = []
    }
})

onMounted(() => {
    fetchUnitOpds()
})
</script>
