import express, {Request, Response, NextFunction} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRouter from './routes/chat.js'
import healthRouter from './routes/health.js'

// Load environment variables
dotenv.config({ path: '../.env' })

const app = express()

const PORT = process.env["PORT"] || 3000
const CORS_ORIGINS = process.env["CORS_ORIGINS"]?.split(',') || ['http://localhost:5173']

// ============================================
// Middleware
// ============================================

app.use(express.json())

app.use(
  cors({
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// ============================================
// Routes
// ============================================

app.use('/health', healthRouter)
app.use('/chat', chatRouter)

// ============================================
// Error Handling Middleware
// ============================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err);

  const isDevelopment = process.env["NODE_ENV"] !== 'production';

  res.status(500).json({
    error: isDevelopment ? err.message : 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    timestamp: Date.now(),
    ...(isDevelopment && { stack: err.stack }),
  })
})

// ============================================
// Server Startup
// ============================================

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${process.env["NODE_ENV"] || 'development'}`)
  console.log(`🔒 CORS origins: ${CORS_ORIGINS.join(', ')}`);
})

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
