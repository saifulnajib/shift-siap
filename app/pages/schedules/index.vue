<script setup lang="ts">
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDaysInMonth, subMonths, setDate } from 'date-fns'
import { id } from 'date-fns/locale'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'SHiFT Flow - Schedules',
  description: 'The all-in-one platform for seamless scheduling, workforce planning, and real-time team coordination.',
  ogTitle: 'SHiFT Flow - Modern Shift Management',
  ogDescription: 'The all-in-one platform for seamless scheduling, workforce planning, and real-time team coordination.',
  twitterCard: 'summary_large_image',
})

const date = ref(new Date())
const { fetchEmployeesByUnitOpd, fetchDetailPresensi } = useSiapApi()
const isDownloading = ref(false)

const downloadTemplate = async () => {
  isDownloading.value = true
  try {
    const bulan = date.value.getMonth() + 1
    const tahun = date.value.getFullYear()
    let url = `/api/schedules/template?username=adminrsud&password=punyakepegawaian123&bulan=${bulan}&tahun=${tahun}`
    if (selectedUnitOpd.value?.id) {
      url += `&id_unit_opd=${selectedUnitOpd.value.id}`
    }
    const response = await fetch(url)
    if (!response.ok) throw new Error('Gagal mengunduh template')
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const disposition = response.headers.get('Content-Disposition') || ''
    const match = disposition.match(/filename="?([^"]+)"?/)
    link.download = match?.[1] ?? `template-jadwal-shift.xlsx`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (e) {
    console.error('Download error:', e)
  } finally {
    isDownloading.value = false
  }
}

// State
const user = useCookie<any>('user')
const unitOpds = ref<any[]>([])
const selectedUnitOpd = ref<any>(null)
const employees = ref<any[]>([])
const selectedEmployee = ref<any>(null)
const shifts = ref<any[]>([])
const schedules = ref<any[]>([])
const isLoading = ref(false)

// Computed
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

// Month Navigation
const daysInMonth = computed(() => {
  // Period: 21st of previous month to 20th of current month
  const start = setDate(subMonths(date.value, 1), 21)
  const end = setDate(date.value, 20)
  return eachDayOfInterval({ start, end })
})

