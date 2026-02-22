<script setup lang="ts">
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const user = useCookie<any>('user')
const route = useRoute()

// Map routes to human-readable titles
const pageTitle = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'Dashboard Overview'
  if (path === '/schedules') return 'Shift Schedules'
  if (path === '/employees') return 'Employee Management'
  return 'Admin Panel'
})

const today = computed(() => format(new Date(), 'EEEE, d MMMM yyyy', { locale: id }))
</script>

<template>
  <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
    <div class="flex items-center gap-6 flex-1">
      <!-- Page Title / Breadcrumb -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{{ pageTitle }}</span>
        <div class="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ today }}</span>
      </div>

      <!-- Search (Hidden on small screens or kept compact) -->
      <div class="relative w-full max-w-xs ml-4">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        <input class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-1.5 text-xs focus:ring-2 focus:ring-primary/20" placeholder="Search..." type="text"/>
      </div>
    </div>

    <div class="flex items-center gap-6">
      <!-- User Info Badge -->
      <div class="flex flex-col items-end text-right">
        <span class="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none mb-1">{{ user?.username || 'Admin' }}</span>
        <span class="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-none">{{ user?.nama_unit_opd || 'Super Admin' }}</span>
      </div>

      <div class="flex items-center gap-3">
        <button 
          class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
          title="Lihat Notifikasi"
          aria-label="Notifikasi"
        >
          <span class="material-symbols-outlined text-[22px]">notifications</span>
          <span class="absolute top-2 right-2 size-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>

        <button 
          class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          title="Tambah Jadwal Shift Baru"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          <span>Create</span>
        </button>
      </div>
    </div>
  </header>
</template>
