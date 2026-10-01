import crypto from 'crypto';
import { Database } from './db.js';

const AUTH_SECRET = process.env.JWT_SECRET || 'srmap-csed-portal-secret-key-2025';

// Stateless HMAC OTP Challenge Helpers (Serverless Resilient)
export function createOtpChallenge(email, otp) {
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const clean = email.toLowerCase().trim();
  const cleanOtp = otp.toString().trim();
  const data = `${clean}:${cleanOtp}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex');
  const payload = {
    email: clean,
    expiresAt,
    hmac
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyOtpChallenge(email, otp, challengeToken) {
  try {
    if (!challengeToken) return false;
    const jsonStr = Buffer.from(challengeToken, 'base64').toString('utf-8');
    const { email: tokenEmail, expiresAt, hmac } = JSON.parse(jsonStr);
    
    const clean = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (tokenEmail.toLowerCase() !== clean) return false;
    if (Date.now() > expiresAt) return false;
    
    const expectedData = `${tokenEmail.toLowerCase()}:${cleanOtp}:${expiresAt}`;
    const expectedHmac = crypto.createHmac('sha256', AUTH_SECRET).update(expectedData).digest('hex');
    return hmac === expectedHmac;
  } catch (err) {
    return false;
  }
}

// Simple lightweight signed session token
export function generateToken(user) {
  const payload = {
    email: user.email,
    name: user.name,
    role: user.role,
    issuedAt: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function parseToken(tokenStr) {
  try {
    if (!tokenStr) return null;
    const jsonStr = Buffer.from(tokenStr, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonStr);
    // Token validity: 30 days
    if (Date.now() - payload.issuedAt > 30 * 24 * 3600 * 1000) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// Authentication middleware
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  const user = parseToken(token);
  req.user = user;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required. Please log in with your @srmap.edu.in email." });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Only the Class Representative / Admin can perform this action." });
  }
  next();
}
