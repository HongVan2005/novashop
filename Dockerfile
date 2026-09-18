FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN cd apps/api && npm install
RUN cd apps/api && npx prisma generate

EXPOSE 4000

CMD ["node", "apps/api/src/server.js"]
