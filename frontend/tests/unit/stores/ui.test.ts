import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  isThinking,
  isStreaming,
  errorMessage,
  currentInput,
  setThinking,
  setStreaming,
  setError,
  clearError,
  setInput,
  clearInput,
  resetUIState,
} from '$lib/stores/ui';

describe('UI Store', () => {
  beforeEach(() => {
    resetUIState();
  });

  describe('initial state', () => {
    it('should initialize isThinking as false', () => {
      expect(get(isThinking)).toBe(false);
    });

    it('should initialize isStreaming as false', () => {
      expect(get(isStreaming)).toBe(false);
    });

    it('should initialize errorMessage as null', () => {
      expect(get(errorMessage)).toBe(null);
    });

    it('should initialize currentInput as empty string', () => {
      expect(get(currentInput)).toBe('');
    });
  });

  describe('setThinking', () => {
    it('should set thinking state to true', () => {
      setThinking(true);
      expect(get(isThinking)).toBe(true);
    });

    it('should set thinking state to false', () => {
      setThinking(true);
      setThinking(false);
      expect(get(isThinking)).toBe(false);
    });
  });

  describe('setStreaming', () => {
    it('should set streaming state to true', () => {
      setStreaming(true);
      expect(get(isStreaming)).toBe(true);
    });

    it('should set streaming state to false', () => {
      setStreaming(true);
      setStreaming(false);
      expect(get(isStreaming)).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      setError('An error occurred');
      expect(get(errorMessage)).toBe('An error occurred');
    });

    it('should update existing error message', () => {
      setError('First error');
      setError('Second error');
      expect(get(errorMessage)).toBe('Second error');
    });

    it('should set error to null', () => {
      setError('Error');
      setError(null);
      expect(get(errorMessage)).toBe(null);
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      setError('Error message');
      clearError();
      expect(get(errorMessage)).toBe(null);
    });

    it('should handle clearing when no error exists', () => {
      clearError();
      expect(get(errorMessage)).toBe(null);
    });
  });

  describe('setInput', () => {
    it('should set input value', () => {
      setInput('Hello World');
      expect(get(currentInput)).toBe('Hello World');
    });

    it('should update existing input', () => {
      setInput('First');
      setInput('Second');
      expect(get(currentInput)).toBe('Second');
    });

    it('should handle empty string', () => {
      setInput('Something');
      setInput('');
      expect(get(currentInput)).toBe('');
    });
  });

  describe('clearInput', () => {
    it('should clear input value', () => {
      setInput('Some text');
      clearInput();
      expect(get(currentInput)).toBe('');
    });

    it('should handle clearing when already empty', () => {
      clearInput();
      expect(get(currentInput)).toBe('');
    });
  });

  describe('resetUIState', () => {
    it('should reset all UI state to initial values', () => {
      setThinking(true);
      setStreaming(true);
      setError('Error');
      setInput('Input text');

      resetUIState();

      expect(get(isThinking)).toBe(false);
      expect(get(isStreaming)).toBe(false);
      expect(get(errorMessage)).toBe(null);
      expect(get(currentInput)).toBe('');
    });

    it('should handle reset when already in initial state', () => {
      resetUIState();

      expect(get(isThinking)).toBe(false);
      expect(get(isStreaming)).toBe(false);
      expect(get(errorMessage)).toBe(null);
      expect(get(currentInput)).toBe('');
    });
  });

  describe('combined state changes', () => {
    it('should handle multiple state changes independently', () => {
      setThinking(true);
      setStreaming(true);
      setError('Error');
      setInput('Test');

      expect(get(isThinking)).toBe(true);
      expect(get(isStreaming)).toBe(true);
      expect(get(errorMessage)).toBe('Error');
      expect(get(currentInput)).toBe('Test');

      setThinking(false);

      expect(get(isThinking)).toBe(false);
      expect(get(isStreaming)).toBe(true);
      expect(get(errorMessage)).toBe('Error');
      expect(get(currentInput)).toBe('Test');
    });
  });
});
