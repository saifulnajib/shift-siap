import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { getSiapUrl, getSiapHeaders } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id_opd, tahun, bulan } = body

    if (!id_opd || !tahun || !bulan) {
        throw createError({ statusCode: 400, message: 'id_opd, tahun, dan bulan are required' })
    }

    try {
        const form = new URLSearchParams()
        form.append('id_opd', String(id_opd))
        form.append('tahun', String(tahun))
        form.append('bulan', String(bulan))

        const response = await fetch(getSiapUrl('/rest/shift/rekapPresensiBulanan'), {
            method: 'POST',
            headers: getSiapHeaders(),
            body: form.toString()
        })

        const rawText = await response.text()
        let json: any
        try {
            json = JSON.parse(rawText)
        } catch {
            throw createError({ statusCode: 502, message: `Invalid JSON: ${rawText.slice(0, 200)}` })
        }

        return json
    } catch (error: any) {
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Failed to fetch rekap bulanan'
        })
    }
})
