<template>
  <div class="font-display bg-background-light text-taupe-deep min-h-screen flex flex-col items-center justify-center overflow-hidden">
    <!-- Background Canvas with Organic Shapes -->
    <div class="fixed inset-0 bg-canvas pointer-events-none">
      <div class="organic-shape absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-earth-terracotta"></div>
      <div class="organic-shape absolute bottom-[-5%] right-[-5%] w-[600px] h-[600px] rounded-full bg-earth-olive"></div>
      <div class="organic-shape absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-earth-gray"></div>
    </div>

    <main class="relative z-10 w-full max-w-md px-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-taupe-deep">ShiftAdmin</h1>
        <p class="text-taupe-soft text-sm mt-1">Management Portal v1.0</p>
      </div>

      <!-- Glass Card -->
      <div class="glass-card rounded-xl p-8 md:p-10">
        <header class="mb-8">
          <h2 class="text-xl font-semibold text-taupe-deep">Admin Access</h2>
          <p class="text-sm text-taupe-soft mt-1">Enter your credentials to manage shifts</p>
        </header>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username Field -->
          <div class="space-y-2">
            <label class="text-xs font-medium uppercase tracking-wider text-taupe-soft ml-1" for="username">
              Username or Email
            </label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-taupe-soft text-lg">person_outline</span>
              <input
                v-model="username"
                class="w-full bg-white/40 border border-brown-border/20 rounded-lg py-3 pl-10 pr-4 text-taupe-deep placeholder:text-taupe-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                id="username"
                name="username"
                placeholder="Enter your admin ID"
                required
                type="text"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label class="text-xs font-medium uppercase tracking-wider text-taupe-soft ml-1" for="password">
                Password
              </label>
            </div>
            <div class="relative">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-taupe-soft text-lg">lock_open</span>
              <input
                v-model="password"
                class="w-full bg-white/40 border border-brown-border/20 rounded-lg py-3 pl-10 pr-4 text-taupe-deep placeholder:text-taupe-soft/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                id="password"
                name="password"
                placeholder="••••••••••"
                required
                type="password"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            :disabled="loading"
            class="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-primary/30 transition-all duration-200 flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
          >
            <span v-if="!loading">Authorize Login</span>
            <span v-else>Loading...</span>
            <span v-if="!loading" class="material-icons text-xl">login</span>
          </button>
        </form>

        <!-- Footer Links -->
        <div class="mt-8 pt-6 border-t border-brown-border/10 text-center">
          <p class="text-sm text-taupe-soft">
            Butuh Bantuan? <a class="text-primary hover:underline" href="https://lantik.kominfo.tanjungpinangkota.go.id/" target="_blank">Hubungi Admin</a>
          </p>
        </div>
      </div>

      <!-- Page Footer -->
      <footer class="mt-12 text-center">
        <div class="flex items-center justify-center space-x-4 mb-4 opacity-30">
          <div class="h-[1px] w-8 bg-brown-border"></div>
          <div class="flex items-center space-x-1 text-[10px] tracking-[0.2em] text-taupe-soft uppercase font-bold">
            <span class="material-icons text-xs">verified_user</span>
            <span>Secure End-to-End Encryption</span>
          </div>
          <div class="h-[1px] w-8 bg-brown-border"></div>
        </div>
        <p class="text-[10px] text-taupe-soft tracking-widest">
          © 2026 yang bikin <a class="text-primary hover:underline" href="https://www.instagram.com/saifulnadjib/" target="_blank">@saifulnajib</a>
        </p>
      </footer>
    </main>

    <!-- Additional Background Elements -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div class="absolute bottom-[-10%] left-[20%] w-[800px] h-[400px] bg-earth-terracotta/5 rounded-full blur-[120px] -rotate-12"></div>
      <div class="absolute top-[-10%] right-[10%] w-[600px] h-[300px] bg-earth-olive/5 rounded-full blur-[100px] rotate-12"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define the response type from the login API
interface LoginResponse {
  success: boolean
  data?: {
    datauser?: any
    loginStatus?: boolean
    message?: string
    [key: string]: any
  }
}

const toast = useToast()
const router = useRouter()

definePageMeta({
  layout: false
})

const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  
  const { data, error } = await useFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: {
      username: username.value,
      password: password.value
    }
  })

  if (error.value) {
    const message = error.value.data?.message || 'Login failed'
    toast.add({ title: 'Login failed', description: 'Akun tidak valid', color: 'error' })
    loading.value = false
    return
  }

  if (data.value && data.value.success && data.value.data?.datauser) {
    const userCookie = useCookie('user')
    // The server returns { success: true, data: { ...datauser... } }
    userCookie.value = data.value.data.datauser
    
    toast.add({ title: 'Login successful', color: 'success' })
    await navigateTo('/')
  }
  
  loading.value = false
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 248, 220, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(166, 137, 102, 0.3);
  box-shadow: 0 8px 32px 0 rgba(166, 137, 102, 0.15);
}

.organic-shape {
  filter: blur(80px);
  opacity: 0.15;
  z-index: 0;
}

.bg-canvas {
  background-color: #FDF5E6;
  background-image: radial-gradient(circle at 2px 2px, rgba(166, 137, 102, 0.05) 1px, transparent 0);
  background-size: 32px 32px;
}
</style>
