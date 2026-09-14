import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { routes } from './infrastructure/http/routes/index.js';
import { githubRoutes } from './infrastructure/http/routes/githubRoutes.js';
import { cardRoutes } from './infrastructure/http/routes/cardRoutes.js';
import { errorHandler } from './infrastructure/http/middleware/errorHandler.js';
import { container } from './config/container.js';
import { HealthController } from './infrastructure/http/controllers/HealthController.js';
import { SESSION_COOKIE_NAME } from './application/services/SessionService.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors({ origin: env.WEB_BASE_URL, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Request logger middleware
app.use((req, res, next) => {
  const hasBearer = Boolean(req.headers.authorization?.startsWith('Bearer '));
  const hasCookie = Boolean(req.cookies?.[SESSION_COOKIE_NAME]);
  const authMode = hasBearer ? 'bearer' : hasCookie ? 'cookie' : 'anonymous';
  logger.info({ method: req.method, path: req.path, authMode }, 'Incoming request');
  next();
});

// Health check endpoint
const healthController = container.resolve(HealthController);
app.get('/health', healthController.check);

// Root route redirect to frontend
app.get('/', (req, res) => {
  res.redirect(env.WEB_BASE_URL || 'https://github.com/theneotic/GitProfileStat');
});

// API Routes
app.use('/api/v1', routes);
app.use('/api', githubRoutes);
app.use('/api', cardRoutes);

// Centralized error handling
app.use(errorHandler);

export { app };
