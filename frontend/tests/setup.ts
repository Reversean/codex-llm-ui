// Frontend Test Setup
// This file runs before all tests

import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';

beforeAll(() => {
  // Setup code that runs once before all tests
  // Mock browser APIs if needed
});

afterEach(() => {
  // Cleanup after each test
  // Clean up DOM, clear mocks, etc.
});

afterAll(() => {
  // Cleanup code that runs once after all tests
});
