import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'siap_shift'
    });

    try {
        // Create shifts table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS shifts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                color VARCHAR(7) DEFAULT '#000000'
            );
        `);

        // Create schedules table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_name VARCHAR(255),
                shift_id INT,
                date DATE,
                FOREIGN KEY (shift_id) REFERENCES shifts(id)
            );
        `);

        // Seed shifts
        const [shifts] = await connection.query('SELECT COUNT(*) as count FROM shifts');
        if (shifts[0].count === 0) {
            await connection.query(`
                INSERT INTO shifts (name, start_time, end_time, color) VALUES 
                ('Pagi', '08:00:00', '16:00:00', '#3b82f6'),
                ('Sore', '16:00:00', '00:00:00', '#10b981'),
                ('Malam', '00:00:00', '08:00:00', '#f59e0b');
            `);
            console.log('Seeded shifts');
        }

        // Seed schedules (mock data for Feb 2026)
        const [schedules] = await connection.query('SELECT COUNT(*) as count FROM schedules');
        if (schedules[0].count === 0) {
            await connection.query(`
                INSERT INTO schedules (employee_name, shift_id, date) VALUES 
                ('Budi Santoso', 1, '2026-02-01'),
                ('Siti Aminah', 2, '2026-02-01'),
                ('Rudi Hartono', 3, '2026-02-02'),
                ('Dewi Lestari', 1, '2026-02-03');
            `);
            console.log('Seeded schedules');
        }

        console.log('Tables setup completed');
    } catch (error) {
        console.error('Error setting up tables:', error);
    } finally {
        await connection.end();
    }
}

setup();
