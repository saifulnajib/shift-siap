import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { username, password } = body;

    // Manually construct x-www-form-urlencoded string
    const urlEncodedBody = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    try {
        const response: any = await $fetch('https://siap.tanjungpinangkota.go.id/rest/api/loginAdminOpd', {
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

        console.log('Login API Response (parsed):', data);

        if (data && data.loginStatus === true) {
            return { success: true, data: data };
        } else {
            throw createError({
                statusCode: 401,
                message: data?.message || 'Login failed'
            });
        }
    } catch (error) {
        console.error('Login Error:', error);

        // Handle the error type properly
        const statusCode = (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response)
            ? (error.response.status as number)
            : 500;

        throw createError({
            statusCode,
            message: 'Internal Server Error'
        });
    }
});
