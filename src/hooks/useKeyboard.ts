import { useEffect, useState } from 'react';
import { Keyboard, Platform, KeyboardEvent } from 'react-native';

/**
 * Hook to track keyboard visibility and height.
 *
 * @returns Object containing:
 * - isVisible: boolean - True if keyboard is shown
 * - keyboardHeight: number - Height of the keyboard in pixels
 * - dismiss: function - Method to dismiss keyboard
 */
export function useKeyboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: KeyboardEvent) => {
      setIsVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    };

    const onHide = () => {
      setIsVisible(false);
      setKeyboardHeight(0);
    };

    const showListener = Keyboard.addListener(showEvent, onShow);
    const hideListener = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return { isVisible, keyboardHeight, dismiss: Keyboard.dismiss };
}
