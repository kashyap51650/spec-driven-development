# Tasks: Add Authentication (Login & Register)

Overview: Implement the login and register feature following the project's architecture. Each task is small and verifiable.

Look into expense-tracker folder and apply in that

1. Types

- [x] Create `src/types/auth.ts` with `User`, `RegisterInput`, `LoginInput`, `JwtPayload`.

2. Validation

- [x] Create `src/server/validations/auth.validation.ts` using Zod and export inferred types.

3. Repository

- [x] Create `src/server/repositories/auth.repository.ts` with:
  - `findUserByEmail(email: string)`
  - `findUserById(id: string)`
  - `createUser({ name, email, hashedPassword })`
  - `verifyUserPassword(email, plainPassword)` (keep hashed password access inside repository)

4. Service

- [x] Create `src/server/services/auth.service.ts` with `register` and `login` implementing validation, hashing, token signing.

5. Auth lib

- [x] Add `signToken` to `src/lib/auth.ts` to complement existing `verifyToken` and `getSession`.

6. Server Actions

- [x] Create `src/actions/auth.actions.ts` with `registerAction`, `loginAction`, `logoutAction`. Actions set/delete cookie and redirect.

7. Pages & UI

- [x] Install shadcn components (card, form, input, label, button) using the CLI.
- [x] Add `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx` using React Hook Form with `zodResolver` and the server actions.

8. Shared Component

- [x] Add `src/features/auth/components/SubmitButton.tsx` (client) wrapping Shadcn `Button`.

9. Middleware

- [x] Update `middleware.ts` to also redirect `/login` and `/register` to `/dashboard` when a valid token exists. Ensure `/dashboard/*` redirects unauthenticated users to `/login`.

10. Tests & verification

- [x] Run `npx tsc --noEmit` and `npm run lint` and fix any errors.
- [ ] Manual verification: register/login flows redirect to `/dashboard` and middleware redirects correctly.

Notes

- Implementations must follow the repository/service separation and not import Prisma outside repositories.
- Use explicit TypeScript return types on exported functions.
