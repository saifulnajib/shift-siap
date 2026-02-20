import { defineEventHandler, readBody, createError } from 'h3';
import { getSiapUrl, getSiapHeaders } from '../../utils/siap';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { username, password } = body;

    // Manually construct x-www-form-urlencoded string
    const urlEncodedBody = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    try {
        const response: any = await $fetch(getSiapUrl('/rest/api/loginAdminOpd'), {
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

        if (data && data.loginStatus === true) {
            return { success: true, data: data };
        } else {
            throw createError({
                statusCode: 401,
                message: data?.message || 'Login failed'
            });
        }
    } catch (error) {
        const statusCode = (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response)
            ? (error.response.status as number)
            : 500;

        throw createError({
            statusCode,
            message: 'Internal Server Error'
        });
    }
});
