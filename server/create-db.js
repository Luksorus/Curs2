const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function createDatabase() {

  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres' 
  });

  try {
    await client.connect();
    
 
    const result = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = $1
    `, [process.env.DB_NAME || 'tour_company']);

    if (result.rows.length === 0) {

      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'tour_company'}`);
      console.log(`База данных ${process.env.DB_NAME || 'tour_company'} успешно создана`);
    } else {
      console.log(`База данных ${process.env.DB_NAME || 'tour_company'} уже существует`);
    }
  } catch (error) {
    console.error('Ошибка при создании базы данных:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase(); 