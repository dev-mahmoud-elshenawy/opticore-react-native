import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useResponsive } from '../../src/hooks/useResponsive';
import { ConfigContext } from '../../src/providers/ConfigContext';
import { useWindowDimensions } from 'react-native';

// Mock useWindowDimensions
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useWindowDimensions: jest.fn(),
}));

describe('useResponsive with Context', () => {
  const mockUseWindowDimensions = useWindowDimensions as jest.MockedFunction<
    typeof useWindowDimensions
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWindowDimensions.mockReturnValue({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    });
  });

  const wrapper = ({ children, breakpoints }: { children: React.ReactNode; breakpoints: any }) => (
    <ConfigContext.Provider value={{ responsive: breakpoints }}>{children}</ConfigContext.Provider>
  );

  it('should use default breakpoints when no context or params provided', async () => {
    const { result } = await renderHook(() => useResponsive());

    // Defaults: small: 360, medium: 768, large: 1024
    // Width 375: isSmall=false, isMedium=true
    expect(result.current.isSmall).toBe(false);
    expect(result.current.isMedium).toBe(true);
  });

  it('should use context breakpoints', async () => {
    const breakpoints = { small: 400, medium: 800, large: 1200 };

    const { result } = await renderHook(() => useResponsive(), {
      wrapper: ({ children }) => wrapper({ children, breakpoints }),
    });

    // Width 375 < 400: isSmall=true
    expect(result.current.isSmall).toBe(true);
    expect(result.current.isMedium).toBe(false);
  });

  it('should prioritize param breakpoints over context', async () => {
    const contextBreakpoints = { small: 400, medium: 800, large: 1200 };
    const paramBreakpoints = { small: 300, medium: 600, large: 900 };

    const { result } = await renderHook(() => useResponsive(paramBreakpoints), {
      wrapper: ({ children }) => wrapper({ children, breakpoints: contextBreakpoints }),
    });

    // Width 375 with param breakpoints: 300 <= 375 < 600 = isMedium
    expect(result.current.isSmall).toBe(false);
    expect(result.current.isMedium).toBe(true);
  });
});
