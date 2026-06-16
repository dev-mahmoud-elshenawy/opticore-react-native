import React, { createContext, ReactNode, useMemo } from 'react';
import { CoreConfig, ResponsiveConfig, FormsConfig, FeaturesConfig } from '../config/types';

/**
 * Value provided by ConfigContext
 */
export interface ConfigContextValue {
    responsive: ResponsiveConfig['breakpoints'];
    forms?: FormsConfig;
    features?: FeaturesConfig;
}

/**
 * Default breakpoints used when no config is provided
 */
const DEFAULT_BREAKPOINTS = {
    small: 360,
    medium: 768,
    large: 1024,
};

export const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export const ConfigProvider: React.FC<{
    config: Partial<CoreConfig>;
    children: ReactNode;
}> = ({ config, children }) => {
    const value = useMemo(() => ({
        responsive: config.responsive?.breakpoints ?? DEFAULT_BREAKPOINTS,
        forms: config.forms,
        features: config.features,
    }), [config.responsive, config.forms, config.features]);

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};
