import { renderHook } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}), { virtual: true });

import { useRouter } from 'expo-router';
import { useRouteHelper } from '../../src/navigation/RouteHelper';

describe('useRouteHelper', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockBack = jest.fn();
  const mockCanGoBack = jest.fn();
  const mockDismissAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      canGoBack: mockCanGoBack,
      dismissAll: mockDismissAll,
    });
  });

  describe('push', () => {
    it('should push route without params', () => {
      const { result } = renderHook(() => useRouteHelper());
      result.current.push('/home');
      expect(mockPush).toHaveBeenCalledWith('/home');
    });

    it('should push route with params', () => {
      const { result } = renderHook(() => useRouteHelper());
      result.current.push('/user/profile', { id: '123' });
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/user/profile',
        params: { id: '123' },
      });
    });

    it('should push route with numeric params', () => {
      const { result } = renderHook(() => useRouteHelper());
      result.current.push('/items', { page: 2, limit: 10 });
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/items',
        params: { page: 2, limit: 10 },
      });
    });
  });

  describe('replace', () => {
    it('should replace route without params', () => {
      const { result } = renderHook(() => useRouteHelper());
      result.current.replace('/login');
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });

    it('should replace route with params', () => {
      const { result } = renderHook(() => useRouteHelper());
      result.current.replace('/dashboard', { tab: 'overview' });
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/dashboard',
        params: { tab: 'overview' },
      });
    });
  });

  describe('back', () => {
    it('should go back when stack has history', () => {
      mockCanGoBack.mockReturnValue(true);
      const { result } = renderHook(() => useRouteHelper());
      result.current.back();
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('should be no-op when at root (no history)', () => {
      mockCanGoBack.mockReturnValue(false);
      const { result } = renderHook(() => useRouteHelper());
      result.current.back();
      expect(mockBack).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should dismissAll and replace when stack has history', () => {
      mockCanGoBack.mockReturnValue(true);
      const { result } = renderHook(() => useRouteHelper());
      result.current.reset('/home');
      expect(mockDismissAll).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/home');
    });

    it('should skip dismissAll and just replace when stack is empty', () => {
      mockCanGoBack.mockReturnValue(false);
      const { result } = renderHook(() => useRouteHelper());
      result.current.reset('/home');
      expect(mockDismissAll).not.toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/home');
    });

    it('should reset with params', () => {
      mockCanGoBack.mockReturnValue(true);
      const { result } = renderHook(() => useRouteHelper());
      result.current.reset('/dashboard', { tab: 'home' });
      expect(mockDismissAll).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/dashboard',
        params: { tab: 'home' },
      });
    });
  });
});
