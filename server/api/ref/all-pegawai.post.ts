import { getSiapUrl, getSiapHeaders } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id_opd, id_unit_opd } = body

    if (!id_opd) {
        throw createError({
            statusCode: 400,
            message: 'id_opd is required'
        })
    }

    try {
        const requestBody: any = { id_opd }
        if (id_unit_opd) {
            requestBody.id_unit_opd = id_unit_opd
        }

        const formBody = new URLSearchParams()
        Object.keys(requestBody).forEach(key => {
            formBody.append(key, requestBody[key])
        })

        const response = await fetch(getSiapUrl('/rest/shift/getAllPegawai'), {
            method: 'POST',
            headers: getSiapHeaders(),
            body: formBody.toString()
        })

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                message: `Failed to fetch employees: ${response.statusText}`
            })
        }

        const data = await response.json()
        return data
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch employees'
        })
    }
})
