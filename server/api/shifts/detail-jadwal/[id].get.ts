import { getSiapUrl, getSiapHeaders } from '../../../utils/siap'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'id_group_jadwal diperlukan'
        })
    }

    try {
        const response = await fetch(getSiapUrl(`/rest/shift/getDetailJadwal/${id}`), {
            method: 'GET',
            headers: getSiapHeaders(),
        })

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                message: `Failed to fetch detail jadwal: ${response.statusText}`
            })
        }

        const data = await response.json()
        return data
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch detail jadwal'
        })
    }
})
