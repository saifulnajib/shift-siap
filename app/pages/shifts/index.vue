<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'SHiFT Flow - Manage Shift',
  description: 'Kelola group jadwal, jam kerja, dan pengaturan jadwal kerja.',
  ogTitle: 'SHiFT Flow - Manage Shift',
  ogDescription: 'Kelola group jadwal, jam kerja, dan pengaturan jadwal kerja.',
  twitterCard: 'summary_large_image',
})

const { groups, isLoading, loadError, fetchGroups } = useShifts()

const searchQuery = ref('')

const filteredGroups = computed(() => {
  if (!searchQuery.value) return groups.value
  const q = searchQuery.value.toLowerCase()
  return groups.value.filter(g =>
    g.name?.toLowerCase().includes(q) ||
    g.keterangan?.toLowerCase().includes(q) ||
    g.start_time?.includes(q) ||
    g.end_time?.includes(q)
  )
})

onMounted(fetchGroups)
</script>

<template>
  <div class="min-h-[calc(100vh-100px)] flex flex-col gap-6 px-6 pt-6 pb-10">

    <!-- Header -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Manage Shift</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Daftar group jadwal kerja, jam masuk, dan durasi.</p>
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
            placeholder="Cari group jadwal, keterangan, atau jam..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 dark:text-white transition-all"
          />
        </div>
        <UButton icon="i-heroicons-arrow-path" color="neutral" variant="ghost" size="sm" @click="fetchGroups" />
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <div class="size-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-sm text-slate-400">Memuat data group jadwal...</p>
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <div class="size-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl text-red-400">cloud_off</span>
        </div>
        <p class="text-slate-400 font-bold mt-2">Gagal memuat data</p>
        <p class="text-xs text-slate-400 max-w-md text-center">{{ loadError }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredGroups.length === 0" class="flex-1 flex flex-col items-center justify-center py-20 opacity-60">
        <div class="size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl text-slate-400">event_busy</span>
        </div>
        <p class="text-slate-400 font-bold mt-4">Tidak ada group jadwal ditemukan</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800">
              <th class="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Group</th>
              <th class="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Is Shift</th>
              <th class="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="group in filteredGroups"
              :key="group.id"
              class="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" :style="{ backgroundColor: group.color + '22' }">
                    <span class="material-symbols-outlined text-lg" :style="{ color: group.color }">schedule</span>
                  </div>
                  <div class="min-w-0">
                    <NuxtLink
                      :to="`/shifts/${group.id}`"
                      class="flex items-center gap-2 group/name"
                    >
                      <span class="size-3 rounded-full shrink-0" :style="{ backgroundColor: group.color }"></span>
                      <p class="font-bold text-slate-800 dark:text-slate-200 leading-tight truncate group-hover/name:text-primary transition-colors">
                        {{ group.name }}
                      </p>
                    </NuxtLink>
                  </div>
                </div>
              </td>

              <td class="px-5 py-4">
                <span
                  class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap"
                  :class="group.is_shift
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'"
                >
                  {{ group.is_shift ? 'Shift' : 'Reguler' }}
                </span>
              </td>

              <td class="px-5 py-4">
                <span class="text-xs text-slate-500 dark:text-slate-400">{{ group.keterangan || '—' }}</span>
              </td>

              <td class="px-5 py-4 text-right whitespace-nowrap">
                <UButton
                  :to="`/shifts/${group.id}`"
                  icon="i-heroicons-eye"
                  variant="ghost"
                  color="neutral"
                />
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
