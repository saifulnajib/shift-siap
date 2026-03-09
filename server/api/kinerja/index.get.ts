import { defineEventHandler, getQuery, createError } from 'h3'
import { getSiapUrl, getSiapHeaders } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const bulan = query.bulan
    const tahun = query.tahun

    if (!bulan || !tahun) {
        throw createError({
            statusCode: 400,
            message: 'Bulan dan Tahun harus diisi'
        })
    }

    try {
        // Here we build the e-kinerja path based on the user's provided structure
        // Endpoint: /api_kinerja/laporan/penilaian/{tahun}/{id bulan}
        const eKinerjaPath = `/api_kinerja/laporan/penilaian/${tahun}/${bulan}`

        const response: any = await $fetch(getSiapUrl(`/rest/shift/getBkn`), {
            method: 'GET',
            headers: {
                ...getSiapHeaders(),
            },
            params: {
                path: eKinerjaPath
            }
        })

        let data = response
        if (typeof response === 'string') {
            try { data = JSON.parse(response) } catch { /* ignore */ }
        }

        return data
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || error.response?.status || 500,
            message: error.data?.message || error.message || 'Gagal mengambil data kinerja'
        })
    }
})
