import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import request from 'supertest';
import express, {Application} from 'express';
import chatRouter from '../../src/routes/chat.js';

describe('POST /chat/generate - Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    // Create minimal Express app for testing
    app = express();
    app.use(express.json());
    app.use('/chat', chatRouter);
  });

  it('should return 200 for valid message', async () => {
    const response = await request(app)
      .post('/chat/generate')
      .send({message: 'Send nudes'})
      .expect(200)

    expect(response.body).toHaveProperty('message')
    expect(response.body.message.length).toBeGreaterThan(0)
  })

  it('should return 400 for empty message', async () => {
    const response = await request(app)
      .post('/chat/generate')
      .send({message: ''})
      .expect(400);

    expect(response.body.error).toMatch(/empty|required/i);
  })

  it('should return 400 for whitespace-only message', async () => {
    const response = await request(app)
      .post('/chat/generate')
      .send({message: '    \n\t    '})
      .expect(400);

    expect(response.body.error).toMatch(/empty|required/i);
  })
})
