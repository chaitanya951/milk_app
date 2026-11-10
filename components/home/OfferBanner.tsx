import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { PressableScale } from '@/components/animations/PressableScale';
import { images } from '@/constants/assets';
import { colors, radii, shadows } from '@/constants/theme';

export function OfferBanner({ width, onPress }: { width: number; onPress: () => void }) {
  const height = Math.round((width * 180) / 562);

  return (
    <PressableScale
      onPress={onPress}
      haptic="select"
      style={[styles.root, { width, height }]}
      accessibilityLabel="Flat 15 percent off on desi ghee. Grab the offer."
    >
      <Image source={images.offerBanner} style={styles.image} contentFit="cover" transition={150} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 14,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.peachSoft,
    ...shadows.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
