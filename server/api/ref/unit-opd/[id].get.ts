import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    try {
        const response: any = await $fetch(`https://siap.tanjungpinangkota.go.id/rest/shift/getUnitOpd/${id}`, {
            headers: {
                'token': 'D7ypX0Rlg9fSSLr37aogBucOC6QaBIigT9yCb3VJ'
            }
        })

        return response
    } catch (error: any) {
        console.error('Error fetching Unit OPD:', error)
        throw createError({
            statusCode: error.response?.status || 500,
            message: 'Failed to fetch Unit OPD'
        })
    }
})
