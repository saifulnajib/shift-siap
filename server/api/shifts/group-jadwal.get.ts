import { getSiapUrl, getSiapHeaders } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    try {
        const userCookie = getCookie(event, 'user')
        const user = userCookie ? JSON.parse(userCookie) : null
        const id_opd = user?.id_opd

        if (!id_opd) {
            throw createError({
                statusCode: 401,
                message: 'id_opd tidak ditemukan pada sesi aktif'
            })
        }

        const response = await fetch(getSiapUrl(`/rest/shift/getGroupJadwal/${id_opd}`), {
            method: 'GET',
            headers: getSiapHeaders(),
        })

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                message: `Failed to fetch group jadwal: ${response.statusText}`
            })
        }

        const data = await response.json()
        return data
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch group jadwal'
        })
    }
})
