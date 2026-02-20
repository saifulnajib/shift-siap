import { defineEventHandler, readBody, createError } from 'h3';
import { getSiapUrl, getSiapHeaders } from '../../utils/siap';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { pin, id_unit_opd, bulan, tahun } = body;

    if ((!pin && !id_unit_opd) || !bulan || !tahun) {
        throw createError({
            statusCode: 400,
            message: 'Either pin or id_unit_opd is required, along with bulan and tahun'
        });
    }

    const params: Record<string, string> = {
        bulan: String(bulan),
        tahun: String(tahun)
    };
    if (pin) params.pin = String(pin);
    if (id_unit_opd) params.id_unit_opd = String(id_unit_opd);

    const urlEncodedBody = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    try {
        const response: any = await $fetch(getSiapUrl('/rest/shift/getDetailPresensi'), {
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

        const presensiData = data?.data || [];
        return { success: true, data: presensiData };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || error.response?.status || 500,
            message: error.data?.message || error.message || 'Failed to fetch detail presensi'
        });
    }
});
