# Туристическая фирма

Веб-приложение для туристической компании, позволяющее просматривать и бронировать туры.

## Технологии

- Frontend:
  - React
  - Redux Toolkit
  - Styled Components
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express
  - PostgreSQL
  - JWT для аутентификации

## Требования

- Node.js 16+
- PostgreSQL 12+
- npm или yarn

## Установка

1. Клонируйте репозиторий:
```bash
git clone [url-репозитория]
cd [название-папки]
```

2. Установите зависимости:
```bash
# Установка зависимостей клиента
npm install

# Установка зависимостей сервера
cd server
npm install
```

3. Настройте базу данных:
```bash
# В директории server
node create-db.js
node init-db.js
```

4. Создайте файл .env в корневой директории и настройте переменные окружения:
```env
# Настройки базы данных PostgreSQL
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tour_company

# Секретный ключ для JWT
JWT_SECRET=ваш-секретный-ключ

# Порт для сервера
PORT=3002

# CORS origin
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## Запуск

1. Запустите сервер:
```bash
cd server
npm start
```

2. В другом терминале запустите клиент:
```bash
npm run dev
```

## Роли пользователей

1. Администратор:
   - Управление пользователями
   - Управление турами
   - Управление заказами
   - Email: admin@example.com
   - Пароль: admin123

2. Гид:
   - Создание и управление турами
   - Просмотр участников

3. Пользователь:
   - Просмотр туров
   - Бронирование
   - Управление профилем

## Структура проекта

```
/
├── src/                # Клиентский код
│   ├── components/     # React компоненты
│   ├── pages/         # Страницы
│   ├── store/         # Redux store
│   ├── api/           # API клиент
│   └── styles/        # Стили
│
└── server/            # Серверный код
    ├── db/           # База данных
    ├── routes/       # Маршруты API
    ├── middleware/   # Middleware
    └── public/       # Статические файлы
```

