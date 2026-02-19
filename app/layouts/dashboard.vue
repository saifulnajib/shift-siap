<template>
  <div class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex min-h-screen overflow-hidden font-display">
    <DashboardSidebar @logout="onLogout" />
    
    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashboardHeader />
      <slot />
    </main>


    <!-- Logout Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showLogoutModal" class="relative z-[9999]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 transition-opacity" @click="showLogoutModal = false"></div>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-800">
              <div class="bg-white dark:bg-slate-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <span class="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
                  </div>
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white" id="modal-title">Sesi Berakhir</h3>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500 dark:text-gray-400">Apakah Anda yakin ingin keluar ?</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto" @click="confirmLogout">Ya, Keluar</button>
                <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 sm:mt-0 sm:w-auto" @click="showLogoutModal = false">Batal</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const showLogoutModal = ref(false)

const onLogout = () => {
   showLogoutModal.value = true
}

const confirmLogout = () => {
  const user = useCookie('user')
  user.value = null
  showLogoutModal.value = false
  navigateTo('/login')
}
</script>
