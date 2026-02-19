import { pool } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const { start, end } = query;

    const connection = await pool.getConnection();
    try {
        let sql = `
      SELECT s.*, sh.name as shift_name, sh.color as shift_color, sh.start_time, sh.end_time 
      FROM schedules s 
      JOIN shifts sh ON s.shift_id = sh.id 
      WHERE 1=1
    `;
        const params = [];

        if (start && end) {
            sql += ' AND s.date BETWEEN ? AND ?';
            params.push(start, end);
        }

        const [rows] = await connection.query(sql, params);
        return rows;
    } catch (error) {
        throw createError({ statusCode: 500, message: error.message });
    } finally {
        connection.release();
    }
});
