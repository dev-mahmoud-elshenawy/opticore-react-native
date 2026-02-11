import { useContext } from 'react';
import { ConfigContext, ConfigContextValue } from './ConfigContext';

/**
 * Hook to access runtime configuration
 * 
 * @returns {ConfigContextValue} The current configuration context value
 */
export const useConfig = (): ConfigContextValue => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within an OptiCoreProvider');
    }
    return context;
};
