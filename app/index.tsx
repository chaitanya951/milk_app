import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { PressableScale } from '@/components/animations/PressableScale';
import { AppText } from '@/components/ui/AppText';
import { images } from '@/constants/assets';
import { colors, fonts, shadows } from '@/constants/theme';

// Native pixel size of the splash artwork. The live CTA is positioned on top
// of the painted button using the same cover-fit geometry as the image.
const ART_WIDTH = 578;
const ART_HEIGHT = 980;
const CTA = { x: 125, y: 798, width: 315, height: 53 };

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  const coverScale = Math.max(width / ART_WIDTH, height / ART_HEIGHT);
  const artWidth = ART_WIDTH * coverScale;
  const artHeight = ART_HEIGHT * coverScale;
  const offsetX = (width - artWidth) / 2;
  const offsetY = (height - artHeight) / 2;

  const cta = {
    left: offsetX + CTA.x * coverScale,
    top: offsetY + CTA.y * coverScale,
    width: CTA.width * coverScale,
    height: CTA.height * coverScale,
  };
  const circle = Math.max(30, cta.height - 12);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Image
        source={images.splashBackground}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={0}
        accessibilityLabel="DairyDirect. Farm fresh, delivered daily. From our farms to your home."
      />

      <PressableScale
        onPress={() => router.replace('/home')}
        haptic="tap"
        pressedScale={0.975}
        accessibilityRole="button"
        accessibilityLabel="Get Started"
        style={[styles.cta, cta]}
      >
        <LinearGradient
          colors={['#4A7D1B', '#325E10']}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.ctaInner}>
          <View style={{ width: circle }} />
          <AppText style={[styles.ctaText, { fontSize: Math.max(14, cta.height * 0.32) }]}>
            Get Started
          </AppText>
          <View
            style={[
              styles.ctaCircle,
              {
                width: circle,
                height: circle,
                borderRadius: circle / 2,
                marginRight: Math.max(4, cta.height * 0.12),
              },
            ]}
          >
            <Ionicons
              name="arrow-forward"
              size={Math.max(16, circle * 0.5)}
              color={colors.green}
            />
          </View>
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cta: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
    ...shadows.button,
  },
  ctaInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: {
    color: colors.inverse,
    fontFamily: fonts.medium,
    letterSpacing: 0.15,
  },
  ctaCircle: {
    backgroundColor: colors.inverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
