import { Image, type ImageStyle } from 'expo-image';
import { StyleSheet, type StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { images } from '@/constants/assets';

/**
 * Hand-painted grass edging that sits behind the floating tab bar on the
 * secondary screens. It is purely decorative and never intercepts touches.
 */
export function GrassBand({ style }: { style?: StyleProp<ImageStyle> }) {
  const insets = useSafeAreaInsets();
  const barBottom = Math.max(insets.bottom, 10);
  const bottom = barBottom + 54;

  return (
    <Image
      pointerEvents="none"
      source={images.grassBand}
      style={[styles.band, { bottom }, style]}
      contentFit="cover"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 62,
    zIndex: 6,
  },
});
