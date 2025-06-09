@echo off
echo Установка зависимостей клиентской части...
call npm install

echo Установка зависимостей серверной части...
cd server
call npm install

echo Настройка базы данных...
REM Проверяем наличие PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL не установлен. Пожалуйста, установите PostgreSQL перед продолжением.
    exit /b 1
)

echo Создание базы данных...
node create-db.js

echo Применение схемы базы данных...
node init-db.js

echo Установка завершена!
echo Для запуска сервера: cd server ^&^& npm start
echo Для запуска клиента: cd .. ^&^& npm run dev

pause 