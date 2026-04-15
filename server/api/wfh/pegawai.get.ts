import { getSiapUrl, getSiapHeaders } from '../../utils/siap'

export default defineEventHandler(async (event) => {
    const user = getCookie(event, 'user') ? JSON.parse(getCookie(event, 'user') || '{}') : null
    const { id_wfh } = getQuery(event)

    const id_opd = user?.id_opd
    if (!id_opd) {
        throw createError({ statusCode: 400, message: 'id_opd not found in session' })
    }

    // Build path: /rest/shift/getPegawaiWfh/{id_opd} or /rest/shift/getPegawaiWfh/{id_opd}/{id_wfh}
    const path = id_wfh
        ? `/rest/shift/getPegawaiWfh/${id_opd}/${id_wfh}`
        : `/rest/shift/getPegawaiWfh/${id_opd}`

    try {
        const response = await fetch(getSiapUrl(path), {
            method: 'GET',
            headers: getSiapHeaders(),
        })

        const text = await response.text()
        if (!response.ok) {
            let msg = text
            try { msg = JSON.parse(text)?.message || text } catch {}
            throw createError({ statusCode: response.status, message: `SIAP error: ${msg}` })
        }

        try { return JSON.parse(text) } catch { return { success: true, raw: text } }
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch pegawai WFH'
        })
    }
})
