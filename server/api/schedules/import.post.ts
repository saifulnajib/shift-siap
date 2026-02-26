import { defineEventHandler, readBody, createError } from 'h3'
import { getSiapUrl, getSiapHeaders } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body || !Array.isArray(body.data) || body.data.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'Data jadwal tidak boleh kosong'
        })
    }

    const jsonBody = JSON.stringify(body.data)

    try {
        const response: any = await $fetch(getSiapUrl('/rest/shift/import_json'), {
            method: 'POST',
            headers: {
                ...getSiapHeaders({ 'Content-Type': 'application/json' }),
            },
            body: jsonBody
        })

        let data = response
        if (typeof response === 'string') {
            try { data = JSON.parse(response) } catch { /* ignore */ }
        }

        return { success: true, data }
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || error.response?.status || 500,
            message: error.data?.message || error.message || 'Gagal mengimpor jadwal'
        })
    }
})
