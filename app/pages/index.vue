<template>
  <div class="font-display bg-background-light text-taupe-deep min-h-screen flex flex-col overflow-hidden geometric-bg">
    <!-- Minimal Top Navigation -->
    <nav class="relative z-10 w-full px-6 py-6 md:px-12 flex items-center justify-between">
      <div class="flex items-center gap-2 group cursor-pointer">
        <div class="bg-primary p-1.5 rounded-lg text-white shadow-lg shadow-primary/20">
          <svg class="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
            <path clip-rule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fill-rule="evenodd"></path>
          </svg>
        </div>
        <h2 class="text-xl font-black tracking-tighter text-taupe-deep uppercase">SHiFT <span class="text-primary italic">Flow</span></h2>
      </div>
      <div class="flex items-center gap-8">
        <a class="text-sm font-semibold text-taupe-soft hover:text-primary transition-colors flex items-center gap-1.5" href="https://lantik.kominfo.tanjungpinangkota.go.id/">
          <span class="material-symbols-outlined text-[18px]">help</span>
          Support
        </a>
        <div class="bg-primary/10 p-1 rounded-full border border-primary/20">
          <div class="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-[20px]">person</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Centered Hero Section -->
    <main class="flex-grow flex flex-col items-center justify-center px-6 relative z-10 text-center">
      <!-- Abstract Background Gradient Bloom -->
      <div class="absolute inset-0 flex items-center justify-center -z-10 opacity-30 pointer-events-none">
        <div class="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"></div>
      </div>
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Headline Stack -->
        <div class="space-y-4">
          <div class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Modern Shift Management
          </div>
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-taupe-deep leading-[1.05]">
            Simplify Your <span class="text-primary italic">Shifts</span>
          </h1>
          <p class="text-lg md:text-xl text-taupe-soft max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for seamless scheduling, workforce planning, and real-time team coordination.
          </p>
        </div>
        <!-- Main Action -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <UButton 
            to="/login"
            size="xl" 
            color="primary" 
            class="px-10 py-4 text-lg font-bold shadow-2xl shadow-primary/40 rounded-xl"
            icon="i-heroicons-arrow-right-start-on-rectangle-20-solid"
          >
            Masuk ke Admin
          </UButton>
        </div>
      </div>
    </main>

    <!-- Discreet Footer -->
    <footer class="relative z-10 w-full px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-brown-border/10">
      <div class="flex items-center gap-8 order-2 md:order-1">
        <a class="text-sm font-medium text-taupe-soft hover:text-primary transition-colors" href="#">Privacy Policy</a>
        <a class="text-sm font-medium text-taupe-soft hover:text-primary transition-colors" href="#">Terms of Service</a>
        <a class="text-sm font-medium text-taupe-soft hover:text-primary transition-colors" href="#">API Docs</a>
      </div>
      <div class="order-1 md:order-2">
        <p class="text-sm text-taupe-soft">© 2026 yang bikin <a class="text-primary hover:underline" href="https://instagram.com/saifulnadjib" target="_blank">@saifulnadjib</a> </p>
      </div>
    </footer>

    <!-- Decorative Floating Shapes -->
    <div class="absolute top-1/4 -left-12 w-64 h-64 border-[32px] border-primary/5 rounded-full pointer-events-none -z-0"></div>
    <div class="absolute bottom-1/4 -right-12 w-96 h-96 border-[48px] border-earth-terracotta/5 rounded-full pointer-events-none -z-0"></div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<style scoped>
.geometric-bg {
    background-color: transparent;
    background-image: radial-gradient(rgba(177, 149, 117, 0.15) 1px, transparent 1px);
    background-size: 32px 32px;
}
</style>
