import { pool } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const connection = await pool.getConnection();
    try {
        await connection.query('DELETE FROM shifts WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: 'Failed to delete shift'
        });
    } finally {
        connection.release();
    }
});
