import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import chatRouter from './routes/chat.js';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env["PORT"] || 3000;
const CORS_ORIGINS = process.env["CORS_ORIGINS"]?.split(',') || ['http://localhost:5173'];

// ============================================
// Middleware
// ============================================

// CORS configuration
app.use(
  cors({
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging (development)
if (process.env["NODE_ENV"] !== 'production') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Routes
// ============================================

app.use('/health', healthRouter);
app.use('/api/chat', chatRouter);

// ============================================
// Error Handling Middleware
// ============================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    code: 'NOT_FOUND',
    timestamp: Date.now(),
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err);

  // Don't expose internal error details in production
  const isDevelopment = process.env["NODE_ENV"] !== 'production';

  res.status(500).json({
    error: isDevelopment ? err.message : 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    timestamp: Date.now(),
    ...(isDevelopment && { stack: err.stack }),
  });
});

// ============================================
// Server Startup
// ============================================

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env["NODE_ENV"] || 'development'}`);
  console.log(`🔒 CORS origins: ${CORS_ORIGINS.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
