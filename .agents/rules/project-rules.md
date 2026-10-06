# Movie-Box Project Rules

## Stack & Runtime

- **Backend**: Node.js (ES Modules — `"type": "module"`), Express 5, Mongoose (MongoDB)
- **Frontend**: React (Vite), React Router
- **Auth**: JWT access + refresh tokens, httpOnly cookies, bcrypt password hashing
- **External APIs**: TMDB API (via `TMDB_ACCESS_TOKEN`), Groq AI (via `GROQ_API_KEY`)
- **File Uploads**: Multer (disk → `./public/temp`) → Cloudinary; always delete local temp files after upload/failure
- **Package manager**: npm

## Project Structure

```
movie-box/
├── backend/
│   └── src/
│       ├── server.js          # Entry point: dotenv, DB connect, mount errorHandler, listen
│       ├── app.js             # Express app: cors, json, cookieParser, route mounting
│       ├── db/                # Database connection (connectDB)
│       ├── models/            # Mongoose schemas (PascalCase files: User.js, UserMovie.js)
│       ├── controllers/       # Route handlers (camelCase: user.controller.js)
│       ├── routes/            # Express Router files (camelCase: user.routes.js)
│       ├── middlewares/       # auth, errorHandler, multer (camelCase: *.middleware.js)
│       ├── services/          # External API wrappers (tmdb.service.js)
│       └── utils/             # ApiError, ApiResponse, asyncHandler, cloudinary
├── frontend/                  # React + Vite (to be initialized)
└── .agent/                    # Agent customizations (skills, rules)
```

## Architecture Patterns

- **Response format**: Always use `ApiResponse(statusCode, data, message)` for success and `throw new ApiError(statusCode, message, errors)` for errors.
- **Async handling**: Wrap all controller functions with `asyncHandler(async (req, res) => { ... })` — never use try/catch in controllers.
- **Error handling**: The centralized `errorHandler` middleware at the end of the middleware chain handles all errors. In production, stack traces are hidden.
- **API versioning**: Routes mount under `/api/v1/<resource>` (e.g., `/api/v1/users`).
- **Service layer**: External API calls (TMDB, Groq) go through dedicated service files in `services/`, never directly in controllers.
- **Middleware order in `app.js`**: cors → json → urlencoded → static → cookieParser → routes (routes are imported and mounted after middleware).

## Environment Variables & Secrets

- All secrets live in `backend/.env` (git-ignored). Schema is defined in `backend/.env.example`.
- Access env vars via `process.env.VARIABLE_NAME` (loaded by `dotenv/config` in `server.js`).
- **NEVER** hardcode secrets, API keys, connection strings, or tokens in source code.
- **NEVER** commit `.env` files. Always update `.env.example` with placeholder keys when adding new variables.
- Required vars: `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `TMDB_ACCESS_TOKEN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `PORT`, `CORS_ORIGIN`, `NODE_ENV`.

## Coding Standards

- ES Module syntax only (`import`/`export`), no CommonJS (`require`/`module.exports`).
- No TypeScript — this is a JavaScript project.
- Prefer `const` over `let`; never use `var`.
- Use template literals for string interpolation.
- Name files: `PascalCase` for models, `camelCase.type.js` for everything else (e.g., `user.controller.js`, `auth.middleware.js`).
- Keep functions small and single-purpose.
- No unused variables, imports, or dead code.
- Add meaningful comments only for non-obvious logic; do not comment obvious code.
- Validate all user inputs on the backend before processing.

## Git Practices

- Write clear, imperative commit messages (e.g., `Add user registration endpoint`).
- Do not commit `node_modules/`, `.env`, or `public/temp/` contents.
- Keep commits atomic — one logical change per commit.
