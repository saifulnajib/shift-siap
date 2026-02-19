import { pool } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    // Basic validation
    if (!body.name || !body.start_time || !body.end_time) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields'
        });
    }

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(
            'INSERT INTO shifts (name, start_time, end_time, color) VALUES (?, ?, ?, ?)',
            [body.name, body.start_time, body.end_time, body.color || '#3b82f6'] // Default blue
        );
        return { id: (result as any).insertId, ...body };
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: 'Failed to create shift'
        });
    } finally {
        connection.release();
    }
});
