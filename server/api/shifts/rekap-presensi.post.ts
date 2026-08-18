import { getSiapUrl, getSiapConfig } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { pin, tanggal_mulai, tanggal_selesai } = body

    if (!pin || !tanggal_mulai || !tanggal_selesai) {
        throw createError({ statusCode: 400, message: 'pin, tanggal_mulai, dan tanggal_selesai diperlukan' })
    }

    const payload = { pin, tanggal_mulai, tanggal_selesai }
    console.log('[rekapPresensi] payload:', JSON.stringify(payload))

    const urlEncodedBody = Object.entries(payload)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')

    try {
        const response = await fetch(getSiapUrl('/rest/shift/rekapPresensi'), {
            method: 'POST',
            headers: {
                'token': getSiapConfig().token,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedBody,
        })

        const text = await response.text()
        console.log('[rekapPresensi] SIAP response:', response.status, text.slice(0, 500))

        if (!response.ok) {
            let siapMessage = text
            try { siapMessage = JSON.parse(text)?.message || text } catch {}
            throw createError({
                statusCode: response.status,
                message: `SIAP error: ${siapMessage}`
            })
        }

        try { return JSON.parse(text) } catch { return { success: false, message: text } }
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Gagal mengambil data presensi'
        })
    }
})