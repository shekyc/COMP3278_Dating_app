FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm@11.25.0 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["sh", "-c", "node --import tsx scripts/ensure-db.ts && node --import tsx src/server/index.ts"]
