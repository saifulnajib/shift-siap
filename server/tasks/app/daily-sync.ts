/**
 * Scheduled Task: app:daily-sync
 *
 * Berjalan setiap hari jam 05:00 WIB (UTC 22:00 sebelumnya).
 * Didaftarkan di nuxt.config.ts → nitro.scheduledTasks.
 *
 * Cara trigger manual (dev):
 *   GET /_nitro/tasks/app:daily-sync
 */
export default defineTask({
    meta: {
        name: 'app:daily-sync',
        description: 'Sinkronisasi harian data — berjalan otomatis jam 05:00 WIB',
    },
    async run({ payload, context }) {
        console.log('[cron] app:daily-sync dimulai —', new Date().toISOString())

        try {
            // ── Ganti BASE_URL dengan URL deployment Nuxt Anda ──────────────
            const BASE_URL = process.env.APP_URL || 'http://localhost:3000'

            // ── Endpoint yang ingin di-trigger ───────────────────────────────
            // Contoh: ganti path di bawah sesuai endpoint yang diinginkan
            const TARGET_ENDPOINT = `${BASE_URL}/api/init`   // <-- UBAH DI SINI

            const response = await fetch(TARGET_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Tambahkan header autentikasi jika diperlukan:
                    // 'Authorization': `Bearer ${process.env.CRON_SECRET}`,
                },
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`HTTP ${response.status}: ${text}`)
            }

            const data = await response.json()
            console.log('[cron] app:daily-sync selesai OK —', JSON.stringify(data))

            return { result: 'ok', data }
        } catch (error: any) {
            console.error('[cron] app:daily-sync GAGAL —', error.message)
            return { result: 'error', message: error.message }
        }
    },
})
