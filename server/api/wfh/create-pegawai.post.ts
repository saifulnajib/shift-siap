import { getSiapUrl, getSiapConfig } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id_wfh, user_id, id_opd, pins } = body

    if (!id_wfh) {
        throw createError({ statusCode: 400, message: 'id_wfh is required' })
    }

    try {
        const id_opd_query = id_opd ? `/${id_opd}` : ''
        const jadwalResponse = await fetch(getSiapUrl(`/rest/shift/getJadwalWfh${id_opd_query}`), {
            headers: { 'token': getSiapConfig().token }
        })
        if (jadwalResponse.ok) {
            const jadwalData = await jadwalResponse.json()
            const jadwalList = jadwalData.data || jadwalData || []
            const jadwal = jadwalList.find((j: any) => j.id_wfh === id_wfh || j.id_wfh === Number(id_wfh))
            if (jadwal && jadwal.tanggal_mulai) {
                const start = new Date(jadwal.tanggal_mulai)
                start.setHours(0, 0, 0, 0)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                if (today >= start) {
                    throw createError({ statusCode: 400, message: 'Penambahan pegawai gagal. Jadwal WFH hanya bisa diubah maksimal H-1.' })
                }
            }
        }
    } catch (e: any) {
        if (e.statusCode === 400) throw e;
        console.error('Failed to validate jadwal date in backend:', e)
    }

    const { token } = getSiapConfig()
    const payload = { id_wfh, user_id, id_opd, pins }
    console.log('[createPegawaiWfh] payload:', JSON.stringify(payload))

    try {
        const response = await fetch(getSiapUrl('/rest/shift/createPegawaiWfh'), {
            method: 'POST',
            headers: {
                'token': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const text = await response.text()
        console.log('[createPegawaiWfh] SIAP response:', response.status, text)

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
            message: error.message || 'Failed to create pegawai WFH'
        })
    }
})
