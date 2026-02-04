import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

function tokenFor(user) {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: user._id }, secret, { expiresIn });
}

export async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create({ email, password, name });
    const token = tokenFor(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name, resumeText: user.resumeText || '' } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    const token = tokenFor(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, resumeText: user.resumeText || '' } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = req.user;
    res.json({ user: { id: user._id, email: user.email, name: user.name, resumeText: user.resumeText || '' } });
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
    res.json({ user: { id: user._id, email: user.email, name: user.name, resumeText: user.resumeText || '' } });
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
    res.json({ user: { id: user._id, email: user.email, name: user.name, resumeText: user.resumeText || '' } });
  } catch (err) {
    next(err);
  }
}
