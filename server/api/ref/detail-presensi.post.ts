import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { pin, id_unit_opd, bulan, tahun } = body;

    if ((!pin && !id_unit_opd) || !bulan || !tahun) {
        throw createError({
            statusCode: 400,
            message: 'Either pin or id_unit_opd is required, along with bulan and tahun'
        });
    }

    // Build the request body dynamically
    const params: Record<string, string> = {
        bulan: String(bulan),
        tahun: String(tahun)
    };

    if (pin) {
        params.pin = String(pin);
    }
    if (id_unit_opd) {
        params.id_unit_opd = String(id_unit_opd);
    }

    // Manually construct x-www-form-urlencoded string
    const urlEncodedBody = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    console.log('Fetching detail presensi for:', params);

    try {
        const response: any = await $fetch('https://siap.tanjungpinangkota.go.id/rest/shift/getDetailPresensi', {
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

        console.log('Detail Presensi API Response (parsed):', data);

        // Extract the presensi array from the nested structure
        const presensiData = data?.data || [];

        return {
            success: true,
            data: presensiData
        };
    } catch (error: any) {
        console.error('Detail Presensi API Error Details:', {
            message: error.message,
            statusCode: error.statusCode,
            data: error.data,
            response: error.response
        });
        throw createError({
            statusCode: error.statusCode || error.response?.status || 500,
            message: error.data?.message || error.message || 'Failed to fetch detail presensi'
        });
    }
});
