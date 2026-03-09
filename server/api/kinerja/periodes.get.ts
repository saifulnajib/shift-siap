import { defineEventHandler, createError } from 'h3'
import { getSiapUrl, getSiapHeaders } from '../../utils/siap'

export default defineEventHandler(async () => {
    try {
        const response: any = await $fetch(getSiapUrl(`/rest/shift/getBkn`), {
            method: 'GET',
            headers: {
                ...getSiapHeaders(),
            },
            params: {
                path: '/api_kinerja/referensi/periode'
            }
        })

        return response
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || error.response?.status || 500,
            message: error.data?.message || error.message || 'Gagal mengambil data periode'
        })
    }
})
