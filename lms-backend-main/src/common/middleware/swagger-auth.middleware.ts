import { Request, Response, NextFunction } from 'express';

/**
 * Basic-auth middleware for Swagger docs.
 * Activates only if SWAGGER_USER and SWAGGER_PASSWORD env vars are set.
 * Safe to register unconditionally — returns next() if credentials not configured.
 */
export function swaggerBasicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = process.env.SWAGGER_USER;
  const pass = process.env.SWAGGER_PASSWORD;

  // If creds are not configured -> do nothing (used in dev).
  if (!user || !pass) {
    return next();
  }

  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Basic ')) {
    const base64 = auth.slice(6).trim();
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    const [u, p] = decoded.split(':');
    if (u === user && p === pass) {
      return next();
    }
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
  res.status(401).send('Authentication required');
}
