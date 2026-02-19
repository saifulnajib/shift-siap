import { pool } from '~~/server/utils/db';

export default defineEventHandler(async () => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT * FROM shifts ORDER BY start_time ASC');
        return rows;
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch shifts'
        });
    } finally {
        connection.release();
    }
});
