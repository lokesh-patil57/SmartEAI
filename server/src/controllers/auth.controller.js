import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';

const googleClient = new OAuth2Client();

function tokenFor(user) {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: user._id }, secret, { expiresIn });
}

function serializeUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    resumeText: user.resumeText || '',
    avatarUrl: user.avatarUrl || '',
    authProvider: user.googleId ? 'google' : 'local',
  };
}

function getGoogleAudiences() {
  const raw = process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '';
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

async function verifyGoogleCredential(credential) {
  const audiences = getGoogleAudiences();
  if (!audiences.length) {
    const error = new Error('Google OAuth is not configured on the server');
    error.statusCode = 503;
    throw error;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: audiences,
  });

  return ticket.getPayload();
}

export async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create({ email, password, name });
    const token = tokenFor(user);
    res.status(201).json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.password) return res.status(401).json({ error: 'Please continue with Google sign-in for this account' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const token = tokenFor(user);
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { credential } = req.body;
    const payload = await verifyGoogleCredential(credential);

    if (!payload?.email || !payload?.sub) {
      return res.status(400).json({ error: 'Invalid Google account payload' });
    }
    if (!payload.email_verified) {
      return res.status(400).json({ error: 'Google account email is not verified' });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        email,
        googleId,
        name: payload.name || payload.given_name || '',
        avatarUrl: payload.picture || '',
      });
    } else {
      user.googleId = user.googleId || googleId;
      if (!user.name && payload.name) user.name = payload.name;
      if (payload.picture) user.avatarUrl = payload.picture;
      await user.save();
    }

    const token = tokenFor(user);
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = req.user;
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileResume(req, res, next) {
  try {
    const { resumeText } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeText: (resumeText || '').slice(0, 100000) },
      { new: true }
    ).select('-password');
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = (name || '').trim().slice(0, 200);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}
