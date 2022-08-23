FROM node:18.6.0

WORKDIR /app

COPY package.json ./

RUN npx pnpm install

COPY tsconfig.json ./
COPY src src

CMD ["npx", "pnpm", "start"]