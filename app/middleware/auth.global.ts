export default defineNuxtRouteMiddleware((to) => {
    const user = useCookie('user')

    // List of routes that don't require authentication
    const publicRoutes = ['/login', '/', '/changelog', '/privacy-policy']

    // If user is not logged in and tries to access a protected route
    if (!user.value && !publicRoutes.includes(to.path)) {
        return navigateTo('/login')
    }

    // If user is logged in and tries to access login page or landing page
    if (user.value && to.path === '/login') {
        if ((user.value as any).group_id == 12 || (user.value as any).group_id == '12') {
            return navigateTo('/uptd/dashboard')
        }
        return navigateTo('/dashboard')
    }

    // Redirect group_id 12 away from routes they're not allowed
    if (user.value && ((user.value as any).group_id == 12 || (user.value as any).group_id == '12')) {
        const allowedDinasRoutes = ['/uptd/presensi', '/uptd/dashboard', '/uptd/pegawai']
        if (!allowedDinasRoutes.includes(to.path)) {
            return navigateTo('/uptd/dashboard')
        }
    }
    
    // Optional: Prevent other users from accessing uptd routes
    if (user.value && (user.value as any).group_id != 12 && (user.value as any).group_id != '12') {
        if (to.path === '/uptd/presensi' || to.path === '/uptd/dashboard' || to.path === '/uptd/pegawai') {
            return navigateTo('/dashboard')
        }
    }
})

