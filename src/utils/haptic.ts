import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const triggerHaptic = () => {
  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };
  ReactNativeHapticFeedback.trigger('impactMedium', options);
};
