import { Image } from 'expo-image';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useMotionEnabled } from '@/hooks/useMotionEnabled';
import { useCartTargetStore } from '@/store/cartTargetStore';
import type { FlyImage, LayoutBox } from '@/utils/layout';
import { measureInWindow } from '@/utils/layout';

type FlyPayload = {
  image: FlyImage;
  from: LayoutBox;
};

type FlyingEntry = FlyPayload & { key: number };

type FlyContextValue = {
  fly: (image: FlyImage, sourceRef: RefObject<unknown>) => void;
};

const FlyContext = createContext<FlyContextValue | null>(null);

export const useFlyToCart = () => {
  const context = useContext(FlyContext);
  if (!context) throw new Error('useFlyToCart must be used inside FlyToCartProvider');
  return context;
};

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<FlyingEntry[]>([]);
  const counter = useRef(0);
  const { width, height } = useWindowDimensions();
  const target = useCartTargetStore((state) => state.target);

  const remove = useCallback((key: number) => {
    setEntries((current) => current.filter((entry) => entry.key !== key));
  }, []);

  const fly = useCallback<FlyContextValue['fly']>((image, sourceRef) => {
    measureInWindow(sourceRef).then((box) => {
      if (!box) return;
      counter.current += 1;
      setEntries((current) => [...current.slice(-3), { image, from: box, key: counter.current }]);
    });
  }, []);

  const value = useMemo(() => ({ fly }), [fly]);

  const destination = target ?? {
    x: width - 74,
    y: height - 82,
    width: 28,
    height: 28,
  };

  return (
    <FlyContext.Provider value={value}>
      {children}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {entries.map((entry) => (
          <FlyingItem
            key={entry.key}
            entry={entry}
            destination={destination}
            onComplete={() => remove(entry.key)}
          />
        ))}
      </View>
    </FlyContext.Provider>
  );
}

function FlyingItem({
  entry,
  destination,
  onComplete,
}: {
  entry: FlyingEntry;
  destination: LayoutBox;
  onComplete: () => void;
}) {
  const progress = useSharedValue(0);
  const enabled = useMotionEnabled();

  const startX = entry.from.x + entry.from.width / 2 - 17;
  const startY = entry.from.y + entry.from.height / 2 - 22;
  const endX = destination.x + destination.width / 2 - 17;
  const endY = destination.y + destination.height / 2 - 22;
  const arc = Math.max(70, Math.abs(startY - endY) * 0.22);

  useEffect(() => {
    if (!enabled) {
      onComplete();
      return;
    }
    progress.value = withTiming(
      1,
      { duration: 720, easing: Easing.bezier(0.22, 0.61, 0.36, 1) },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      },
    );
  }, [enabled, onComplete, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      transform: [
        { translateX: startX + (endX - startX) * p },
        { translateY: startY + (endY - startY) * p - Math.sin(Math.PI * p) * arc },
        { scale: 1 - p * 0.55 },
        { rotate: `${-14 * p}deg` },
      ],
      opacity: 1 - p * 0.25,
    };
  });

  return (
    <Animated.View style={[styles.flyer, animatedStyle]}>
      <Image source={entry.image} style={styles.flyerImage} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flyer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 34,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyerImage: {
    width: '100%',
    height: '100%',
  },
});
