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
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

dotenv.config();

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_URLS || '')
	.split(',')
	.map((value) => value.trim())
	.filter(Boolean);

const corsOptions = {
	credentials: true,
	origin(origin, callback) {
		if (!origin) {
			callback(null, true);
			return;
		}

		if (!configuredOrigins.length || configuredOrigins.includes(origin)) {
			callback(null, true);
			return;
		}

		callback(new Error('Origin not allowed by CORS'));
	},
};

// Middleware
app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));


// Routes
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/improve', improveRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/parse', parseRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/application', applicationRoutes);

// 404
app.use(notFound);
// Central error handler
app.use(errorHandler);

export default app;
