import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set in environment variables. Using default (insecure for production)');
}

const JWT_SECRET = process.env.JWT_SECRET || 'replit-legalcrm-pro-jwt-secret-key-change-in-production-2024';
const PORTAL_JWT_SECRET = JWT_SECRET + '-portal';
const SALT_ROUNDS = 10;

export interface PortalAuthUser {
  id: string;
  clientId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PortalAuthRequest extends Request {
  portalUser?: PortalAuthUser;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generatePortalToken(user: PortalAuthUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      clientId: user.clientId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    PORTAL_JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyPortalToken(token: string): PortalAuthUser | null {
  try {
    return jwt.verify(token, PORTAL_JWT_SECRET) as PortalAuthUser;
  } catch (error) {
    return null;
  }
}

export function portalAuthMiddleware(req: PortalAuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.portal_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = verifyPortalToken(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.portalUser = user;
  next();
}

export function optionalPortalAuthMiddleware(req: PortalAuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.portal_token;

  if (token) {
    const user = verifyPortalToken(token);
    if (user) {
      req.portalUser = user;
    }
  }

  next();
}

export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
