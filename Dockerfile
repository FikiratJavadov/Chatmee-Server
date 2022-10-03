FROM node:16.15.1-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 5000

CMD ["node","app.js"]