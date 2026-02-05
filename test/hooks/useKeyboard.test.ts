import { renderHook } from '../utils';
import { useKeyboard } from '../../src/hooks/useKeyboard';

jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    Keyboard: {
      dismiss: jest.fn(),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      removeListener: jest.fn(),
    },
    Platform: {
      ...actual.Platform,
      OS: 'ios',
    },
  };
});

describe('useKeyboard', () => {
  it('should initialize with keyboard hidden', async () => {
    const { result } = await renderHook(() => useKeyboard());
    expect(result.current.isVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);
  });
});
