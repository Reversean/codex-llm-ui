import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import ChatInput from '$lib/components/ChatInput.svelte';

describe('ChatInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render textarea and send button', () => {
    render(ChatInput);

    const textarea = screen.getByPlaceholderText(/ask anything/i);
    const button = screen.getByRole('button');

    expect(textarea).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('should update value when typing', async () => {
    render(ChatInput);

    const textarea = screen.getByPlaceholderText(/ask anything/i) as HTMLTextAreaElement;

    await fireEvent.input(textarea, { target: { value: 'Hello LLM' } });

    expect(textarea.value).toBe('Hello LLM');
  });

  it('should call onSubmit when send button is clicked', async () => {
    const onSubmit = vi.fn();
    render(ChatInput, { props: { onSubmit } });

    const textarea = screen.getByPlaceholderText(/ask anything/i);
    const button = screen.getByRole('button');

    await fireEvent.input(textarea, { target: { value: 'Test message' } });
    await fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledWith('Test message');
  });

  it('should call onSubmit when Enter key is pressed without Shift', async () => {
    const onSubmit = vi.fn();
    render(ChatInput, { props: { onSubmit } });

    const textarea = screen.getByPlaceholderText(/ask anything/i);

    await fireEvent.input(textarea, { target: { value: 'Test message' } });
    await fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(onSubmit).toHaveBeenCalledWith('Test message');
  });

  it('should not call onSubmit when Enter key is pressed with Shift', async () => {
    const onSubmit = vi.fn();
    render(ChatInput, { props: { onSubmit } });

    const textarea = screen.getByPlaceholderText(/ask anything/i);

    await fireEvent.input(textarea, { target: { value: 'Test message' } });
    await fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should not submit when message is empty', async () => {
    const onSubmit = vi.fn();
    render(ChatInput, { props: { onSubmit } });

    const button = screen.getByRole('button');

    await fireEvent.click(button);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should not submit when message is only whitespace', async () => {
    const onSubmit = vi.fn();
    render(ChatInput, { props: { onSubmit } });

    const textarea = screen.getByPlaceholderText(/ask anything/i);
    const button = screen.getByRole('button');

    await fireEvent.input(textarea, { target: { value: '   ' } });
    await fireEvent.click(button);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should clear input after successful submit', async () => {
    const onSubmit = vi.fn();
    render(ChatInput, { props: { onSubmit } });

    const textarea = screen.getByPlaceholderText(/ask anything/i) as HTMLTextAreaElement;
    const button = screen.getByRole('button');

    await fireEvent.input(textarea, { target: { value: 'Test message' } });
    await fireEvent.click(button);

    expect(textarea.value).toBe('');
  });

  it('should disable input and button when disabled prop is true', () => {
    const onSubmit = () => {};
    render(ChatInput, { props: { disabled: true, onSubmit } });

    const textarea = screen.getByPlaceholderText(/ask anything/i) as HTMLTextAreaElement;
    const button = screen.getByRole('button') as HTMLButtonElement;

    expect(textarea.disabled).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('should show different placeholder when thinking', () => {
    const onSubmit = () => {};
    render(ChatInput, { props: { disabled: true, onSubmit } });

    const textarea = screen.getByPlaceholderText(/thinking/i);
    expect(textarea).toBeInTheDocument();
  });

  it('should handle multiline input', async () => {
    const onSubmit = vi.fn();
    render(ChatInput, { props: { onSubmit } });

    const textarea = screen.getByPlaceholderText(/ask anything/i);

    await fireEvent.input(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } });
    await fireEvent.click(screen.getByRole('button'));

    expect(onSubmit).toHaveBeenCalledWith('Line 1\nLine 2\nLine 3');
  });

  it('should trim whitespace from message before submitting', async () => {
    const onSubmit = vi.fn();
    render(ChatInput, { props: { onSubmit } });

    const textarea = screen.getByPlaceholderText(/ask anything/i);

    await fireEvent.input(textarea, { target: { value: '  Test message  ' } });
    await fireEvent.click(screen.getByRole('button'));

    expect(onSubmit).toHaveBeenCalledWith('Test message');
  });
});
