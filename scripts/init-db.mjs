import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function init() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    });

    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'siap_shift'}\`;`);
        console.log(`Database '${process.env.DB_NAME || 'siap_shift'}' created or already exists.`);
    } catch (error) {
        console.error('Error creating database:', error);
    } finally {
        await connection.end();
    }
}

init();
