const path = require('path');

module.exports = {
  port: process.env.PORT || 3002,
  database: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  static: {
    images: path.join(__dirname, 'public/images'),
    public: path.join(__dirname, 'public'),
  }
}; 