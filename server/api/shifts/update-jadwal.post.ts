import { getSiapUrl, getSiapConfig } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id_jadwal, jam_masuk, jam_pulang, user_id } = body

    if (!id_jadwal) {
        throw createError({ statusCode: 400, message: 'id_jadwal diperlukan' })
    }

    const payload = { id_jadwal, jam_masuk, jam_pulang, user_id }
    console.log('[updateJadwal] payload:', JSON.stringify(payload))

    const urlEncodedBody = Object.entries(payload)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')

    try {
        const response = await fetch(getSiapUrl('/rest/shift/updateJadwal'), {
            method: 'POST',
            headers: {
                'token': getSiapConfig().token,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedBody,
        })

        const text = await response.text()
        console.log('[updateJadwal] SIAP response:', response.status, text)

        if (!response.ok) {
            let siapMessage = text
            try { siapMessage = JSON.parse(text)?.message || text } catch {}
            throw createError({
                statusCode: response.status,
                message: `SIAP error: ${siapMessage}`
            })
        }

        try { return JSON.parse(text) } catch { return { success: true, raw: text } }
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Gagal memperbarui jadwal'
        })
    }
})