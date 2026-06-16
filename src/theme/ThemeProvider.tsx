import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { ThemeManager } from './ThemeManager';
import { Logger } from '../infrastructure/logger/Logger';
import type { Theme, ThemeMode } from './types';

export interface ThemeContextValue {
    theme: Theme;
    mode: ThemeMode;
    activeMode: 'light' | 'dark';
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
    isDark: boolean;
    isLight: boolean;
    isSystem: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
    children: ReactNode;
    defaultMode?: ThemeMode;
    // Optional: Allow overriding the manager for testing or advanced use
    manager?: ThemeManager;
}

/**
 * Provider component that bridges ThemeManager state to React Context.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    defaultMode,
    manager = ThemeManager.getInstance()
}) => {
    // Initialize state from manager
    const [theme, setTheme] = useState<Theme>(manager.getTheme());
    const [mode, setModeState] = useState<ThemeMode>(manager.getMode());

    useEffect(() => {
        // Configure if defaultMode provided
        if (defaultMode) {
            manager.configure({ defaultMode });
        }

        // Initialize manager (restores persistence)
        manager.init().catch(err => {
            Logger.getInstance().warn('[ThemeProvider] Failed to initialize ThemeManager', err as Error);
        });

        // Subscribe to changes
        const unsubscribe = manager.addThemeListener((newTheme, newMode) => {
            setTheme(newTheme);
            setModeState(newMode);
        });

        return () => {
            unsubscribe();
        };
    }, [manager, defaultMode]);

    const setMode = (newMode: ThemeMode) => {
        manager.setMode(newMode);
    };

    const toggleMode = () => {
        const nextMode = activeMode === 'dark' ? 'light' : 'dark';
        manager.setMode(nextMode);
    };

    const activeMode = manager.getActiveMode();

    const value: ThemeContextValue = {
        theme,
        mode,
        activeMode,
        setMode,
        toggleMode,
        isDark: activeMode === 'dark',
        isLight: activeMode === 'light',
        isSystem: mode === 'system',
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
