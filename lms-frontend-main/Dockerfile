# Используем базовый образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

RUN npm i -g serve

# Копируем остальные файлы
COPY . .

# Собираем проект
RUN npm run build

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD [ "serve", "-s", "dist" ]