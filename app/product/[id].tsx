import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/animations/PressableScale';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Screen } from '@/components/ui/Screen';
import { images } from '@/constants/assets';
import { colors, fonts, gradients, radii, shadows } from '@/constants/theme';
import { getProduct, products } from '@/data/products';
import { useMetrics } from '@/hooks/useMetrics';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { formatCurrency } from '@/utils/format';
import { successFeedback } from '@/utils/haptics';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const metrics = useMetrics();
  const product = getProduct(id ?? '');

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, line) => total + line.quantity, 0),
  );
  const favorite = useUserStore((state) => state.favorites.includes(product?.id ?? ''));
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);

  if (!product) {
    return (
      <Screen>
        <View style={styles.missing}>
          <Image source={images.cowMascot} style={styles.missingCow} contentFit="contain" />
          <AppText style={styles.missingTitle}>That jar wandered off</AppText>
          <AppText style={styles.missingBody}>Browse the farm shelf to find your favourite.</AppText>
          <PressableScale
            onPress={() => router.replace('/products')}
            haptic="select"
            style={styles.missingButton}
          >
            <AppText style={styles.missingButtonText}>Back to products</AppText>
          </PressableScale>
        </View>
      </Screen>
    );
  }

  const horizontal = Math.max(metrics.gutter + 16, (metrics.width - 520) / 2 + 16);
  const contentWidth = Math.min(metrics.width - horizontal * 2, 520);
  const total = product.price * quantity;
  const isTile = product.imageKind === 'tile';
  const related = products.filter((item) => item.id !== product.id).slice(0, 3);

  const onAdd = () => {
    addItem(product.id, quantity);
    successFeedback();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 118,
        }}
      >
        <View style={[styles.hero, { paddingHorizontal: horizontal }]}>
          <LinearGradient
            colors={['#F1F7E5', '#FBF3E7']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroGlow} />
          <Image source={images.leafA} style={styles.leafA} contentFit="contain" />
          <Image source={images.leafB} style={styles.leafB} contentFit="contain" />
          <View style={styles.heroTopSpace} />

          <View style={[styles.heroCanvas, { width: contentWidth }]}>
            <View style={styles.badgeRow}>
              <Badge tone="green">FARM FRESH</Badge>
              <Badge tone="soft">DELIVERED BY 7 AM</Badge>
            </View>
            <View style={styles.heroImageArea}>
              {isTile ? <View style={styles.tileBackdrop} /> : null}
              <Animated.View
                sharedTransitionTag={`product-image-${product.id}`}
                style={styles.heroImageWrap}
              >
                <Image
                  source={product.image}
                  style={styles.heroImage}
                  contentFit="contain"
                  transition={160}
                />
              </Animated.View>
            </View>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={13} color={colors.star} />
              <AppText style={styles.ratingText}>
                {product.rating.toFixed(1)} · {product.reviews.toLocaleString('en-IN')} reviews
              </AppText>
            </View>
          </View>
        </View>

        <View style={[styles.content, { paddingHorizontal: horizontal }]}>
          <View style={[styles.sheet, { width: contentWidth }]}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.name}>{product.name}</AppText>
                <AppText style={styles.size}>
                  {product.size} · {product.category}
                </AppText>
              </View>
              <View style={styles.priceBox}>
                <AppText style={styles.price}>{formatCurrency(product.price)}</AppText>
                {product.mrp ? (
                  <AppText style={styles.mrp}>{formatCurrency(product.mrp)}</AppText>
                ) : null}
              </View>
            </View>

            <View style={styles.farmRow}>
              <View style={styles.farmIcon}>
                <Ionicons name="home-outline" size={16} color={colors.green} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.farmLabel}>From</AppText>
                <AppText style={styles.farmName}>{product.farm}</AppText>
              </View>
              <View style={styles.verified}>
                <Ionicons name="shield-checkmark" size={14} color={colors.green} />
                <AppText style={styles.verifiedText}>Verified farm</AppText>
              </View>
            </View>

            <View style={styles.divider} />
            <AppText style={styles.description}>{product.description}</AppText>

            <View style={styles.nutritionRow}>
              {product.nutrition.map((item) => (
                <View key={item.label} style={styles.nutritionCell}>
                  <AppText style={styles.nutritionValue}>{item.value}</AppText>
                  <AppText style={styles.nutritionLabel}>{item.label}</AppText>
                </View>
              ))}
            </View>

            <View style={styles.freshnessCard}>
              <View style={styles.freshnessIcon}>
                <Ionicons name="sunny-outline" size={20} color={colors.brown} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.freshnessTitle}>Milked at dawn, chilled at 4°C</AppText>
                <AppText style={styles.freshnessBody}>
                  Bottled this morning and at your door within four hours. No preservatives, ever.
                </AppText>
              </View>
              <Ionicons name="leaf-outline" size={21} color={colors.greenLight} />
            </View>

            <View style={styles.subscribeCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.subscribeTitleRow}>
                  <AppText style={styles.subscribeTitle}>Save 10% on a daily plan</AppText>
                  <Badge tone="soft">POPULAR</Badge>
                </View>
                <AppText style={styles.subscribeBody}>
                  Fresh {product.name.toLowerCase()} every morning. Pause or skip anytime.
                </AppText>
              </View>
              <PressableScale
                onPress={() => router.push('/my-dairy')}
                haptic="select"
                style={styles.subscribeCta}
                accessibilityLabel="View dairy subscription"
              >
                <Ionicons name="arrow-forward" size={16} color={colors.green} />
              </PressableScale>
            </View>
          </View>

          {related.length ? (
            <View style={[styles.related, { width: contentWidth }]}>
              <AppText style={styles.relatedTitle}>More from the farm</AppText>
              <View style={styles.relatedRow}>
                {related.map((item) => (
                  <PressableScale
                    key={item.id}
                    onPress={() => router.replace({ pathname: '/product/[id]', params: { id: item.id } })}
                    haptic="select"
                    style={styles.relatedCard}
                  >
                    <Image source={item.image} style={styles.relatedImage} contentFit="contain" />
                    <AppText style={styles.relatedName} numberOfLines={1}>
                      {item.name}
                    </AppText>
                    <AppText style={styles.relatedPrice}>{formatCurrency(item.price)}</AppText>
                  </PressableScale>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.header, { paddingTop: insets.top + 8, paddingHorizontal: horizontal }]}>
        <View style={[styles.headerRow, { width: contentWidth }]}>
          <IconButton
            name="arrow-back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/products'))}
            accessibilityLabel="Go back"
            size={40}
          />
          <View style={styles.headerRight}>
            <IconButton
              name={favorite ? 'heart' : 'heart-outline'}
              onPress={() => toggleFavorite(product.id)}
              accessibilityLabel={favorite ? 'Remove from favourites' : 'Add to favourites'}
              size={40}
            />
            <IconButton
              name="cart-outline"
              onPress={() => router.push('/cart')}
              accessibilityLabel="Open cart"
              size={40}
              badge={cartCount}
            />
          </View>
        </View>
      </View>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) + 8, paddingHorizontal: horizontal },
        ]}
      >
        <View style={[styles.bottomInner, { width: contentWidth }]}>
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => setQuantity((value) => Math.min(20, value + 1))}
            onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
            max={20}
            compact
          />
          <PressableScale
            onPress={onAdd}
            haptic="none"
            style={styles.addCta}
            accessibilityLabel={`Add ${quantity} ${product.name} to cart for ${formatCurrency(total)}`}
          >
            <LinearGradient
              colors={gradients.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addCtaFill}
            >
              <Ionicons name="bag-add-outline" size={18} color={colors.inverse} />
              <AppText style={styles.addCtaText}>Add to cart · {formatCurrency(total)}</AppText>
            </LinearGradient>
          </PressableScale>
        </View>
      </View>

      {added ? (
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOut.duration(180)}
          style={[styles.toast, { bottom: insets.bottom + 96 }]}
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="checkmark-circle" size={17} color={colors.inverse} />
          <AppText style={styles.toastText}>
            {quantity} × {product.name} added
          </AppText>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: 70,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: '8%',
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  leafA: {
    position: 'absolute',
    top: 90,
    right: 28,
    width: 24,
    height: 26,
    opacity: 0.8,
    transform: [{ rotate: '18deg' }],
  },
  leafB: {
    position: 'absolute',
    top: 170,
    left: 22,
    width: 21,
    height: 22,
    opacity: 0.7,
    transform: [{ rotate: '-22deg' }],
  },
  heroTopSpace: {
    height: 70,
  },
  heroCanvas: {
    alignSelf: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  heroImageArea: {
    height: 265,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tileBackdrop: {
    position: 'absolute',
    width: 226,
    height: 226,
    borderRadius: 113,
    backgroundColor: '#FDF8F0',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  heroImageWrap: {
    width: '82%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  ratingPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,252,246,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...shadows.tiny,
  },
  ratingText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  content: {
    marginTop: -52,
  },
  sheet: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    ...shadows.card,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 23,
    lineHeight: 30,
    color: colors.text,
    letterSpacing: -0.3,
  },
  size: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.muted,
    marginTop: 1,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
  },
  mrp: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  farmRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.greenIce,
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,109,21,0.08)',
  },
  farmIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmLabel: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  farmName: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.greenDark,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.green,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 14,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  nutritionCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.line,
  },
  nutritionValue: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.text,
  },
  nutritionLabel: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 13,
    color: colors.muted,
    marginTop: 1,
  },
  freshnessCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.peachSoft,
  },
  freshnessIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,252,246,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freshnessTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.brownDark,
  },
  freshnessBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.textSecondary,
    marginTop: 1,
  },
  subscribeCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.greenSoft,
    borderWidth: 1,
    borderColor: 'rgba(61,109,21,0.1)',
  },
  subscribeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  subscribeTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.greenDark,
  },
  subscribeBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subscribeCta: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  related: {
    alignSelf: 'center',
    marginTop: 20,
  },
  relatedTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15.5,
    color: colors.text,
    marginBottom: 10,
  },
  relatedRow: {
    flexDirection: 'row',
    gap: 9,
  },
  relatedCard: {
    flex: 1,
    padding: 9,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  relatedImage: {
    width: '100%',
    height: 72,
  },
  relatedName: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.text,
    marginTop: 5,
  },
  relatedPrice: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.green,
    marginTop: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,250,242,0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
  },
  bottomInner: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addCta: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    ...shadows.button,
  },
  addCtaFill: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
  },
  addCtaText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.inverse,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.greenDeep,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
    ...shadows.float,
  },
  toastText: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.inverse,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  missingCow: {
    width: 130,
    height: 142,
  },
  missingTitle: {
    fontFamily: fonts.semibold,
    fontSize: 19,
    color: colors.text,
  },
  missingBody: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  missingButton: {
    backgroundColor: colors.green,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  missingButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.inverse,
  },
});
