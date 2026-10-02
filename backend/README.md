# Backend README: running with Postgres + Prisma

Requirements:
- Docker & Docker Compose OR Node.js + Postgres locally

Run with Docker Compose (recommended for development):

1) Start services
   docker compose up --build

2) Generate Prisma client and run migrations (if running locally instead of docker):
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run dev

3) The backend will be available at http://localhost:4000

Seeding: the server runs a seed on startup if the database is empty.

Environment variables (.env):
- DATABASE_URL (example in root .env.example)
- JWT_SECRET
- PORT
