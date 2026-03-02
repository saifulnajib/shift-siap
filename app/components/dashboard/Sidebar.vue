<template>
  <aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
    <div class="p-6 flex items-center gap-3">
      <div class="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
        <span class="material-symbols-outlined">grid_view</span>
      </div>
      <div>
        <h1 class="text-lg font-extrabold tracking-tight leading-none">ShiftFlow</h1>
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Admin Panel</p>
      </div>
    </div>
    <nav class="flex-1 px-4 space-y-1">
      <NuxtLink to="/dashboard" class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group" active-class="bg-primary/10 text-primary hover:bg-primary/10">
        <span class="material-symbols-outlined group-hover:text-primary" :class="{ 'text-primary': $route.path === '/dashboard' }">dashboard</span>
        <span class="text-sm font-semibold">Dashboard</span>
      </NuxtLink>
      <NuxtLink to="/schedules" class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group" active-class="bg-primary/10 text-primary hover:bg-primary/10">
        <span class="material-symbols-outlined group-hover:text-primary" :class="{ 'text-primary': $route.path === '/schedules' }">calendar_month</span>
        <span class="text-sm font-semibold">Schedule</span>
      </NuxtLink>
      <NuxtLink to="/employees" class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group" active-class="bg-primary/10 text-primary hover:bg-primary/10">
        <span class="material-symbols-outlined group-hover:text-primary" :class="{ 'text-primary': $route.path === '/employees' }">group</span>
        <span class="text-sm font-semibold">Employees</span>
      </NuxtLink>
      <NuxtLink to="#" class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group" active-class="bg-primary/10 text-primary hover:bg-primary/10">
        <span class="material-symbols-outlined group-hover:text-primary" :class="{ 'text-primary': $route.path === '/reports' }">swap_calls</span>
        <span class="text-sm font-semibold">Manage Shifts</span>
        <UBadge color="warning" variant="subtle" size="xs" class="ml-auto">Soon</UBadge>
      </NuxtLink>
      <NuxtLink to="/reports" class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group" active-class="bg-primary/10 text-primary hover:bg-primary/10">
        <span class="material-symbols-outlined group-hover:text-primary" :class="{ 'text-primary': $route.path === '/reports' }">bar_chart</span>
        <span class="text-sm font-semibold">Reports</span>
      </NuxtLink>
      <NuxtLink to="#" class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group" active-class="bg-primary/10 text-primary hover:bg-primary/10">
        <span class="material-symbols-outlined group-hover:text-primary" :class="{ 'text-primary': $route.path === '/settings' }">settings</span>
        <span class="text-sm font-semibold">Settings</span>
        <UBadge color="warning" variant="subtle" size="xs" class="ml-auto">Soon</UBadge>
      </NuxtLink>
    </nav>
    <div class="p-4 mt-auto">
      <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
        <p class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-tight">Butuh Bantuan ?</p>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">Hubungi kami jika ada kendala.</p>
        <a href="https://lantik.kominfo.tanjungpinangkota.go.id" target="_blank" class="block w-full text-center py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold shadow-sm hover:shadow transition-all">
          Help Desk
        </a>
      </div>
<div class="mt-4 flex items-center gap-3 px-2">
        <img class="size-9 rounded-full object-cover" alt="Admin user avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqsmtG8xZ7yxfj_Cc1GIbSvOEJdZjrqmNGSQ0hc8g9rvEeVZmn7XHUBn_7KuRgUwolg-FxJPI3HjUcLiUmQGrt7B6gfR3AcY05Jn-fMogvUTTIaGi_LkR1P5oMHsHVOQ-WWJ90NvTEcrp-Mk5nIlhIYCBqXygTJsZs97Vy8nY8EXHp5kSmkBSYWedJzc5K80KLQpTF8_woF7mkpQos-ziyZ4kJYYd0hU79bAhCVnwE9jFC0uAEpQIZqS4hvy_eaESY0-ylmpGwYfA"/>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold truncate">{{ user?.username || 'Admin User' }}</p>
          <p class="text-[10px] text-slate-500 truncate">{{ user?.nama || '-' }}</p>
        </div>
        <UButton color="secondary" variant="ghost" icon="i-heroicons-arrow-right-start-on-rectangle-20-solid" size="xs" @click="handleLogout" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const user = useCookie<any>('user')
const emit = defineEmits(['logout'])

const handleLogout = () => {
  emit('logout')
}
</script>
