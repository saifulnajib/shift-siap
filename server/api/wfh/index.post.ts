import { pool } from '~~/server/utils/db';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { pin, nip, nama, start_date, end_date, keterangan, id_unit_opd, id_opd } = body;

    if (!pin || !nama || !start_date || !end_date) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields (pin, nama, start_date, end_date)'
        });
    }

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(`
            INSERT INTO wfh_records (
                pin, nip, nama, start_date, end_date, keterangan, id_unit_opd, id_opd
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [pin, nip, nama, start_date, end_date, keterangan, id_unit_opd, id_opd]);

        return {
            success: true,
            message: 'WFH record created successfully',
            data: { id: (result as any).insertId }
        };
    } catch (error: any) {
        throw createError({ statusCode: 500, message: error.message });
    } finally {
        connection.release();
    }
});
