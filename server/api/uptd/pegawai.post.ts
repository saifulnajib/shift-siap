import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { getSiapUrl, getSiapConfig } from '../../utils/siap'

/**
 * Daftar Pegawai UPTD
 * POST /api/uptd/pegawai
 * Body: { id_opd?, page?, limit?, name? }
 * Jika id_opd tidak dikirim, ambil dari sesi aktif user.
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { page = 1, limit = 25, name = '' } = body

    // Ambil id_opd dari body atau fallback ke sesi aktif
    let id_opd = body.id_opd
    if (!id_opd) {
        const userCookie = getCookie(event, 'user')
        const sessionUser = userCookie ? JSON.parse(userCookie) : null
        id_opd = sessionUser?.id_opd
    }

    if (!id_opd) {
        throw createError({ statusCode: 400, message: 'id_opd is required' })
    }

    const { token } = getSiapConfig()

    const pageNum  = Math.max(1, Number(page))
    const limitNum = Math.max(1, Number(limit))
    const offset   = (pageNum - 1) * limitNum

    const form = new FormData()
    form.append('id_opd', String(id_opd))
    form.append('page',   String(pageNum))
    form.append('limit',  String(limitNum))
    form.append('offset', String(offset))
    if (name) form.append('name', String(name))

    try {
        const response = await fetch(getSiapUrl('/rest/shift/getPnsUptd'), {
            method:  'POST',
            headers: { token },
            body:    form,
        })

        const rawText = await response.text()

        if (response.status !== 200) {
            throw createError({
                statusCode: response.status,
                message:    `External API error ${response.status}: ${rawText.slice(0, 200)}`,
            })
        }

        let json: any
        try {
            json = JSON.parse(rawText)
        } catch {
            throw createError({ statusCode: 502, message: `Invalid JSON: ${rawText.slice(0, 200)}` })
        }

        const apiStatus = Number(json?.status)
        if (!json?.success || apiStatus !== 200) {
            throw createError({
                statusCode: 502,
                message:    json?.message || `API error: success=${json?.success} status=${json?.status}`,
            })
        }

        const totalCount: number = Number(json.total_count ?? json.totalCount ?? 0)
        const totalPages: number = limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1
        const rawData: any[]    = Array.isArray(json.data) ? json.data : []

        const data = rawData.map((item: any, idx: number) => ({
            no:           offset + idx + 1,
            nip:          item.nip          ?? null,
            nama:         item.nama         ?? null,
            id_opd:       item.id_opd       ?? null,
            grup_eselon:  item.grup_eselon  ?? null,
            id_gol:       item.id_gol       ?? null,
            nama_opd:     item.nama_opd     ?? null,
            parent_opd:   item.parent_opd   ?? null,
            golongan:     item.GOLONGAN     ?? null,
            pangkat:      item.PANGKAT      ?? null,
        }))

        return {
            success:      true,
            total_count:  totalCount,
            total_pages:  totalPages,
            current_page: pageNum,
            limit:        limitNum,
            data,
        }
    } catch (error: any) {
        console.error('[pegawai-uptd] Error:', error?.message)
        throw createError({
            statusCode: error.statusCode ?? 500,
            message:    error.message    ?? 'Failed to fetch pegawai UPTD',
        })
    }
})
