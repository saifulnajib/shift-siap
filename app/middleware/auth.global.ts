export default defineNuxtRouteMiddleware((to) => {
    const user = useCookie('user')

    // List of routes that don't require authentication
    const publicRoutes = ['/login']

    // If user is not logged in and tries to access a protected route
    if (!user.value && !publicRoutes.includes(to.path)) {
        return navigateTo('/login')
    }

    // If user is logged in and tries to access login page
    if (user.value && to.path === '/login') {
        return navigateTo('/')
    }
})
