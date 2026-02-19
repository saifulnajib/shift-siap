import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { id_unit_opd } = body;

    if (!id_unit_opd) {
        throw createError({
            statusCode: 400,
            message: 'id_unit_opd is required'
        });
    }

    // Manually construct x-www-form-urlencoded string
    const urlEncodedBody = `id_unit_opd=${encodeURIComponent(id_unit_opd)}`;

    console.log('Fetching employees for unit OPD:', id_unit_opd);

    try {
        const response: any = await $fetch('https://siap.tanjungpinangkota.go.id/rest/shift/getPegawai', {
            method: 'POST',
            headers: {
                'token': 'D7ypX0Rlg9fSSLr37aogBucOC6QaBIigT9yCb3VJ',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(urlEncodedBody).toString()
            },
            body: urlEncodedBody
        });

        let data = response;
        if (typeof response === 'string') {
            try {
                data = JSON.parse(response);
            } catch (e) {
                console.error('Failed to parse response JSON:', e);
            }
        }

        console.log('Pegawai API Response (parsed):', data);

        // Extract the employee array from the nested structure
        const employees = data?.data || [];

        return {
            success: true,
            data: employees
        };
    } catch (error: any) {
        console.error('Pegawai API Error Details:', {
            message: error.message,
            statusCode: error.statusCode,
            data: error.data,
            response: error.response
        });
        throw createError({
            statusCode: error.statusCode || error.response?.status || 500,
            message: error.data?.message || error.message || 'Failed to fetch employees'
        });
    }
});
