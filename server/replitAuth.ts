import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  try {
    console.log('Upserting user with claims:', claims);
    await storage.upsertUser({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
    console.log('User upserted successfully');
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      console.log('Auth verify callback triggered');
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      console.log('User verification completed successfully');
      verified(null, user);
    } catch (error) {
      console.error('Auth verify error:', error);
      verified(error);
    }
  };

  // Add localhost and connectedautocare.net for development and production
  const domains = process.env.REPLIT_DOMAINS!.split(",");
  const allDomains = [...domains, "localhost", "connectedautocare.net"];
  
  console.log('Setting up auth strategies for domains:', allDomains);
  
  for (const domain of allDomains) {
    let callbackURL;
    if (domain === "localhost") {
      callbackURL = `http://${domain}:5000/api/callback`;
    } else if (domain === "connectedautocare.net") {
      callbackURL = `https://${domain}/api/callback`;
    } else {
      callbackURL = `https://${domain}/api/callback`;
    }
    
    console.log(`Registering auth strategy for domain: ${domain} with callback: ${callbackURL}`);
    
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    console.log(`Auth callback for hostname: ${req.hostname}`);
    console.log(`Request URL: ${req.url}`);
    console.log(`Query params:`, req.query);
    
    const authStrategy = `replitauth:${req.hostname}`;
    console.log(`Using auth strategy: ${authStrategy}`);
    
    // Enhanced error handling for OAuth callback
    try {
      passport.authenticate(authStrategy, (err: any, user: any, info: any) => {
        if (err) {
          console.error('Auth callback error:', err);
          // Instead of showing error, redirect to Quick Login
          return res.redirect('/login?oauth_error=1');
        }
        
        if (!user) {
          console.log('Auth callback failed - no user:', info);
          // Redirect to Quick Login instead of OAuth login
          return res.redirect('/login?oauth_failed=1');
        }
        
        req.logIn(user, (err) => {
          if (err) {
            console.error('Login error:', err);
            // Redirect to Quick Login on login error
            return res.redirect('/login?login_error=1');
          }
          
          console.log('Auth successful, redirecting to home');
          return res.redirect('/');
        });
      })(req, res, next);
    } catch (error) {
      console.error('Critical OAuth callback error:', error);
      // Fallback to Quick Login on any critical error
      return res.redirect('/login?critical_error=1');
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
