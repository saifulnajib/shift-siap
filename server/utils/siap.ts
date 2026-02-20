/**
 * Utility untuk mengakses SIAP API.
 * URL dan token diambil dari environment variable melalui runtimeConfig.
 * Ganti nilai di file .env, bukan di sini.
 */

export function getSiapConfig() {
    const config = useRuntimeConfig()
    const baseUrl = (config.siapApiUrl as string) || 'https://siap.tanjungpinangkota.go.id'
    const token = (config.siapApiToken as string) || ''
    return { baseUrl, token }
}

/**
 * Membuat `headers` standar untuk request ke SIAP API.
 * @param extra - header tambahan opsional
 */
export function getSiapHeaders(extra?: Record<string, string>) {
    const { token } = getSiapConfig()
    return {
        'token': token,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...extra
    }
}

/**
 * Mengambil full URL endpoint SIAP API.
 * @param path - path endpoint, e.g. '/rest/shift/getPegawai'
 */
export function getSiapUrl(path: string) {
    const { baseUrl } = getSiapConfig()
    return `${baseUrl}${path}`
}
