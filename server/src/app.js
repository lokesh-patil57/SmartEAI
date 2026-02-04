import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import healthRoutes from './routes/health.routes.js';
import matchRoutes from './routes/match.routes.js';
import improveRoutes from './routes/improve.routes.js';
import exportRoutes from './routes/export.routes.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import parseRoutes from './routes/parse.routes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/ping-debug', (req, res) => res.send('pong-debug')); // DEBUG ROUTE


// Routes
app.use('/health', healthRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/improve', improveRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/parse', parseRoutes);

// Backward-compatible aliases for client (so client can use same base URL + /match, /improve, /download)
app.use('/match', matchRoutes);
app.use('/improve', improveRoutes);
app.use('/download', exportRoutes);
app.use('/resumes', documentRoutes);

// 404
app.use(notFound);
// Central error handler
app.use(errorHandler);

export default app;
