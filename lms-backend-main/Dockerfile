FROM node:18-alpine AS builder

RUN apk update && apk add --no-cache openssl3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# --- Production stage ---
FROM node:18-alpine

RUN apk update && apk add --no-cache openssl3

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p uploads

EXPOSE 3002

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
