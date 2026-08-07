import { defineEventHandler, createError, getCookie } from 'h3'
import { getSiapUrl, getSiapHeaders } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const user = getCookie(event, 'user') ? JSON.parse(getCookie(event, 'user') || '{}') : null
    const id_opd = user?.id_opd

    if (!id_opd) {
        throw createError({ statusCode: 400, message: 'id_opd not found in session' })
    }

    try {
        const response: any = await $fetch(getSiapUrl(`/rest/shift/getChildrenOpd/${id_opd}`), {
            headers: getSiapHeaders()
        })

        return response
    } catch (error: any) {
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Failed to fetch UPTD (Children OPD)'
        })
    }
})
