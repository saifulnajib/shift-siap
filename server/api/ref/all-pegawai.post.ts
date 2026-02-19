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
        // Prepare request body
        const requestBody: any = { id_opd }
        if (id_unit_opd) {
            requestBody.id_unit_opd = id_unit_opd
        }

        // Convert to x-www-form-urlencoded format
        const formBody = new URLSearchParams()
        Object.keys(requestBody).forEach(key => {
            formBody.append(key, requestBody[key])
        })

        console.log('[getAllPegawai] Fetching with params:', requestBody)

        const response = await fetch('https://siap.tanjungpinangkota.go.id/rest/shift/getAllPegawai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'token': 'D7ypX0Rlg9fSSLr37aogBucOC6QaBIigT9yCb3VJ'
            },
            body: formBody.toString()
        })

        if (!response.ok) {
            console.error('[getAllPegawai] SIAP API Error:', response.status, response.statusText)
            const errorText = await response.text()
            console.error('[getAllPegawai] Error response:', errorText)
            throw createError({
                statusCode: response.status,
                message: `Failed to fetch employees: ${response.statusText}`
            })
        }

        const data = await response.json()
        console.log('[getAllPegawai] Success, total employees:', data.total_count)
        return data
    } catch (error: any) {
        console.error('[getAllPegawai] Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch employees'
        })
    }
})
