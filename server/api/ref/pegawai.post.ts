import { defineEventHandler, readBody, createError } from 'h3';
import { getSiapUrl, getSiapHeaders } from '../../utils/siap';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { id_unit_opd } = body;

    if (!id_unit_opd) {
        throw createError({
            statusCode: 400,
            message: 'id_unit_opd is required'
        });
    }

    const urlEncodedBody = `id_unit_opd=${encodeURIComponent(id_unit_opd)}`;

    try {
        const response: any = await $fetch(getSiapUrl('/rest/shift/getPegawai'), {
            method: 'POST',
            headers: {
                ...getSiapHeaders(),
                'Content-Length': Buffer.byteLength(urlEncodedBody).toString()
            },
            body: urlEncodedBody
        });

        let data = response;
        if (typeof response === 'string') {
            try {
                data = JSON.parse(response);
            } catch (e) { /* ignore parse error */ }
        }

        const employees = data?.data || [];
        return { success: true, data: employees };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || error.response?.status || 500,
            message: error.data?.message || error.message || 'Failed to fetch employees'
        });
    }
});
