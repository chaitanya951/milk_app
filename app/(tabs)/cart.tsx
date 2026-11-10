import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/animations/PressableScale';
import { AnimatedNumber } from '@/components/animations/AnimatedNumber';
import { CART_FOOTER_EXTRA, CartFooter } from '@/components/cart/CartFooter';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { AddressSheet } from '@/components/sheets/AddressSheet';
import { CheckoutSheet } from '@/components/sheets/CheckoutSheet';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { HeaderIcon } from '@/components/ui/HeaderIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { images } from '@/constants/assets';
import { colors, fonts, radii, shadows } from '@/constants/theme';
import { useMetrics } from '@/hooks/useMetrics';
import { useRefresh } from '@/hooks/useRefresh';
import { useCartStore, getCartTotals } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { formatCurrency } from '@/utils/format';

export default function CartScreen() {
  const metrics = useMetrics();
  const insets = useSafeAreaInsets();
  const { refreshing, onRefresh } = useRefresh();
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem);
  const location = useUserStore((state) => state.location);

  const [addressOpen, setAddressOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(true);

  const totals = useMemo(() => getCartTotals(items), [items]);
  const horizontal = metrics.gutter + 16;
  const contentWidth = Math.min(metrics.width - horizontal * 2, metrics.contentMax - 32);
  const barTop = Math.max(insets.bottom, 10) + 66;
  const footerHeight = barTop + CART_FOOTER_EXTRA;
  const empty = totals.lines.length === 0;

  const discountRemaining = totals.toDiscount;
  const freeMessage =
    discountRemaining > 0
      ? 'Yay! You unlocked FREE delivery'
      : 'FREE delivery & 5% OFF unlocked';
  const subMessage =
    discountRemaining > 0
      ? `Add items worth ${formatCurrency(discountRemaining)} more to get 5% OFF`
      : 'You are getting the best of the farm today.';

  return (
    <Screen>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 6, paddingHorizontal: horizontal },
        ]}
      >
        <View style={[styles.headerRow, { width: contentWidth }]}>
          <View style={styles.headerLeft}>
            <HeaderIcon
              name="arrow-back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
              accessibilityLabel="Go back"
            />
            <AppText style={styles.title}>My Cart</AppText>
          </View>
        </View>

        <PressableScale
          onPress={() => setAddressOpen(true)}
          haptic="select"
          style={styles.delivery}
          accessibilityLabel={`Delivering to ${location}. Change address`}
        >
          <View>
            <AppText style={styles.deliveryLabel}>Delivering to</AppText>
            <View style={styles.deliveryRow}>
              <AppText style={styles.location}>{location}</AppText>
              <Ionicons name="chevron-down" size={13} color={colors.brown} />
            </View>
          </View>
        </PressableScale>
      </View>

      <Image
        source={images.cowOnCart}
        style={[styles.cartCow, { top: insets.top + 8, right: horizontal - 2 }]}
        contentFit="contain"
        accessibilityLabel="A calf riding a wooden cart full of greens"
      />

      {empty ? (
        <View style={[styles.empty, { paddingBottom: barTop + 30, paddingHorizontal: horizontal }]}>
          <View style={styles.emptyArt}>
            <Image source={images.cowMascot} style={styles.emptyCow} contentFit="contain" />
          </View>
          <AppText style={styles.emptyTitle}>Your cart is feeling light</AppText>
          <AppText style={styles.emptyBody}>
            Fresh A2 milk, soft paneer and golden ghee are waiting on the farm shelf.
          </AppText>
          <Button
            label="Browse the farm"
            icon="leaf-outline"
            onPress={() => router.push('/products')}
            fullWidth
            style={{ maxWidth: 250, marginTop: 8 }}
          />
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: horizontal,
              paddingBottom: footerHeight + 22,
              paddingTop: 2,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.green}
                colors={[colors.green]}
                progressBackgroundColor={colors.surface}
              />
            }
          >
            <View style={[styles.card, { width: contentWidth }]}>
              {totals.lines.map((line, index) => (
                <CartItemRow
                  key={line.id}
                  product={line.product}
                  quantity={line.quantity}
                  last={index === totals.lines.length - 1}
                  onIncrement={() => increment(line.id)}
                  onDecrement={() => decrement(line.id)}
                  onRemove={() => removeItem(line.id)}
                />
              ))}
            </View>

            <View style={[styles.freeCard, { width: contentWidth }]}>
              <View style={styles.gift}>
                <Ionicons name="gift" size={22} color={colors.brown} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.freeTitle}>{freeMessage}</AppText>
                <AppText style={styles.freeSub}>{subMessage}</AppText>
                <View style={styles.progressRow}>
                  <ProgressBar
                    progress={totals.discountProgress}
                    height={6}
                    style={{ flex: 1 }}
                  />
                  {discountRemaining > 0 ? (
                    <AppText style={styles.left}>{formatCurrency(discountRemaining)} left</AppText>
                  ) : (
                    <AppText style={styles.unlocked}>Unlocked</AppText>
                  )}
                </View>
              </View>
            </View>

            <View style={[styles.billCard, { width: contentWidth }]}>
              <PressableScale
                onPress={() => setBillOpen((open) => !open)}
                haptic="select"
                style={styles.billHeader}
                accessibilityLabel={billOpen ? 'Collapse bill details' : 'Expand bill details'}
              >
                <AppText style={styles.billTitle}>Bill Details</AppText>
                <View style={styles.billChevron}>
                  <Ionicons
                    name={billOpen ? 'chevron-up' : 'chevron-down'}
                    size={17}
                    color={colors.brown}
                  />
                </View>
              </PressableScale>

              {billOpen ? (
                <View style={styles.billBody}>
                  <BillRow label="Item Total" value={formatCurrency(totals.subtotal)} />
                  <BillRow
                    label="Delivery Fee"
                    value={totals.deliveryFee === 0 ? 'FREE' : formatCurrency(totals.deliveryFee)}
                    green={totals.deliveryFee === 0}
                  />
                  {totals.savings > 0 ? (
                    <BillRow
                      label="You Save"
                      value={formatCurrency(totals.savings)}
                      green
                    />
                  ) : null}
                  <View style={styles.billDivider} />
                  <View style={styles.billRow}>
                    <AppText style={styles.totalLabel}>Total Amount</AppText>
                    <AnimatedNumber value={totals.total} style={styles.totalValue} currency />
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.noteRow}>
              <Ionicons name="time-outline" size={14} color={colors.muted} />
              <AppText style={styles.note}>
                Order before 9 PM for tomorrow’s sunrise delivery.
              </AppText>
            </View>
          </ScrollView>

          <CartFooter
            total={totals.total}
            onCheckout={() => setCheckoutOpen(true)}
            disabled={empty}
          />
        </>
      )}

      <AddressSheet visible={addressOpen} onClose={() => setAddressOpen(false)} />
      <CheckoutSheet
        visible={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderPlaced={() => router.replace('/home')}
      />
    </Screen>
  );
}

function BillRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <View style={styles.billRow}>
      <AppText style={styles.billLabel}>{label}</AppText>
      <AppText style={[styles.billValue, green ? styles.billGreen : null]}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 21,
    lineHeight: 28,
    color: colors.brownDark,
    letterSpacing: -0.2,
  },
  cartCow: {
    position: 'absolute',
    width: 94,
    height: 88,
    zIndex: 5,
  },
  delivery: {
    alignSelf: 'flex-start',
    marginTop: 3,
    marginLeft: 2,
    paddingVertical: 2,
    paddingRight: 10,
  },
  deliveryLabel: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 13,
    color: colors.muted,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  location: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(233,218,196,0.55)',
    ...shadows.card,
  },
  freeCard: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 11,
    padding: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(233,218,196,0.55)',
    ...shadows.tiny,
  },
  gift: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.peachSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.green,
  },
  freeSub: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.textSecondary,
    marginTop: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  left: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.textSecondary,
  },
  unlocked: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.green,
  },
  billCard: {
    marginTop: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(233,218,196,0.55)',
    padding: 13,
    ...shadows.tiny,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.text,
  },
  billChevron: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billBody: {
    marginTop: 10,
    gap: 6,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  billValue: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.text,
  },
  billGreen: {
    color: colors.green,
    fontFamily: fonts.semibold,
  },
  billDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 3,
  },
  totalLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    color: colors.text,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
    marginTop: 10,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyArt: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.greenIce,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyCow: {
    width: 118,
    height: 130,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 27,
    color: colors.text,
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 5,
    marginBottom: 16,
  },
});
