import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { ThemeManager } from '../../src/theme/ThemeManager';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { lightTheme } from '../../src/theme/defaultThemes';

jest.mock('../../src/theme/ThemeManager');

describe('useThemedStyles', () => {
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

    it('builds a StyleSheet from the active theme tokens', async () => {
        const { result } = await renderHook(
            () =>
                useThemedStyles((t) => ({
                    card: { backgroundColor: t.colors.card, padding: t.spacing.md },
                    title: { color: t.colors.text, ...t.typography.h2 },
                })),
            { wrapper },
        );

        expect(result.current.card.backgroundColor).toBe(lightTheme.colors.card);
        expect(result.current.card.padding).toBe(lightTheme.spacing.md);
        // Semantic typography variant spread through into the style.
        expect(result.current.title.fontSize).toBe(lightTheme.typography.h2.fontSize);
        expect(result.current.title.color).toBe(lightTheme.colors.text);
    });

    it('returns a stable reference across re-renders while the theme is unchanged', async () => {
        const { result, rerender } = await renderHook(
            () => useThemedStyles((t) => ({ box: { padding: t.spacing.sm } })),
            { wrapper },
        );

        const first = result.current;
        rerender({});
        expect(result.current).toBe(first);
    });
});
