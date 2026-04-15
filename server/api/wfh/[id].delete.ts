import { pool } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing ID parameter'
        });
    }

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query('DELETE FROM wfh_records WHERE id = ?', [id]);
        
        if ((result as any).affectedRows === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'WFH record not found'
            });
        }

        return {
            success: true,
            message: 'WFH record deleted successfully'
        };
    } catch (error: any) {
        throw createError({ statusCode: 500, message: error.message });
    } finally {
        connection.release();
    }
});
