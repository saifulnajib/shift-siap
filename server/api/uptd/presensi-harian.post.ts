import { defineEventHandler, readBody, createError } from 'h3'
import { getSiapUrl, getSiapConfig } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id_opd, page = 1, limit = 10, name = '', datemin, datemax } = body

    if (!id_opd) {
        throw createError({ statusCode: 400, message: 'id_opd is required' })
    }

    const { token } = getSiapConfig()

    // Hitung offset dari page & limit
    const pageNum  = Math.max(1, Number(page))
    const limitNum = Math.max(1, Number(limit))
    const offset   = (pageNum - 1) * limitNum

    // Build multipart/form-data using FormData (supported natively in Node 18+)
    const form = new FormData()
    form.append('id_opd', String(id_opd))
    form.append('page',   String(pageNum))
    form.append('limit',  String(limitNum))
    form.append('offset', String(offset))
    if (name)    form.append('name',    String(name))
    if (datemin) form.append('datemin', String(datemin))
    if (datemax) form.append('datemax', String(datemax))

    try {
        console.log('[presensi-harian] Requesting:', getSiapUrl('/rest/shift/getPresensiHarianUptd'))
        console.log('[presensi-harian] Params: id_opd=%s page=%s limit=%s offset=%s name=%s datemin=%s datemax=%s',
            id_opd, pageNum, limitNum, offset, name, datemin, datemax)

        const response = await fetch(getSiapUrl('/rest/shift/getPresensiHarianUptd'), {
            method: 'POST',
            headers: { token },
            body: form,
        })

        const rawText = await response.text()
        console.log('[presensi-harian] HTTP status:', response.status)
        console.log('[presensi-harian] Raw response (first 500 chars):', rawText.slice(0, 500))

        if (response.status !== 200) {
            throw createError({
                statusCode: response.status,
                message: `External API returned HTTP ${response.status}: ${rawText.slice(0, 200)}`,
            })
        }

        let json: any
        try {
            json = JSON.parse(rawText)
        } catch {
            throw createError({ statusCode: 502, message: `Invalid JSON from external API: ${rawText.slice(0, 200)}` })
        }

        console.log('[presensi-harian] json.success=%s json.status=%s json.total_count=%s data.length=%s',
            json?.success, json?.status, json?.total_count, Array.isArray(json?.data) ? json.data.length : 'not array')

        // Beberapa API mengembalikan status string "200" bukan angka
        const apiStatus = Number(json?.status)
        if (!json?.success || apiStatus !== 200) {
            throw createError({
                statusCode: 502,
                message: json?.message || `External API returned success=${json?.success} status=${json?.status}`,
            })
        }

        const totalCount: number = Number(json.total_count ?? json.totalCount ?? 0)
        const totalPages: number = limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1
        const rawData: any[] = Array.isArray(json.data) ? json.data : []

        const data = rawData.map((item: any) => ({
            id_presensi:   item.id_presensi   ?? null,
            nama_pegawai:  item.nama_pegawai  ?? null,
            nama_opd:      item.nama_opd      ?? null,
            nip:           item.nip           ?? null,
            pin:           item.pin           ?? null,
            tgl_presensi:  item.tgl_presensi  ?? null,
            waktu_masuk:   item.waktu_masuk   ?? null,
            waktu_pulang:  item.waktu_pulang  ?? null,
            selfie_masuk:  item.selfie_masuk  ?? null,
            selfie_pulang: item.selfie_pulang ?? null,
            alasan:        item.alasan        ?? null,
            bukti_surat:   item.bukti_surat   ?? null,
        }))

        return {
            success: true,
            total_count: totalCount,
            total_pages: totalPages,
            current_page: pageNum,
            limit: limitNum,
            offset,
            data,
        }
    } catch (error: any) {
        console.error('[presensi-harian] Error:', error?.message)
        throw createError({
            statusCode: error.statusCode ?? error.response?.status ?? 500,
            message: error.message ?? 'Failed to fetch presensi harian UPTD',
        })
    }
})
