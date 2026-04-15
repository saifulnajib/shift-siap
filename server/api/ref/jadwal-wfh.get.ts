import { getSiapUrl, getSiapHeaders } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    try {
        const userCookie = getCookie(event, 'user')
        const user = userCookie ? JSON.parse(userCookie) : null
        const id_opd = user?.id_opd

        const path = id_opd ? `/rest/shift/getJadwalWfh/${id_opd}` : '/rest/shift/getJadwalWfh'

        const response = await fetch(getSiapUrl(path), {
            method: 'GET',
            headers: getSiapHeaders(),
        })

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                message: `Failed to fetch jadwal WFH: ${response.statusText}`
            })
        }

        const data = await response.json()
        return data
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch jadwal WFH'
        })
    }
})
