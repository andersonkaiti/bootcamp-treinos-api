# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server with hot reload (tsx --watch, loads .env)
pnpm run format       # Format and lint with Biome

npx prisma generate   # Regenerate Prisma client after schema changes
npx prisma migrate dev # Apply migrations and regenerate client
```

No test suite is configured.

## Architecture

**Stack:** Fastify 5 · TypeScript · Prisma (PostgreSQL) · Better Auth · Zod · Vercel AI SDK (Gemini 2.5 Flash)

**Layered structure:**

- `src/routes/` — HTTP handlers with Zod request/response schemas via `fastify-type-provider-zod`
- `src/use-cases/` — Business logic, called directly from routes
- `src/lib/` — Singletons: `auth.ts` (Better Auth), `db.ts` (Prisma client), `swagger.ts` (Scalar docs)
- `src/schemas/index.ts` — All Zod schemas for the API
- `src/errors/` — Custom error classes; `error-handler.ts` maps them to HTTP status codes
- `src/ai/` — AI system prompt (`system.ts`) and tool definitions (`tools.ts`)

**Authentication:** Better Auth with Bearer plugin. All protected routes call `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })` and throw `UnauthorizedError` if no session. Auth endpoints are served at `/api/auth/*`.

**Database schema** lives in `prisma/models/` (split files, composed in `prisma/schema.prisma`). Core domain: `User → WorkoutPlan → WorkoutDay → WorkoutExercise` and `WorkoutDay → WorkoutSession`. After editing any `.prisma` file, run `npx prisma generate`.

**AI route (`POST /ai`):** Streams responses using Vercel AI SDK. Gemini has access to 4 tools that call use-case functions directly: `getUserTrainData`, `updateUserTrainData`, `getWorkoutPlans`, `createWorkoutPlan`.

**Error handling:** Throw the appropriate custom error class from `src/errors/`; the global handler in `src/error-handler.ts` serializes it. Unhandled errors become 500.

**Code style:** Biome enforces 2-space indent, single quotes, no semicolons, 80-char line width. Run `pnpm run format` before committing.

## Environment

Required `.env` variables:

```
PORT=8080
DATABASE_URL=postgresql://...
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
BETTER_AUTH_URL=http://localhost:8080
GOOGLE_GENERATIVE_AI_API_KEY=...
```

API docs available at `http://localhost:8080/docs` (Scalar/OpenAPI).

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/) combined with the emoji pattern from [iuricode/padroes-de-commits](https://github.com/iuricode/padroes-de-commits).

### Format

```
<emoji> <type>(<scope>): <description>
```

### Types and Emojis

| Emoji | Code              | Type       | Description                                                  |
| ----- | ----------------- | ---------- | ------------------------------------------------------------ |
| ✨    | `:sparkles:`      | `feat`     | New feature                                                  |
| 🐛    | `:bug:`           | `fix`      | Bug fix                                                      |
| 📚    | `:books:`         | `docs`     | Documentation only changes                                   |
| 🧪    | `:test_tube:`     | `test`     | Adding or updating tests                                     |
| 📦    | `:package:`       | `build`    | Build system or dependency changes                           |
| ⚡    | `:zap:`           | `perf`     | Performance improvements                                     |
| 👌    | `:ok_hand:`       | `style`    | Code formatting, missing semicolons, lint (no logic change)  |
| ♻️    | `:recycle:`       | `refactor` | Code change that neither fixes a bug nor adds a feature      |
| 🔧    | `:wrench:`        | `chore`    | Build tasks, admin config, package updates                   |
| 🧱    | `:bricks:`        | `ci`       | CI/CD configuration changes                                  |
| 🗃️    | `:card_file_box:` | `raw`      | Config files, data, feature flags, parameters                |
| 🧹    | `:broom:`         | `cleanup`  | Remove commented code, unnecessary snippets, general cleanup |
| 🗑️    | `:wastebasket:`   | `remove`   | Delete obsolete or unused files, directories, or features    |
| 🎉    | `:tada:`          | `init`     | Initial commit                                               |
| 💥    | `:boom:`          | `fix`      | Reverting ineffective changes                                |
| 💄    | `:lipstick:`      | `feat`     | UI/CSS styling                                               |
| 💡    | `:bulb:`          | `docs`     | Comments in source code                                      |
| 🚀    | `:rocket:`        |            | Deploy                                                       |
| 🔒️    | `:lock:`          |            | Security fixes                                               |

### Examples

```bash
git commit -m ":tada: init: initial commit"
git commit -m ":sparkles: feat: add login page"
git commit -m ":bug: fix: infinite loop on line 50"
git commit -m ":recycle: refactor: convert to arrow functions"
git commit -m ":books: docs: update README"
git commit -m ":zap: perf: improve response time"
git commit -m ":bricks: ci: update Dockerfile"
git commit -m ":test_tube: test: add unit tests for auth"
git commit -m ":broom: cleanup: remove commented-out code"
git commit -m ":wastebasket: remove: delete unused files"
```

### Rules

- Use the **imperative mood** in the description (e.g., "add feature" not "added feature")
- Keep the description **short** (max ~72 chars)
- Use `BREAKING CHANGE:` in the commit body/footer for breaking changes
- Scope is optional but recommended (e.g., `feat(auth):`, `fix(home):`)
- Do **not** add `Co-Authored-By:` trailers to commits
