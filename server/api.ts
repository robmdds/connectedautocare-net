import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware for API requests
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    });
    next();
});

// Initialize app with routes
let appPromise: Promise<express.Application> | null = null;

async function initializeApp(): Promise<express.Application> {
    if (!appPromise) {
        appPromise = (async () => {
            // Register your routes
            await registerRoutes(app);

            // Error handler
            app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
                const status = err.status || err.statusCode || 500;
                const message = err.message || "Internal Server Error";
                console.error("Server error:", err);
                res.status(status).json({ message });
            });

            return app;
        })();
    }
    return appPromise;
}

// Vercel serverless function handler
export default async function handler(req: Request, res: Response) {
    try {
        const app = await initializeApp();
        return app(req, res);
    } catch (error: any) {
        console.error("Handler error:", error);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}