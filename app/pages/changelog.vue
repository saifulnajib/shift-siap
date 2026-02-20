<template>
  <div class="font-display bg-background-light text-taupe-deep min-h-screen flex flex-col items-center py-12 px-6 relative overflow-hidden">
    <!-- Abstract Background Elements -->
    <div class="fixed inset-0 pointer-events-none -z-10">
      <div class="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-earth-terracotta/5 blur-[120px]"></div>
    </div>

    <div class="w-full max-w-4xl relative z-10">
      <header class="mb-12 text-center">
        <div class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
          Updates & History
        </div>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight text-taupe-deep mb-4">
          Changelog
        </h1>
        <p class="text-taupe-soft max-w-xl mx-auto">
          Catatan perubahan, fitur baru, dan perbaikan bug yang diterapkan pada sistem secara otomatis.
        </p>
      </header>
      
      <!-- Back Button -->
      <div class="mb-8">
        <UButton
          to="/"
          icon="i-heroicons-arrow-left-20-solid"
          color="neutral"
          variant="soft"
          class="font-medium shadow-sm"
        >
          Kembali ke Beranda
        </UButton>
      </div>

      <div class="bg-white/60 backdrop-blur-xl border border-brown-border/20 rounded-2xl p-6 md:p-10 shadow-xl shadow-brown-border/5">
        <div v-if="pending" class="flex flex-col items-center justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-primary animate-spin mb-4" />
          <p class="text-taupe-soft text-sm font-medium">Memuat log perubahan...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-error mx-auto mb-4" />
          <h3 class="text-lg font-bold text-taupe-deep mb-2">Gagal Memuat Changelog</h3>
          <p class="text-taupe-soft text-sm">{{ error.message }}</p>
        </div>

        <div v-else-if="changelogData?.data?.length" class="space-y-12">
          <div v-for="(group, index) in changelogData.data" :key="index" class="relative">
            <!-- Timeline decoration -->
            <div v-if="index !== changelogData.data.length - 1" class="absolute left-[11px] top-10 bottom-[-48px] w-0.5 bg-brown-border/20"></div>
            
            <div class="flex items-center gap-4 mb-6 relative">
              <div class="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center z-10">
                <div class="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h2 class="text-xl font-bold text-taupe-deep flex items-center gap-2">
                <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-taupe-soft" />
                {{ formatDate(group.date) }}
              </h2>
            </div>
            
            <div class="pl-10 space-y-4">
              <div v-for="commit in group.items" :key="commit.hash" class="bg-white border border-brown-border/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex flex-wrap items-start justify-between gap-4 mb-2">
                  <div class="flex items-center gap-2">
                    <UBadge :color="getBadgeColor(commit.type)" variant="subtle" size="sm" class="uppercase tracking-wider font-bold">
                      {{ commit.type }}
                    </UBadge>
                  </div>
                  <div class="flex items-center gap-1.5 text-xs text-taupe-soft">
                    <UIcon name="i-heroicons-user" class="w-3.5 h-3.5" />
                    {{ commit.author }}
                  </div>
                </div>
                <p class="text-taupe-deep font-medium leading-relaxed">{{ commit.subject }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-taupe-soft">Tidak ada catatan perubahan yang ditemukan.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Changelog - SHiFT Flow',
  description: 'Catatan perubahan dan histori pembaruan aplikasi otomatis.',
})

// Define data structure
interface Commit {
  hash: string
  subject: string
  date: string
  author: string
  type: string
}

interface ChangelogGroup {
  date: string
  items: Commit[]
}

interface ChangelogResponse {
  success: boolean
  data: ChangelogGroup[]
}

const { data: changelogData, pending, error } = useFetch<ChangelogResponse>('/api/changelog')

const getBadgeColor = (type: string) => {
  switch (type) {
    case 'added': return 'primary'
    case 'updated': return 'info'
    case 'fixed': return 'success'
    case 'removed': return 'error'
    case 'deprecated': return 'warning'
    default: return 'neutral'
  }
}

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d)
  } catch (e) {
    return dateStr
  }
}
</script>