// Filter employees to display (either all or just selected employee)
const displayedEmployees = computed(() => {
    if (selectedEmployee.value) {
        return employees.value.filter(emp => emp.pin === selectedEmployee.value.id)
    }
    return employees.value
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

const fetchSchedules = async () => {
    if (!selectedUnitOpd.value?.id) {
        schedules.value = []
        return
    }
    
    isLoading.value = true
    try {
        const bulan = date.value.getMonth() + 1
        const tahun = date.value.getFullYear()
        
        const params: any = {
            bulan,
            tahun
        }
        
        // If specific employee selected, fetch only their schedule
        if (selectedEmployee.value?.id) {
            params.pin = selectedEmployee.value.id
        } else {
            // Otherwise fetch all schedules for the unit
            params.id_unit_opd = selectedUnitOpd.value.id
        }
        
        const response: any = await fetchDetailPresensi(params)
        const presensiData = response.data || []
        
        // Transform to match schedule format
        schedules.value = presensiData.map((item: any) => {
            const employee = employees.value.find(emp => emp.pin === item.pin)
            return {
                id: `${item.pin}-${item.tgl_presensi}`,
                employee_id: item.pin,
                date: item.tgl_presensi,
                employee_name: employee?.nama || item.pin,
                shift_id: item.id_jadwal,
                shift_name: item.nama_jadwal,
                shift_color: item.warna,
                shift_start: item.jadwal_masuk,
                shift_end: item.jadwal_pulang,
                ...item
            }
        })
        
        console.log('Transformed schedules:', schedules.value)
    } catch (e) {
        console.error('Failed to fetch schedules', e)
        schedules.value = []
    } finally {
        isLoading.value = false
    }
}


// Watchers
watch(date, () => {
    if (selectedUnitOpd.value?.id) {
        fetchSchedules()
    }
})

watch(selectedUnitOpd, async (newVal) => {
    selectedEmployee.value = null
    schedules.value = []
    if (newVal?.id) {
        await fetchEmployees(newVal.id)
        fetchSchedules()
    } else {
        employees.value = []
    }
})

watch(selectedEmployee, () => {
    if (selectedUnitOpd.value?.id) {
        fetchSchedules()
    }
})

// Initial load
onMounted(() => {
    fetchUnitOpds()
    //loadShifts()
})

// Helper to get schedule for specific cell
const getSchedule = (employeePin: string, day: Date) => {
    return schedules.value.find(s => 
        s.employee_id === employeePin && 
        isSameDay(new Date(s.date), day)
    )
}

// Modal Logic for Schedule Details
const isOpen = ref(false)
const selectedCell = reactive({
    employeeId: '',
    employeeName: '',
    date: new Date(),
    schedule: null as any
})

const openScheduleModal = (employee: any, day: Date) => {
    selectedCell.employeeId = employee.pin
    selectedCell.employeeName = employee.nama
    selectedCell.date = day
    selectedCell.schedule = getSchedule(employee.pin, day)
    isOpen.value = true
}

// ── Upload Excel ──────────────────────────────────────────────
const isUploadOpen = ref(false)
const isDragging = ref(false)
const uploadFileName = ref('')
const uploadError = ref('')
const parsedJson = ref<any[] | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const openUploadModal = () => {
    parsedJson.value = null
    uploadFileName.value = ''
    uploadError.value = ''
    isUploadOpen.value = true
}

const parseExcelFile = async (file: File) => {
    uploadError.value = ''
    parsedJson.value = null
    if (!file.name.match(/\.xlsx?$/i)) {
        uploadError.value = 'Format file tidak valid. Harap unggah file .xlsx atau .xls'
        return
    }
    uploadFileName.value = file.name
    try {
        const { read, utils } = await import('xlsx')
        const buffer = await file.arrayBuffer()
        const wb = read(buffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]!]
        const rows: any[][] = utils.sheet_to_json(ws!, { header: 1, defval: '', range: 3 })
        if (rows.length < 2) {
            uploadError.value = 'File tidak memiliki data yang valid (minimal 1 baris header + 1 baris data mulai dari baris ke-4)'
            return
        }
        // Dengan range: 3, baris pertama (index 0) adalah header (Baris 4 di Excel)
        const [headerRow, ...dataRows] = rows
        const headers = headerRow as string[]
        // Kolom wajib di level atas
        const fixedCols = new Set(['PIN', 'NIP', 'Nama'])

        // Konversi header tanggal "21 Jan" → "yyyy-dd-mm"
        // Periode: 21 bulan lalu s/d 20 bulan ini
        const { parse: dateParse, format: dateFormat } = await import('date-fns')
        const { id: idLocale } = await import('date-fns/locale')
        const currYear = date.value.getFullYear()
        const currMonth = date.value.getMonth() // 0-indexed
        const prevMonth = currMonth === 0 ? 11 : currMonth - 1
        const prevYear = currMonth === 0 ? currYear - 1 : currYear

        const toIsoKey = (header: string): string => {
            try {
                // Parse "21 Jan" dengan tahun sementara, lalu tentukan tahun yang benar
                const parsed = dateParse(header, 'd MMM', new Date(), { locale: idLocale })
                const m = parsed.getMonth() // 0-indexed
                // Kolom bulan sebelumnya (periode 21–akhir bulan lalu) → pakai prevYear
                const year = m === prevMonth ? prevYear : currYear
                const d = new Date(year, m, parsed.getDate())
                return dateFormat(d, 'yyyy-MM-dd')
            } catch {
                return header // fallback: biarkan apa adanya
            }
        }

        // Map rows: kolom wajib di root, kolom tanggal yang tidak kosong masuk ke 'jadwal'
        const result = dataRows
            .filter(row => row.some((cell: any) => cell !== ''))
            .map(row => {
                const obj: Record<string, any> = {}
                const jadwal: Record<string, any> = {}
                headers.forEach((h, i) => {
                    const val = row[i] ?? ''
                    if (fixedCols.has(h)) {
                        obj[h] = val
                    } else if (val !== '') {
                        jadwal[toIsoKey(h)] = val
                    }
                })
                obj['jadwal'] = jadwal
                return obj
            })
        parsedJson.value = result
    } catch (e) {
        uploadError.value = 'Gagal membaca file Excel. Pastikan file tidak rusak.'
        console.error(e)
    }
}

const onFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement
    if (input.files?.[0]) parseExcelFile(input.files[0])
}

