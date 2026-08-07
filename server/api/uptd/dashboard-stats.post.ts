import { defineEventHandler, readBody, createError } from 'h3'
import { getSiapUrl, getSiapConfig } from '../../utils/siap'
import { format } from 'date-fns'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id_opd, tanggal } = body

    if (!id_opd) {
        throw createError({ statusCode: 400, message: 'id_opd is required' })
    }

    const { token } = getSiapConfig()

    // Default ke hari ini jika tanggal tidak dikirim
    const targetDate = tanggal || format(new Date(), 'yyyy-MM-dd')

    const form = new FormData()
    form.append('id_opd',  String(id_opd))
    form.append('tanggal', targetDate)

    try {
        const response = await fetch(getSiapUrl('/rest/shift/getDashboardUptd'), {
            method: 'POST',
            headers: { token },
            body: form,
        })

        const rawText = await response.text()
        if (response.status !== 200) {
            throw createError({ statusCode: response.status, message: `External API error: ${rawText.slice(0, 200)}` })
        }

        let json: any
        try { json = JSON.parse(rawText) } catch {
            throw createError({ statusCode: 502, message: `Invalid JSON: ${rawText.slice(0, 200)}` })
        }

        if (!json?.success || json?.status !== 200) {
            throw createError({ statusCode: 502, message: json?.message || 'API error' })
        }

        const data = json.data || {}
        const summary = data.summary || {}
        const rekap = Array.isArray(data.rekap_per_uptd) ? data.rekap_per_uptd : []

        return {
            success: true,
            stats: {
                total_pegawai: summary.total_pegawai || 0,
                total_hadir: summary.total_hadir || 0,
                total_belum_hadir: summary.total_belum_hadir || 0,
                pct_hadir: parseFloat(summary.persentase_hadir) || 0,
                total_opd: rekap.length
            },
            opd_chart: rekap
                .sort((a, b) => b.persentase - a.persentase)
                .slice(0, 10)
                .map(r => ({
                    nama_opd: r.nama_opd,
                    total: r.total_hadir,
                    max: r.total_pegawai,
                    pct: r.persentase
                })),
            rekap_all: rekap
        }
    } catch (error: any) {
        console.error('[dashboard-stats] Error:', error?.message)
        throw createError({
            statusCode: error.statusCode ?? 500,
            message: error.message ?? 'Failed to fetch dashboard data',
        })
    }
})
