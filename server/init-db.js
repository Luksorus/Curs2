const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Импортируем конфигурацию базы данных
const dbConfig = require('./db/config');
const pool = new Pool(dbConfig);

async function initializeDatabase() {
  try {
    // Создаем директории для загрузки файлов
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    const toursImagesDir = path.join(uploadsDir, 'tours');
    const avatarsDir = path.join(uploadsDir, 'avatars');

    [uploadsDir, toursImagesDir, avatarsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Создана директория: ${dir}`);
      }
    });

    // Применяем основную схему базы данных
    console.log('Применение основной схемы базы данных...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('Схема базы данных успешно применена');

    // Применяем миграции
    console.log('Применение миграций...');
    const migrationsSQL = fs.readFileSync(path.join(__dirname, 'db', 'migrations.sql'), 'utf8');
    await pool.query(migrationsSQL);
    console.log('Миграции успешно применены');

    console.log('База данных успешно инициализирована');
    console.log('Учетные данные администраторов:');
    console.log('1. admin@example.com / admin123');
    console.log('2. admin2@example.com / admin456');
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase(); 