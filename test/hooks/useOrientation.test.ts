import { renderHook } from '@testing-library/react-native';
import { useOrientation } from '../../src/hooks/useOrientation';

jest.mock('react-native', () => {
    const actual = jest.requireActual('react-native');
    return {
        ...actual,
        Dimensions: {
            get: jest.fn(() => ({ width: 375, height: 812 })),
            addEventListener: jest.fn(() => ({ remove: jest.fn() })),
        }
    };
});

describe('useOrientation', () => {
    it('should return initial orientation', () => {
        const { result } = renderHook(() => useOrientation());
        expect(result.current.orientation).toBe('portrait');
    });
});
