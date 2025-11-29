import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * GET /health
 * Returns server status and uptime
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    environment: process.env["NODE_ENV"] || 'development',
  });
});

export default router;
