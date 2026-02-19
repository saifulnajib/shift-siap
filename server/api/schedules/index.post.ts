import { pool } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { employee_id, shift_id, date } = body;

    if (!employee_id || !shift_id || !date) {
        throw createError({ statusCode: 400, message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    try {
        // Check if exists
        const [exists]: any = await connection.query(
            'SELECT id FROM schedules WHERE employee_id = ? AND date = ?',
            [employee_id, date]
        );

        if (exists.length > 0) {
            // Update
            await connection.query('UPDATE schedules SET shift_id = ? WHERE id = ?', [shift_id, exists[0].id]);
        } else {
            // Insert
            await connection.query('INSERT INTO schedules (employee_id, shift_id, date) VALUES (?, ?, ?)', [employee_id, shift_id, date]);
        }

        return { success: true };
    } catch (error) {
        throw createError({ statusCode: 500, message: error.message });
    } finally {
        connection.release();
    }
});
