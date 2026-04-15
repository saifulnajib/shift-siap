import { pool } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
    const user = getCookie(event, 'user') ? JSON.parse(getCookie(event, 'user') || '{}') : null;
    const query = getQuery(event);
    const { start, end, pin } = query;

    const connection = await pool.getConnection();
    try {
        let sql = 'SELECT * FROM wfh_records WHERE 1=1';
        const params: any[] = [];

        // If user is not superadmin, filter by OPD
        if (user && user.id_opd) {
            sql += ' AND id_opd = ?';
            params.push(user.id_opd);
        }

        if (pin) {
            sql += ' AND pin = ?';
            params.push(pin);
        }

        if (start && end) {
            sql += ' AND (start_date <= ? AND end_date >= ?)';
            params.push(end, start);
        }

        sql += ' ORDER BY created_at DESC';

        const [rows] = await connection.query(sql, params);
        return { success: true, data: rows };
    } catch (error: any) {
        throw createError({ statusCode: 500, message: error.message });
    } finally {
        connection.release();
    }
});
