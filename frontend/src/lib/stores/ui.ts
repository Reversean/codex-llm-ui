import { writable } from 'svelte/store';

/*
 * UI State Store
 * Manages UI-related state (loading indicators, errors, input state)
 */

// Loading states
export const isThinking = writable<boolean>(false);
export const isStreaming = writable<boolean>(false);

// Error state
export const errorMessage = writable<string | null>(null);

// Current input state
export const currentInput = writable<string>('');

/**
 * Set thinking state (LLM is processing)
 * @param thinking - Whether LLM is thinking
 */
export function setThinking(thinking: boolean): void {
  isThinking.set(thinking);
}

/**
 * Set streaming state (LLM is streaming response)
 * @param streaming - Whether response is streaming
 */
export function setStreaming(streaming: boolean): void {
  isStreaming.set(streaming);
}

/**
 * Set error message
 * @param error - Error message or null to clear
 */
export function setError(error: string | null): void {
  errorMessage.set(error);
}

/**
 * Clear error message
 */
export function clearError(): void {
  errorMessage.set(null);
}

/**
 * Set current input value
 * @param value - Input value
 */
export function setInput(value: string): void {
  currentInput.set(value);
}

/**
 * Clear current input
 */
export function clearInput(): void {
  currentInput.set('');
}

/**
 * Reset all UI state
 */
export function resetUIState(): void {
  isThinking.set(false);
  isStreaming.set(false);
  errorMessage.set(null);
  currentInput.set('');
}
