import { test, expect } from '@playwright/test';

test.describe('Chat Interface - User Story 1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display empty chat interface on load', async ({ page }) => {
    await expect(page.getByText(/start a conversation/i)).toBeVisible();

    const chatInput = page.getByPlaceholder(/ask anything/i);
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toBeEnabled();
  });

  test('should send message and receive response', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    await chatInput.fill('Hello, what is TypeScript?');
    await sendButton.click();

    await expect(page.getByText('Hello, what is TypeScript?')).toBeVisible();

    await expect(page.getByTestId('thinking-indicator')).toBeVisible();

    await expect(page.getByTestId('thinking-indicator')).not.toBeVisible({
      timeout: 10000,
    });

    const llmResponse = page.locator('[data-sender="llm"]').first();
    await expect(llmResponse).toBeVisible();
    await expect(llmResponse).not.toBeEmpty();
  });

  test('should show thinking indicator while waiting for response', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    await chatInput.fill('Test question');
    await sendButton.click();

    await expect(page.getByTestId('thinking-indicator')).toBeVisible();
  });

  test('should stream response in real-time', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    await chatInput.fill('Explain something');
    await sendButton.click();

    await page.waitForSelector('[data-sender="llm"]', { timeout: 10000 });

    const llmMessage = page.locator('[data-sender="llm"]').first();
    await expect(llmMessage.locator('[data-testid="streaming-cursor"]')).toBeVisible();

    await expect(llmMessage.locator('[data-testid="streaming-cursor"]')).not.toBeVisible({
      timeout: 15000,
    });
  });

  test('should disable input while thinking or streaming', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    await chatInput.fill('Test message');
    await sendButton.click();

    await expect(chatInput).toBeDisabled();
    await expect(sendButton).toBeDisabled();

    await page.waitForSelector('[data-sender="llm"]', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('[data-testid="streaming-cursor"]', { state: 'hidden', timeout: 15000 });

    await expect(chatInput).toBeEnabled();
    await expect(sendButton).toBeEnabled();
  });

  test('should clear input after sending message', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    await chatInput.fill('Test message');
    await sendButton.click();

    await expect(chatInput).toHaveValue('');
  });

  test('should not send empty messages', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /send/i });

    const messageCountBefore = await page.locator('[data-message-id]').count();
    await sendButton.click();
    const messageCountAfter = await page.locator('[data-message-id]').count();

    expect(messageCountAfter).toBe(messageCountBefore);
  });

  test('should send message with Enter key', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);

    await chatInput.fill('Test with Enter');
    await chatInput.press('Enter');

    await expect(page.getByText('Test with Enter')).toBeVisible();
  });

  test('should not send message with Shift+Enter', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);

    await chatInput.fill('Line 1');
    await chatInput.press('Shift+Enter');
    await chatInput.type('Line 2');

    const value = await chatInput.inputValue();
    expect(value).toContain('\n');
  });

  test('should display user and LLM messages with different styling', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    await chatInput.fill('Hello');
    await sendButton.click();

    const userMessage = page.locator('[data-sender="user"]').first();
    await expect(userMessage).toBeVisible();

    await page.waitForSelector('[data-sender="llm"]', { timeout: 10000 });
    const llmMessage = page.locator('[data-sender="llm"]').first();
    await expect(llmMessage).toBeVisible();

    const userBg = await userMessage.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    const llmBg = await llmMessage.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    expect(userBg).not.toBe(llmBg);
  });

  test('should auto-scroll to latest message', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    for (let i = 1; i <= 5; i++) {
      await chatInput.fill(`Message ${i}`);
      await sendButton.click();
      await page.waitForTimeout(1000);
    }

    const lastMessage = page.locator('[data-sender="user"]').last();
    await expect(lastMessage).toBeInViewport();
  });

  test('should handle API errors gracefully', async ({ page, context }) => {
    await context.route('**/api/chat', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    const chatInput = page.getByPlaceholder(/ask anything/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    await chatInput.fill('This will error');
    await sendButton.click();

    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should maintain message history', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/ask anything/i);
    const sendButton = page.getByRole('button', { name: /send/i });

    await chatInput.fill('First message');
    await sendButton.click();
    await page.waitForTimeout(2000);

    await chatInput.fill('Second message');
    await sendButton.click();

    await expect(page.getByText('First message')).toBeVisible();
    await expect(page.getByText('Second message')).toBeVisible();
  });
});
