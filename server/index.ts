import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            // Use console.log instead of log() for serverless
            console.log(logLine);
        }
    });

    next();
});

// Initialize the app
const initializeApp = async () => {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        console.error("Server error:", err);
        res.status(status).json({ message });
    });

    // Only run local server in development
    if (process.env.NODE_ENV === "development") {
        await setupVite(app, server);

        const port = parseInt(process.env.PORT || '5000', 10);
        server.listen({
            port,
            host: "0.0.0.0",
            reusePort: true,
        }, () => {
            console.log(`serving on port ${port}`);
        });
    }
    // In production (Vercel), skip static serving and server setup

    return app;
};

// For Vercel serverless
let appPromise: Promise<express.Application> | null = null;

export default async (req: Request, res: Response) => {
    if (!appPromise) {
        appPromise = initializeApp();
    }

    const app = await appPromise;
    return app(req, res);
};

// For local development
if (process.env.NODE_ENV === "development") {
    initializeApp();
}