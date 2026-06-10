# Tasks: Steps to initialize repository

Run these commands from the directory where you want the repository created.

1. Create Next.js app (scaffold)

npx create-next-app@latest expense-tracker \
 --typescript \
 --tailwind \
 --eslint \
 --app \
 --src-dir \
 --import-alias "@/\*"

2. Enter the project directory

cd expense-tracker

3. Install dependencies

npm install prisma @prisma/client
npm install bcrypt jsonwebtoken
npm install react-hook-form @hookform/resolvers zod
npm install @types/bcrypt @types/jsonwebtoken -D

4. Initialize Shadcn UI

npx shadcn@latest init

Select during interactive setup:

- Style: Default
- Base color: Neutral
- CSS variables: Yes

5. Initialize Prisma

npx prisma init

6. Update `prisma/schema.prisma` with the MongoDB provider and the models defined in `design.md`.

7. Create `src/lib/prisma.ts` (Prisma client singleton). See `design.md` for snippet.

8. Create `src/lib/auth.ts` with `verifyToken` and `getSession` helpers (use `jsonwebtoken`).

9. Add `proxy.ts` at project root to protect `/dashboard` and `/api` (except `/api/auth/*`).

10. Create `.env` and `.env.example` with keys listed in `design.md`.

11. Update `.gitignore` to include:
    .env
    .env.local
    node_modules/
    .next/

12. Minimal `next.config.ts` (no experimental flags).

13. Verify setup

npx tsc --noEmit
npm run lint
npm run dev

Notes and constraints

- Do NOT implement features, API routes, or UI pages in this change.
- Only create sample starter page
- Ensure all files added for the setup (prisma.ts, auth.ts, proxy.ts) are TypeScript-valid with zero type errors.
