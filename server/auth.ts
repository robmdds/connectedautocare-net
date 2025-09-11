// auth.ts - Simplified authentication system
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Types
interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    provider: 'local' | 'google' | 'quick';
}

interface AuthRequest extends Request {
    user?: AuthUser;
    isAuthenticated?: () => boolean;
}

// Google OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
);

// Session configuration
export function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "user_sessions",
    });

    return session({
        secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: sessionTtl,
            sameSite: 'lax',
        },
        name: 'tpa.sid', // Custom session name
    });
}

// Authentication middleware
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.session?.user) {
        req.user = req.session.user;
        req.isAuthenticated = () => true;
        return next();
    }

    return res.status(401).json({
        error: "Authentication required",
        redirectTo: "/login"
    });
}

// Optional auth middleware (doesn't block if not authenticated)
export function attachUser(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.session?.user) {
        req.user = req.session.user;
        req.isAuthenticated = () => true;
    } else {
        req.isAuthenticated = () => false;
    }
    next();
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// JWT utilities for stateless tokens (optional)
export function generateJWT(user: AuthUser): string {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
        { expiresIn: '7d' }
    );
}

export function verifyJWT(token: string): AuthUser | null {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-change-in-production') as any;
        return payload;
    } catch {
        return null;
    }
}

// Google OAuth utilities
export function getGoogleAuthUrl(): string {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        include_granted_scopes: true,
    });
}

export async function getGoogleUserInfo(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    return {
        googleId: data.id,
        email: data.email,
        firstName: data.given_name || '',
        lastName: data.family_name || '',
        picture: data.picture,
    };
}

export async function setupAuth(app: Express) {
    app.set("trust proxy", 1);
    app.use(getSession());

    // Register endpoint
    app.post('/api/auth/register', async (req: AuthRequest, res: Response) => {
        try {
            const { email, password, firstName, lastName } = req.body;

            // Validation
            if (!email || !password || !firstName) {
                return res.status(400).json({ error: 'Email, password, and first name are required' });
            }

            if (password.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters' });
            }

            // Check if user exists
            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            // Hash password and create user
            const hashedPassword = await hashPassword(password);
            const newUser = await storage.upsertUser({
                id: crypto.randomUUID(),
                email,
                firstName,
                lastName: lastName || '',
                role: 'user',
                passwordHash: hashedPassword,
                provider: 'local',
            });

            // Create session
            const authUser: AuthUser = {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                provider: 'local'
            };

            req.session.user = authUser;

            res.json({
                success: true,
                message: 'Registration successful',
                user: {
                    id: authUser.id,
                    email: authUser.email,
                    firstName: authUser.firstName,
                    lastName: authUser.lastName,
                    role: authUser.role
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    });

    // Login endpoint
    app.post('/api/auth/login', async (req: AuthRequest, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Find user
            const user = await storage.getUserByEmail(email);
            if (!user || !user.passwordHash) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const isValidPassword = await verifyPassword(password, user.passwordHash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Create session
            const authUser: AuthUser = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                provider: 'local'
            };

            req.session.user = authUser;

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: authUser.id,
                    email: authUser.email,
                    firstName: authUser.firstName,
                    lastName: authUser.lastName,
                    role: authUser.role
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    // Google OAuth login
    app.get('/api/auth/google', (req: AuthRequest, res: Response) => {
        const authUrl = getGoogleAuthUrl();
        res.redirect(authUrl);
    });

    // Google OAuth callback
    app.get('/api/auth/google/callback', async (req: AuthRequest, res: Response) => {
        try {
            const { code } = req.query;
            if (!code) {
                return res.redirect('/login?error=no_code');
            }

            const googleUser = await getGoogleUserInfo(code as string);

            // Find or create user
            let user = await storage.getUserByEmail(googleUser.email!);
            if (!user) {
                user = await storage.upsertUser({
                    id: crypto.randomUUID(),
                    email: googleUser.email!,
                    firstName: googleUser.firstName,
                    lastName: googleUser.lastName,
                    role: 'user',
                    provider: 'google',
                    googleId: googleUser.googleId,
                });
            }

            // Create session
            const authUser: AuthUser = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                provider: 'google'
            };

            req.session.user = authUser;
            res.redirect('/admin'); // Redirect to admin after successful login

        } catch (error) {
            console.error('Google OAuth error:', error);
            res.redirect('/login?error=oauth_failed');
        }
    });

    // Quick admin access (for development)
    app.post('/api/auth/admin-access', async (req: AuthRequest, res: Response) => {
        try {
            const authUser: AuthUser = {
                id: 'quick-admin-user',
                email: 'admin@tpaplatform.com',
                firstName: 'Quick',
                lastName: 'Admin',
                role: 'admin',
                provider: 'quick'
            };

            req.session.user = authUser;

            res.json({
                success: true,
                message: 'Quick admin access granted',
                user: {
                    id: authUser.id,
                    email: authUser.email,
                    firstName: authUser.firstName,
                    lastName: authUser.lastName,
                    role: authUser.role
                }
            });

        } catch (error) {
            console.error('Quick admin access error:', error);
            res.status(500).json({ error: 'Quick admin access failed' });
        }
    });

    // Get current user
    app.get('/api/auth/user', attachUser, async (req: AuthRequest, res: Response) => {
        try {
            if (req.isAuthenticated?.()) {
                res.json({
                    id: req.user!.id,
                    email: req.user!.email,
                    firstName: req.user!.firstName,
                    lastName: req.user!.lastName,
                    role: req.user!.role,
                    provider: req.user!.provider
                });
            } else {
                res.status(401).json({ message: "Not authenticated" });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ message: "Failed to fetch user" });
        }
    });

    // Logout
    app.post('/api/auth/logout', async (req: AuthRequest, res: Response) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destruction error:', err);
                    return res.status(500).json({ error: 'Logout failed' });
                }
                res.clearCookie('tpa.sid');
                res.json({ success: true, message: 'Logged out successfully' });
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    });

    // Change password
    app.post('/api/auth/change-password', requireAuth, async (req: AuthRequest, res: Response) => {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current and new passwords are required' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'New password must be at least 8 characters' });
            }

            const user = await storage.getUser(req.user!.id);
            // @ts-ignore
            if (!user?.passwordHash) {
                return res.status(400).json({ error: 'Cannot change password for this account type' });
            }

            // @ts-ignore
            const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            const hashedPassword = await hashPassword(newPassword);
            // @ts-ignore
            await storage.updateUser(user.id, { passwordHash: hashedPassword });

            res.json({ success: true, message: 'Password changed successfully' });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    });

    // Debug endpoint
    app.get('/api/auth/debug', attachUser, (req: AuthRequest, res: Response) => {
        res.json({
            isAuthenticated: req.isAuthenticated?.() || false,
            user: req.user || null,
            sessionExists: !!req.session?.user,
            sessionId: req.sessionID
        });
    });
}