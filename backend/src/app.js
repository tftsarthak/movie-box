import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

// Serve static frontend files
// Use the native ES modules property
const __dirname = import.meta.dirname;
app.use(express.static(path.join(__dirname, '../public')));

app.use(cookieParser())

//routes import
import movieRouter from './routes/movie.routes.js'
import authRouter from './routes/auth.routes.js'
import accountRouter from './routes/account.routes.js'

//routes declaration
app.use("/api/v1/movies", movieRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/account", accountRouter)

// SPA fallback for client-side routing (React Router)
app.get('{*path}', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});


export { app }