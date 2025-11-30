import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import request from 'supertest';
import express, {Application} from 'express';
import healthRouter from '../../src/routes/health.js';

describe('GET /health - Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    // Create minimal Express app for testing
    app = express();
    app.use(express.json());
    app.use('/health', healthRouter);
  });

  it('should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)

    expect(response.body).toHaveProperty('status')
    expect(response.body).toHaveProperty('timestamp')
    expect(response.body).toHaveProperty('uptime')
    expect(response.body).toHaveProperty('environment')
    expect(response.body.status).toBe('ok')
  })
})
