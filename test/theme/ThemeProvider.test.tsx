import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { useTheme } from '../../src/theme/useTheme';
import { ThemeManager } from '../../src/theme/ThemeManager';
import { lightTheme, darkTheme } from '../../src/theme/defaultThemes';

// Mock ThemeManager
jest.mock('../../src/theme/ThemeManager');

describe('ThemeProvider & useTheme', () => {
    let mockManager: any;
    let listeners: Function[] = [];

    beforeEach(() => {
        listeners = [];
        mockManager = {
            init: jest.fn().mockResolvedValue(undefined),
            configure: jest.fn(),
            getTheme: jest.fn().mockReturnValue(lightTheme),
            getMode: jest.fn().mockReturnValue('system'),
            getActiveMode: jest.fn().mockReturnValue('light'),
            setMode: jest.fn(),
            addThemeListener: jest.fn((cb) => {
                listeners.push(cb);
                return jest.fn(); // unsubscribe
            }),
            dispose: jest.fn(),
        };
        (ThemeManager.getInstance as jest.Mock).mockReturnValue(mockManager);
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider manager={mockManager}>{children}</ThemeProvider>
    );

    it('should provide default theme context', async () => {
        const { result } = await renderHook(() => useTheme(), { wrapper });

        expect(result.current.theme).toEqual(lightTheme);
        expect(result.current.mode).toBe('system');
        expect(result.current.isLight).toBe(true);
        expect(mockManager.init).toHaveBeenCalled();
    });

    it('should update context when ThemeManager notifies listeners', async () => {
        const { result } = await renderHook(() => useTheme(), { wrapper });

        await act(async () => {
            // Simulate manager update
            mockManager.getTheme.mockReturnValue(darkTheme);
            mockManager.getMode.mockReturnValue('dark');
            mockManager.getActiveMode.mockReturnValue('dark');

            // Notify listeners manually
            listeners.forEach(cb => cb(darkTheme, 'dark'));
        });

        expect(result.current.theme).toEqual(darkTheme);
        expect(result.current.mode).toBe('dark');
    });

    it('should call setMode on manager', async () => {
        const { result } = await renderHook(() => useTheme(), { wrapper });

        await act(async () => {
            result.current.setMode('dark');
        });

        expect(mockManager.setMode).toHaveBeenCalledWith('dark');
    });

    it('should toggle mode', async () => {
        const { result } = await renderHook(() => useTheme(), { wrapper });

        await act(async () => {
            // activeMode is 'light' (from mock), so toggle produces 'dark'
            result.current.toggleMode();
        });

        expect(mockManager.setMode).toHaveBeenCalledWith('dark');
    });

    it('should provide shortcuts to theme properties', async () => {
        const { result } = await renderHook(() => useTheme(), { wrapper });

        expect(result.current.colors).toBeDefined();
        expect(result.current.spacing).toBeDefined();
        expect(result.current.typography).toBeDefined();
    });
});
