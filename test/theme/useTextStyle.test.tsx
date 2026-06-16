import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { ThemeManager } from '../../src/theme/ThemeManager';
import { useTextStyle } from '../../src/theme/useTextStyle';
import { lightTheme } from '../../src/theme/defaultThemes';

jest.mock('../../src/theme/ThemeManager');

describe('useTextStyle', () => {
  let mockManager: any;

  beforeEach(() => {
    mockManager = {
      init: jest.fn().mockResolvedValue(undefined),
      configure: jest.fn(),
      getTheme: jest.fn().mockReturnValue(lightTheme),
      getMode: jest.fn().mockReturnValue('system'),
      getActiveMode: jest.fn().mockReturnValue('light'),
      setMode: jest.fn(),
      addThemeListener: jest.fn(() => jest.fn()),
      dispose: jest.fn(),
    };
    (ThemeManager.getInstance as jest.Mock).mockReturnValue(mockManager);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider manager={mockManager}>{children}</ThemeProvider>
  );

  it('returns the variant style with the theme text color applied', async () => {
    const { result } = await renderHook(() => useTextStyle('h1'), { wrapper });

    expect(result.current.fontSize).toBe(lightTheme.typography.h1.fontSize);
    expect(result.current.fontWeight).toBe(lightTheme.typography.h1.fontWeight);
    expect(result.current.color).toBe(lightTheme.colors.text);
  });

  it('lets overrides win over the defaults', async () => {
    const { result } = await renderHook(
      () => useTextStyle('caption', { color: '#abcabc' }),
      { wrapper },
    );

    expect(result.current.color).toBe('#abcabc');
    expect(result.current.fontSize).toBe(lightTheme.typography.caption.fontSize);
  });
});
