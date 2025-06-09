const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const config = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tour_company',
  // Дополнительные параметры для улучшения производительности
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 30000, // время простоя клиента
  connectionTimeoutMillis: 2000, // время ожидания соединения
};

module.exports = config; 