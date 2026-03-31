FROM node:22-alpine
WORKDIR /app
RUN corepack enable pnpm

COPY package*.json ./

RUN pnpm install

COPY . .

EXPOSE 3000

RUN pnpm run build
CMD ["pnpm","run","start:prod"]