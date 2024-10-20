# Приложение для бронирования отелей

Это приложение представляет собой систему для управления бронированием номеров отелей.

## Установка

1. Склонируйте репозиторий:

    ```bash
    git clone <URL репозитория>
    cd <название проекта>


2. Установите зависимости:

    ```bash
    npm install


## Запуск приложения

### Для запуска приложения на хосте:

#### 1. С базой данных на хосте

    Если у вас уже установлена MongoDB на локальном хосте, используйте следующие команды для запуска:

    ```bash
    npm start

#### 2. Если вы хотите использовать Docker для разворачивания приложения и базы данных, выполните следующую команду:

    ```bash
    docker compose up --build




2.3.1. Вход (POST /api/auth/login)

curl -X POST "http://localhost:4000/api/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "email": "user@example.com",
  "password": "userpassword"
}'

Ожидаемый ответ:

{
  "email": "user@example.com",
  "name": "User Name",
  "contactPhone": "string"
}

2.3.3. Регистрация (POST /api/client/register)

curl -X POST "http://localhost:4000/api/client/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "user@example.com",
  "password": "userpassword",
  "name": "New User",
  "contactPhone": "+123456789"
}'

Ожидаемый ответ:

{
  "id": "string",
  "email": "newuser@example.com",
  "name": "New User"
}