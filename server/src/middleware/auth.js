import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[AuthDebug] Header:', authHeader); // DEBUG
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      console.log('[AuthDebug] No token'); // DEBUG
      return res.status(401).json({ error: 'Not authorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('[AuthDebug] Decoded:', decoded); // DEBUG
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('[AuthDebug] User not found for ID:', decoded.id); // DEBUG
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('[AuthDebug] Error:', err.message); // DEBUG
    res.status(401).json({ error: 'Not authorized' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};
