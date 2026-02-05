import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { coreSetup, LogLevel } from '../../src';

// Example of initialization in a root component
export const AppConfig = () => {
  useEffect(() => {
    try {
      coreSetup.init({
        api: {
          baseURL: 'https://api.myapp.com',
          getAuthToken: async () => 'sample-token',
        },
        logger: {
          level: LogLevel.INFO,
        },
        features: {
          debugMode: true,
        },
      });
      console.log('OptiCore initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OptiCore:', error);
    }
  }, []);

  return (
    <View>
      <Text>App Configured</Text>
    </View>
  );
};

// Example of accessing config
export const FeatureCheck = () => {
  const config = coreSetup.getConfig();

  if (config.features?.maintenanceMode) {
    return <Text>Maintenance Mode Active</Text>;
  }

  return <Text>App Online</Text>;
};
