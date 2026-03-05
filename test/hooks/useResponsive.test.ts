import { renderHookCompat } from '../utils';
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

    const { result } = await renderHookCompat(() => useResponsive());

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

    const { result } = await renderHookCompat(() => useResponsive());

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

    const { result } = await renderHookCompat(() => useResponsive());

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

  it('should respect custom overrides', async () => {
    (ReactNative.useWindowDimensions as jest.Mock).mockReturnValue({
      width: 700,
      height: 800,
    });

    // Custom: small=375, medium=640, large=1280
    // Width 700 is >= 640 (medium) and < 1280 (large) -> isLarge (wait no)
    // small: < 375 -> false
    // medium: >= 375 && < 640 -> false
    // large: >= 640 && < 1280 -> true  (Wait, logic in hook: isLarge is >= medium && < large)

    // Let's trace hook logic:
    // isSmall: width < small
    // isMedium: width >= small && width < medium
    // isLarge: width >= medium && width < large
    // isXLarge: width >= large

    // With overrides: { small: 375, medium: 640, large: 1280 }
    // Width 700:
    // isSmall: 700 < 375 -> false
    // isMedium: 700 >= 375 && 700 < 640 -> false
    // isLarge: 700 >= 640 && 700 < 1280 -> true
    // isXLarge: 700 >= 1280 -> false

    const overrides = { small: 375, medium: 640, large: 1280 };
    const { result } = await renderHookCompat(() => useResponsive(overrides));

    expect(result.current.isSmall).toBe(false);
    expect(result.current.isMedium).toBe(false);
    expect(result.current.isLarge).toBe(true);
    expect(result.current.isXLarge).toBe(false);
  });

  it('should merge partial overrides with defaults', async () => {
    (ReactNative.useWindowDimensions as jest.Mock).mockReturnValue({
      width: 400,
      height: 800,
    });

    // Override only small=500. Defaults: medium=768
    // Width 400:
    // isSmall: 400 < 500 -> true
    // isMedium: 400 >= 500 && 400 < 768 -> false

    const overrides = { small: 500 };
    const { result } = await renderHookCompat(() => useResponsive(overrides));

    expect(result.current.isSmall).toBe(true);
    expect(result.current.isMedium).toBe(false);
  });
});
