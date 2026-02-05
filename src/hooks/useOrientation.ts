import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export type Orientation = 'portrait' | 'landscape';

/**
 * Hook to track device orientation based on window dimensions.
 *
 * @returns Object containing:
 * - orientation: 'portrait' | 'landscape'
 * - isPortrait: boolean
 * - isLandscape: boolean
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>(
    isLandscape(Dimensions.get('window')) ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setOrientation(isLandscape(window) ? 'landscape' : 'portrait');
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
}

function isLandscape({ width, height }: { width: number; height: number }) {
  return width > height;
}
