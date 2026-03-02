import { defineEventHandler, getRouterParam, createError } from 'h3'
import { getSiapUrl, getSiapHeaders } from '../../../utils/siap'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        const response: any = await $fetch(getSiapUrl(`/rest/shift/getAllUnitOpd/${id}`), {
            headers: getSiapHeaders()
        })

        return response
    } catch (error: any) {
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Failed to fetch All Unit OPD'
        })
    }
})
