import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { PressableScale } from '@/components/animations/PressableScale';
import { images } from '@/constants/assets';

/**
 * The little cow-and-sign vignette tucked into the category card.
 * The cow, sign and grass are separate layers so the cow can hop on press.
 */
export function FarmPromo({ onPress, width = 158 }: { onPress: () => void; width?: number }) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="select"
      style={[styles.wrap, { width, height: width * 0.55 }]}
      accessibilityLabel="Explore 150 happy farms"
    >
      <Image source={images.homeFarmSign} style={styles.sign} contentFit="contain" />
      <Image source={images.cowMascot} style={styles.cow} contentFit="contain" />
      <Image source={images.grassBand} style={styles.grass} contentFit="cover" />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'flex-end',
  },
  cow: {
    position: 'absolute',
    left: 0,
    bottom: 12,
    width: '50%',
    height: '92%',
  },
  sign: {
    position: 'absolute',
    right: -2,
    bottom: 14,
    width: '64%',
    height: '82%',
  },
  grass: {
    position: 'absolute',
    left: '-8%',
    right: '-10%',
    bottom: 0,
    height: 26,
    opacity: 0.96,
  },
});
