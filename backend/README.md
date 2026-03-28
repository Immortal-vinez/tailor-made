# Backend Workspace

This folder was added for backend-related work.

Current backend stack is still rooted at the project root:
- Prisma schema: prisma/schema.prisma
- API routes: src/app/api

## Start local Postgres migrations

1. Set DATABASE_URL in .env and .env.local with real password.
2. Run:

```bash
npx prisma migrate dev --name init_postgres
npx prisma generate
```
