import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PressableScale } from '@/components/animations/PressableScale';
import { images } from '@/constants/assets';
import { colors, shadows } from '@/constants/theme';
import { useMotionEnabled } from '@/hooks/useMotionEnabled';

export type HeroSlide = {
  key: string;
  image: (typeof images)[keyof typeof images];
  cta: string;
  onPress: () => void;
};

export function HeroCarousel({
  slides,
  width,
  height = 198,
  onDotChange,
}: {
  slides: HeroSlide[];
  width: number;
  height?: number;
  onDotChange?: (index: number) => void;
}) {
  const enabled = useMotionEnabled();
  const listRef = useRef<FlatList<HeroSlide>>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!enabled || paused || slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % slides.length;
        listRef.current?.scrollToOffset({ offset: next * width, animated: true });
        onDotChange?.(next);
        return next;
      });
    }, 4600);
    return () => clearInterval(timer);
  }, [enabled, onDotChange, paused, slides.length, width]);

  const handleMomentum = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(next);
    onDotChange?.(next);
    setPaused(true);
    setTimeout(() => setPaused(false), 6000);
  };

  return (
    <View style={[styles.root, { width, height }]}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentum}
        onScrollBeginDrag={() => setPaused(true)}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <PressableScale
              onPress={item.onPress}
              haptic="select"
              style={styles.pressable}
              accessibilityLabel={item.cta}
            >
              <Image
                source={item.image}
                style={styles.image}
                contentFit="cover"
                transition={180}
                accessibilityLabel={item.cta}
              />
            </PressableScale>
          </View>
        )}
      />
      <View style={styles.dots} pointerEvents="box-none">
        {slides.map((slide, dotIndex) => (
          <CarouselDot key={slide.key} active={dotIndex === index} />
        ))}
      </View>
    </View>
  );
}

function CarouselDot({ active }: { active: boolean }) {
  const enabled = useMotionEnabled();
  const width = useSharedValue(active ? 18 : 6);
  const opacity = useSharedValue(active ? 1 : 0.58);

  useEffect(() => {
    width.value = withTiming(active ? 18 : 6, { duration: 260 });
    opacity.value = withTiming(active ? 1 : 0.58, { duration: 220 });
  }, [active, opacity, width]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    opacity: enabled ? opacity.value : active ? 1 : 0.58,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.card,
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.inverse,
  },
});