const onDrop = (e: DragEvent) => {
    isDragging.value = false
    const file = e.dataTransfer?.files?.[0]
    if (file) parseExcelFile(file)
}

const resetUpload = () => {
    parsedJson.value = null
    uploadFileName.value = ''
    uploadError.value = ''
    if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<template>
  <div class="h-[calc(100vh-100px)] flex flex-col px-4 pt-4"> 
    <div class="flex justify-between items-center mb-4 gap-4">
      <!-- Filters -->
      <div class="flex items-center gap-3 flex-1 justify-center">
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
      
      <!-- Month Navigation & Download -->
      <div class="flex items-center gap-3">
         <UButton icon="i-heroicons-chevron-left" color="secondary" variant="ghost" @click="date = new Date(date.getFullYear(), date.getMonth() - 1, 1)" />
         <div class="flex flex-col items-center min-w-[200px]">
            <span class="font-semibold capitalize text-sm">{{ format(date, 'MMMM yyyy', { locale: id }) }}</span>
            <span class="text-[10px] text-gray-500">
                {{ format(setDate(subMonths(date, 1), 21), 'd MMM') }} - {{ format(setDate(date, 20), 'd MMM') }}
            </span>
         </div>
         <UButton icon="i-heroicons-chevron-right" color="secondary" variant="ghost" @click="date = new Date(date.getFullYear(), date.getMonth() + 1, 1)" />
         <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
         <UButton
           icon="i-heroicons-arrow-down-tray"
           color="success"
           variant="soft"
           size="sm"
           :loading="isDownloading"
           @click="downloadTemplate"
         >
           Template Excel
         </UButton>
         <UButton
           icon="i-heroicons-arrow-up-tray"
           color="primary"
           variant="soft"
           size="sm"
           @click="openUploadModal"
         >
           Upload Excel
         </UButton>
      </div>
    </div>

    <div class="flex-1 overflow-auto border border-gray-200 dark:border-slate-700 rounded-lg relative">
        <!-- Loading Overlay -->
        <div v-if="isLoading" class="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-30">
            <div class="flex flex-col items-center gap-3">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-primary"></div>
                <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Memuat data jadwal...</p>
            </div>
        </div>

        <table class="w-full border-collapse text-sm">
            <thead class="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr>
                    <th class="p-2 border border-gray-200 dark:border-slate-700 text-left min-w-[200px] sticky left-0 bg-gray-50 dark:bg-slate-800 dark:text-slate-200 z-20">Pegawai</th>
                    <th v-for="day in daysInMonth" :key="day.toString()" class="p-2 border border-gray-200 dark:border-slate-700 dark:text-slate-200 text-center min-w-[40px]">
                        <div class="text-xs text-gray-500 dark:text-slate-400">{{ format(day, 'EEE') }}</div>
                        <div>{{ format(day, 'd') }}</div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="emp in displayedEmployees" :key="emp.pin" class="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td class="p-2 border border-gray-200 dark:border-slate-700 font-medium sticky left-0 bg-white dark:bg-slate-900 dark:text-slate-100 z-10 truncate max-w-[200px]" :title="emp.nama">
                        {{ emp.nama }}
                        <div class="text-xs text-gray-500 dark:text-slate-400 font-normal">{{ emp.nip }}</div>
                    </td>
                    <td v-for="day in daysInMonth" :key="day.toString()" 
                        class="p-0 border border-gray-200 dark:border-slate-700 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                        @click="openScheduleModal(emp, day)">
                        
                        <div v-if="getSchedule(emp.pin, day)" 
                             class="h-10 w-full flex items-center justify-center text-white text-xs font-bold"
                             :style="{ backgroundColor: getSchedule(emp.pin, day).shift_color || '#ccc' }"
                             :title="getSchedule(emp.pin, day).shift_name">
                             {{ getSchedule(emp.pin, day).shift_name.substring(0, 1) }}
                        </div>
                        <div v-else class="h-10 w-full"></div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>

  <!-- Schedule Details Modal -->
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click="isOpen = false">
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4" @click.stop>
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <div class="font-bold text-lg">Detail Jadwal: {{ selectedCell.employeeName }}</div>
          <div class="text-sm text-slate-500 mt-1">{{ format(selectedCell.date, 'EEEE, d MMMM yyyy', { locale: id }) }}</div>
        </div>
        <div class="p-6">
          <div v-if="selectedCell.schedule" class="space-y-3">
            <div class="p-4 rounded-lg border-2" :style="{ borderLeftColor: selectedCell.schedule.shift_color, borderLeftWidth: '4px', backgroundColor: selectedCell.schedule.shift_color + '10' }">
              <div class="font-bold text-lg mb-2">{{ selectedCell.schedule.shift_name }}</div>
              <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span class="material-symbols-outlined text-base">schedule</span>
                <span>{{ selectedCell.schedule.shift_start }} - {{ selectedCell.schedule.shift_end }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-slate-500">
            <span class="material-symbols-outlined text-4xl mb-2">event_busy</span>
            <p>Tidak ada jadwal shift pada tanggal ini</p>
          </div>
        </div>
        <div class="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button @click="isOpen = false" class="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">Tutup</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Upload Excel Modal -->
  <Teleport to="body">
    <div v-if="isUploadOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click="isUploadOpen = false">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" @click.stop>

        <!-- Modal Header -->
        <div class="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div>
            <h3 class="font-bold text-lg">Upload Template Excel</h3>
            <p class="text-xs text-slate-500 mt-0.5">Data akan ditampilkan sebagai preview JSON sebelum dikirim ke server</p>
          </div>
          <button @click="isUploadOpen = false" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <!-- Upload Area -->
        <div class="p-5 shrink-0">
          <div
            class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
            :class="isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5'"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="fileInputRef?.click()"
          >
            <input ref="fileInputRef" type="file" accept=".xlsx,.xls" class="hidden" @change="onFileChange" />
            <span class="material-symbols-outlined text-4xl mb-2" :class="isDragging ? 'text-primary' : 'text-slate-400'">upload_file</span>
            <p class="font-semibold text-sm" :class="isDragging ? 'text-primary' : 'text-slate-600 dark:text-slate-300'">
              {{ uploadFileName || 'Klik atau seret file Excel ke sini' }}
            </p>
            <p class="text-xs text-slate-400 mt-1">Format: .xlsx / .xls</p>
          </div>

          <!-- Error -->
          <div v-if="uploadError" class="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2.5">
            <span class="material-symbols-outlined text-base">error</span>
            {{ uploadError }}
          </div>
        </div>

        <!-- JSON Preview -->
        <div v-if="parsedJson" class="flex-1 overflow-hidden flex flex-col px-5 pb-5 min-h-0">
          <div class="flex items-center justify-between mb-2 shrink-0">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-success text-base">check_circle</span>
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {{ parsedJson.length }} baris data berhasil dibaca
              </span>
            </div>
            <button @click="resetUpload" class="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">refresh</span> Ganti file
            </button>
          </div>
          <div class="flex-1 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950 min-h-0">
            <pre class="text-xs text-green-400 p-4 leading-relaxed whitespace-pre-wrap break-all">{{ JSON.stringify(parsedJson, null, 2) }}</pre>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <p class="text-xs text-slate-400 italic">Endpoint server SIAP belum tersedia — data hanya ditampilkan sebagai preview</p>
          <div class="flex gap-2">
            <UButton color="secondary" variant="ghost" size="sm" @click="isUploadOpen = false">Tutup</UButton>
            <UButton
              v-if="parsedJson"
              icon="i-heroicons-paper-airplane"
              color="primary"
              size="sm"
              disabled
              title="Endpoint server SIAP belum tersedia"
            >
              Kirim ke Server
            </UButton>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>
