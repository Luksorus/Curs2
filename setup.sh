#!/bin/bash

echo "Установка зависимостей клиентской части..."
npm install

echo "Установка зависимостей серверной части..."
cd server
npm install

echo "Настройка базы данных..."
# Проверяем наличие PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL не установлен. Пожалуйста, установите PostgreSQL перед продолжением."
    exit 1
fi

# Создаем базу данных и применяем схему
echo "Создание базы данных..."
node create-db.js

echo "Применение схемы базы данных..."
node init-db.js

echo "Установка завершена!"
echo "Для запуска сервера: cd server && npm start"
echo "Для запуска клиента: npm run dev" 