import { pool } from '~~/server/utils/db';

export default defineEventHandler(async () => {
  const connection = await pool.getConnection();
  try {
    // Create Shifts Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        color VARCHAR(7) DEFAULT '#3b82f6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Schedules Table
    // status: scheduled, present, absent, leave, off
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(255) NOT NULL, -- Assuming employee_id from SIAP might be string or int, using string to be safe
        shift_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('scheduled', 'present', 'absent', 'leave', 'off') DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shift_id) REFERENCES shifts(id),
        UNIQUE KEY unique_schedule (employee_id, date)
      )
    `);

    // Create WFH Records Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wfh_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pin VARCHAR(50) NOT NULL,
        nip VARCHAR(50),
        nama VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        keterangan TEXT,
        id_unit_opd VARCHAR(100),
        id_opd VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to initialize database',
      message: error.message
    });
  } finally {
    connection.release();
  }
});
