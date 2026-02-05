import { renderHook } from '../utils';
import { useResponsive, breakpoints } from '../../src/hooks/useResponsive';
import * as ReactNative from 'react-native';

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
}));

describe('useResponsive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct breakpoints for medium width', async () => {
    (ReactNative.useWindowDimensions as jest.Mock).mockReturnValue({
      width: 375,
      height: 812,
    });

    const { result } = await renderHook(() => useResponsive());

    // width: 375
    // small: < 360 => false
    // medium: >= 360 && < 768 => true
    // large: >= 768 && < 1024 => false
    // xLarge: >= 1024 => false
    expect(result.current.isSmall).toBe(false);
    expect(result.current.isMedium).toBe(true);
    expect(result.current.isLarge).toBe(false);
    expect(result.current.isXLarge).toBe(false);
    expect(result.current.width).toBe(375);
  });

  it('should return correct breakpoints for small width', async () => {
    (ReactNative.useWindowDimensions as jest.Mock).mockReturnValue({
      width: 300,
      height: 600,
    });

    const { result } = await renderHook(() => useResponsive());

    expect(result.current.isSmall).toBe(true);
    expect(result.current.isMedium).toBe(false);
    expect(result.current.isLarge).toBe(false);
    expect(result.current.isXLarge).toBe(false);
  });

  it('should return correct breakpoints for large width', async () => {
    (ReactNative.useWindowDimensions as jest.Mock).mockReturnValue({
      width: 1200,
      height: 800,
    });

    const { result } = await renderHook(() => useResponsive());

    expect(result.current.isSmall).toBe(false);
    expect(result.current.isMedium).toBe(false);
    expect(result.current.isLarge).toBe(false);
    expect(result.current.isXLarge).toBe(true);
  });

  it('should have correct breakpoint constants', async () => {
    expect(breakpoints.small).toBe(360);
    expect(breakpoints.medium).toBe(768);
    expect(breakpoints.large).toBe(1024);
  });
});
