import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/animations/PressableScale';
import { GrassBand } from '@/components/layout/GrassBand';
import { NotificationsSheet } from '@/components/sheets/NotificationsSheet';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { HeaderIcon } from '@/components/ui/HeaderIcon';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Screen } from '@/components/ui/Screen';
import { images } from '@/constants/assets';
import { colors, fonts, radii, shadows } from '@/constants/theme';
import {
  dairyBills,
  dairyQuickActions,
  deliverySchedule,
  subscriptionOrders,
  subscriptionPlan,
} from '@/data/subscription';
import { useMetrics } from '@/hooks/useMetrics';
import { useMotionEnabled } from '@/hooks/useMotionEnabled';
import { useRefresh } from '@/hooks/useRefresh';
import { useCartStore } from '@/store/cartStore';
import { useSubscriptionStore, monthlyTotalFor } from '@/store/subscriptionStore';
import { useUserStore } from '@/store/userStore';
import { formatCurrency } from '@/utils/format';
import { selectionFeedback, successFeedback } from '@/utils/haptics';

type DairyTab = 'subscriptions' | 'orders' | 'schedule' | 'bills';
type QuickSheet = 'manage' | 'vacation' | 'quantity' | null;

const tabs = [
  { key: 'subscriptions', label: 'Subscriptions', icon: 'flask-outline' },
  { key: 'orders', label: 'Orders', icon: 'cube-outline' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar-outline' },
  { key: 'bills', label: 'Bills', icon: 'document-text-outline' },
] as const;

export default function MyDairyScreen() {
  const metrics = useMetrics();
  const enabled = useMotionEnabled();
  const { refreshing, onRefresh } = useRefresh();
  const insets = metrics.insets;
  const unread = useUserStore((state) => state.unread);

  const [activeTab, setActiveTab] = useState<DairyTab>('subscriptions');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickSheet, setQuickSheet] = useState<QuickSheet>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [paidBill, setPaidBill] = useState<string | null>(null);

  const status = useSubscriptionStore((state) => state.status);
  const bottleCount = useSubscriptionStore((state) => state.bottleCount);
  const days = useSubscriptionStore((state) => state.days);
  const vacationUntil = useSubscriptionStore((state) => state.vacationUntil);
  const togglePause = useSubscriptionStore((state) => state.togglePause);
  const setBottleCount = useSubscriptionStore((state) => state.setBottleCount);
  const toggleDay = useSubscriptionStore((state) => state.toggleDay);
  const setVacation = useSubscriptionStore((state) => state.setVacation);

  const addItem = useCartStore((state) => state.addItem);

  const width = metrics.width;
  const horizontal = metrics.gutter + 16;
  const contentWidth = Math.min(width, metrics.contentMax) - 32;
  const bannerHeight = Math.max(218, Math.min(262, width / 1.66));
  const monthlyTotal = monthlyTotalFor(bottleCount);

  const [tabsWidth, setTabsWidth] = useState(0);
  const itemWidth = tabsWidth > 0 ? (tabsWidth - 8) / tabs.length : 0;
  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);
  const position = useSharedValue(0);

  useEffect(() => {
    position.value = enabled
      ? withSpring(activeIndex, { damping: 20, stiffness: 220, mass: 0.7 })
      : activeIndex;
  }, [activeIndex, enabled, position]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * itemWidth }],
    width: itemWidth,
  }));

  const handleQuickAction = (key: (typeof dairyQuickActions)[number]['key']) => {
    selectionFeedback();
    if (key === 'pause') {
      togglePause();
      return;
    }
    setQuickSheet(key);
  };

  const pauseLabel = status === 'paused' ? 'Resume' : 'Pause';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: metrics.bottomClearance + 26 }}
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
        <View style={{ height: bannerHeight }}>
          <Image
            source={images.myDairyBanner}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={150}
          />
          <LinearGradient
            colors={['rgba(255,248,237,0.55)', 'rgba(255,248,237,0)']}
            style={[styles.heroFade, { height: insets.top + 90 }]}
          />
          <View
            style={[
              styles.heroHeader,
              { paddingTop: insets.top + 14, paddingHorizontal: horizontal },
            ]}
          >
            <AppText style={styles.heroTitle}>My Dairy</AppText>
            <HeaderIcon
              name="notifications-outline"
              onPress={() => setNotificationsOpen(true)}
              badge={unread}
              accessibilityLabel="Notifications"
            />
          </View>
        </View>

        <View style={[styles.sheet, { marginTop: -16, paddingHorizontal: horizontal }]}>
          <View
            style={styles.tabs}
            onLayout={(event) => setTabsWidth(event.nativeEvent.layout.width)}
          >
            <Animated.View style={[styles.indicator, indicatorStyle]} />
            {tabs.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <PressableScale
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  haptic="select"
                  style={styles.tab}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons
                    name={tab.icon}
                    size={21}
                    color={active ? colors.green : colors.textSecondary}
                  />
                  <AppText style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>
                    {tab.label}
                  </AppText>
                </PressableScale>
              );
            })}
          </View>

          {activeTab === 'subscriptions' ? (
            <>
              <LinearGradient
                colors={['#FCFDF7', '#ECF3DD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={[styles.planCard, { width: contentWidth }]}
              >
                <View style={styles.planTop}>
                  <View style={styles.bottleWrap}>
                    <Image
                      source={images.bottleA2}
                      style={styles.bottle}
                      contentFit="contain"
                    />
                  </View>

                  <View style={styles.planBody}>
                    <View style={styles.planTitleRow}>
                      <AppText style={styles.planTitle} numberOfLines={1}>
                        {subscriptionPlan.title}
                      </AppText>
                      <Badge tone="soft">
                        {status === 'paused' ? 'Paused' : 'Active'}
                      </Badge>
                    </View>
                    <AppText style={styles.planDetail}>
                      {subscriptionPlan.productName} · {subscriptionPlan.size}
                    </AppText>
                    <AppText style={styles.planDetail}>{subscriptionPlan.farm}</AppText>
                    <AppText style={styles.planDetail}>{subscriptionPlan.window}</AppText>

                    <View style={styles.days}>
                      {days.map((active, index) => (
                        <PressableScale
                          key={`${subscriptionPlan.days[index].label}-${index}`}
                          onPress={() => toggleDay(index)}
                          haptic="select"
                          style={[styles.day, active ? styles.dayActive : styles.dayInactive]}
                          accessibilityLabel={`Toggle ${subscriptionPlan.days[index].label} delivery`}
                        >
                          <AppText
                            style={[
                              styles.dayText,
                              active ? styles.dayTextActive : null,
                            ]}
                          >
                            {subscriptionPlan.days[index].label}
                          </AppText>
                        </PressableScale>
                      ))}
                    </View>
                  </View>

                  <View style={styles.crateWrap}>
                    <Image source={images.crateMilk} style={styles.crate} contentFit="contain" />
                    <PressableScale
                      onPress={() => setPreviewOpen(true)}
                      haptic="select"
                      style={styles.play}
                      accessibilityLabel="Preview your morning delivery"
                    >
                      <Ionicons name="play" size={16} color={colors.green} style={{ marginLeft: 2 }} />
                    </PressableScale>
                  </View>
                </View>

                <View style={styles.nextCard}>
                  <PressableScale
                    onPress={() => setActiveTab('schedule')}
                    haptic="select"
                    style={styles.nextCell}
                  >
                    <View style={styles.nextIcon}>
                      <Ionicons name="calendar-outline" size={18} color={colors.green} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText style={styles.nextLabel}>Next Delivery</AppText>
                      <AppText style={styles.nextValue}>
                        {status === 'paused' ? 'Paused' : subscriptionPlan.nextDeliveryLabel}
                      </AppText>
                      <AppText style={styles.nextMeta}>{subscriptionPlan.nextDeliveryTime}</AppText>
                    </View>
                  </PressableScale>

                  <View style={styles.nextDivider} />

                  <PressableScale
                    onPress={() => setActiveTab('bills')}
                    haptic="select"
                    style={styles.nextCell}
                  >
                    <View style={styles.nextIcon}>
                      <Ionicons name="bag-handle-outline" size={18} color={colors.green} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText style={styles.nextLabel}>Total This Month</AppText>
                      <AppText style={styles.nextValue}>{formatCurrency(monthlyTotal)}</AppText>
                      <AppText style={styles.nextMeta}>
                        {subscriptionPlan.deliveriesThisMonth} Deliveries
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color={colors.brown} />
                  </PressableScale>
                </View>
              </LinearGradient>

              <View style={[styles.sectionRow, { width: contentWidth }]}>
                <AppText style={styles.sectionTitle}>Quick Actions</AppText>
                {vacationUntil ? (
                  <AppText style={styles.vacationNote}>Vacation until {vacationUntil}</AppText>
                ) : null}
              </View>

              <View style={[styles.quickGrid, { width: contentWidth }]}>
                {dairyQuickActions.map((action) => (
                  <PressableScale
                    key={action.key}
                    onPress={() => handleQuickAction(action.key)}
                    haptic="select"
                    style={styles.quickTile}
                    accessibilityLabel={
                      action.key === 'pause' ? `${pauseLabel} subscription` : action.label
                    }
                  >
                    <Ionicons
                      name={action.key === 'pause' && status === 'paused' ? 'play-circle-outline' : action.icon}
                      size={25}
                      color={colors.green}
                    />
                    <AppText style={styles.quickLabel} numberOfLines={1}>
                      {action.key === 'pause' ? pauseLabel : action.label}
                    </AppText>
                  </PressableScale>
                ))}
              </View>

              <View style={[styles.assurance, { width: contentWidth }]}>
                <View style={styles.assuranceIcon}>
                  <Ionicons name="leaf-outline" size={18} color={colors.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.assuranceTitle}>Pause before 9 PM, skip tomorrow</AppText>
                  <AppText style={styles.assuranceBody}>
                    No calls, no charges. Your bottles simply wait for you.
                  </AppText>
                </View>
              </View>
            </>
          ) : null}

          {activeTab === 'orders' ? (
            <OrdersTab contentWidth={contentWidth} onReorder={() => addItem('a2-cow-milk')} />
          ) : null}
          {activeTab === 'schedule' ? (
            <ScheduleTab
              contentWidth={contentWidth}
              days={days}
              onToggleDay={toggleDay}
              paused={status === 'paused'}
              onTogglePause={togglePause}
            />
          ) : null}
          {activeTab === 'bills' ? (
            <BillsTab
              contentWidth={contentWidth}
              paidBill={paidBill}
              onPay={(id) => {
                setPaidBill(id);
                successFeedback();
              }}
            />
          ) : null}
        </View>
      </ScrollView>

      <GrassBand />
      <NotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <BottomSheet
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Your morning delivery"
        subtitle="A quiet ritual, repeated every day."
      >
        <View style={styles.preview}>
          <Image source={images.crateMilk} style={styles.previewCrate} contentFit="contain" />
          <AppText style={styles.previewBody}>
            Your delivery partner arrives between {subscriptionPlan.window}, places the chilled
            crate at your door and collects yesterday’s bottles. You will get a notification the
            moment it lands.
          </AppText>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={quickSheet !== null}
        onClose={() => setQuickSheet(null)}
        title={
          quickSheet === 'manage'
            ? 'Manage subscription'
            : quickSheet === 'vacation'
              ? 'Set a vacation'
              : 'Change quantity'
        }
        subtitle={
          quickSheet === 'manage'
            ? 'Tune your daily delivery without a phone call.'
            : quickSheet === 'vacation'
              ? 'We will pause your deliveries and resume automatically.'
              : 'How many bottles should arrive each morning?'
        }
      >
        {quickSheet === 'manage' ? (
          <View style={styles.manageSheet}>
            <View style={styles.manageRow}>
              <View>
                <AppText style={styles.manageLabel}>Delivery status</AppText>
                <AppText style={styles.manageValue}>
                  {status === 'paused' ? 'Paused' : 'Active · every morning'}
                </AppText>
              </View>
              <Button
                label={pauseLabel}
                size="sm"
                variant={status === 'paused' ? 'primary' : 'outline'}
                onPress={togglePause}
              />
            </View>
            <View style={styles.manageDivider} />
            <AppText style={styles.manageLabel}>Bottles per delivery</AppText>
            <View style={styles.manageRow}>
              <QuantityStepper
                quantity={bottleCount}
                onIncrement={() => setBottleCount(bottleCount + 1)}
                onDecrement={() => setBottleCount(bottleCount - 1)}
                max={6}
              />
              <AppText style={styles.managePrice}>{formatCurrency(monthlyTotal)}/mo</AppText>
            </View>
            <View style={styles.manageDivider} />
            <AppText style={styles.manageLabel}>Delivery days</AppText>
            <View style={styles.days}>
              {days.map((active, index) => (
                <PressableScale
                  key={`manage-day-${index}`}
                  onPress={() => toggleDay(index)}
                  haptic="select"
                  style={[styles.day, active ? styles.dayActive : styles.dayInactive]}
                >
                  <AppText style={[styles.dayText, active ? styles.dayTextActive : null]}>
                    {subscriptionPlan.days[index].label}
                  </AppText>
                </PressableScale>
              ))}
            </View>
          </View>
        ) : null}

        {quickSheet === 'vacation' ? (
          <View style={styles.vacationList}>
            {[
              { label: '3 days', body: 'Back on the 9th' },
              { label: '1 week', body: 'Back on the 13th' },
              { label: '2 weeks', body: 'Back on the 20th' },
            ].map((option) => (
              <PressableScale
                key={option.label}
                onPress={() => {
                  setVacation(option.body.replace('Back on the ', ''));
                  setQuickSheet(null);
                }}
                haptic="select"
                style={styles.vacationOption}
              >
                <View style={styles.vacationIcon}>
                  <Ionicons name="umbrella-outline" size={18} color={colors.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.vacationLabel}>{option.label}</AppText>
                  <AppText style={styles.vacationBody}>{option.body}</AppText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </PressableScale>
            ))}
            {vacationUntil ? (
              <Button
                label="Resume deliveries now"
                variant="soft"
                fullWidth
                onPress={() => {
                  setVacation(null);
                  setQuickSheet(null);
                }}
                style={{ marginTop: 8 }}
              />
            ) : null}
          </View>
        ) : null}

        {quickSheet === 'quantity' ? (
          <View style={styles.quantitySheet}>
            <View style={styles.quantityVisual}>
              {Array.from({ length: bottleCount }).map((_, index) => (
                <Image
                  key={`bottle-${index}`}
                  source={images.bottleA2}
                  style={styles.quantityBottle}
                  contentFit="contain"
                />
              ))}
            </View>
            <QuantityStepper
              quantity={bottleCount}
              onIncrement={() => setBottleCount(bottleCount + 1)}
              onDecrement={() => setBottleCount(bottleCount - 1)}
              max={6}
            />
            <View style={styles.quantitySummary}>
              <AppText style={styles.manageLabel}>Monthly total</AppText>
              <AppText style={styles.quantityPrice}>{formatCurrency(monthlyTotal)}</AppText>
            </View>
            <Button
              label="Save changes"
              fullWidth
              onPress={() => {
                successFeedback();
                setQuickSheet(null);
              }}
              style={{ marginTop: 6 }}
            />
          </View>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

function OrdersTab({ contentWidth, onReorder }: { contentWidth: number; onReorder: () => void }) {
  return (
    <View style={{ width: contentWidth }}>
      <View style={styles.tabHeadingRow}>
        <View>
          <AppText style={styles.tabHeading}>Your orders</AppText>
          <AppText style={styles.tabSub}>Every crate, accounted for.</AppText>
        </View>
        <Badge tone="soft">{subscriptionOrders.length} recent</Badge>
      </View>

      <View style={styles.orderList}>
        {subscriptionOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderTop}>
              <View style={styles.orderIcon}>
                <Ionicons
                  name={order.status === 'Scheduled' ? 'time-outline' : 'checkmark-circle-outline'}
                  size={19}
                  color={colors.green}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.orderTitle}>{order.title}</AppText>
                <AppText style={styles.orderDate}>{order.date}</AppText>
              </View>
              <Badge tone={order.status === 'Scheduled' ? 'peach' : 'soft'}>{order.status}</Badge>
            </View>
            <View style={styles.orderDivider} />
            <View style={styles.orderBottom}>
              <AppText style={styles.orderItems} numberOfLines={2}>
                {order.items}
              </AppText>
              <AppText style={styles.orderAmount}>{formatCurrency(order.amount)}</AppText>
            </View>
            {order.status === 'Delivered' ? (
              <Button
                label="Reorder this crate"
                variant="soft"
                size="sm"
                icon="refresh"
                onPress={onReorder}
                style={{ marginTop: 10 }}
              />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function ScheduleTab({
  contentWidth,
  days,
  onToggleDay,
  paused,
  onTogglePause,
}: {
  contentWidth: number;
  days: boolean[];
  onToggleDay: (index: number) => void;
  paused: boolean;
  onTogglePause: () => void;
}) {
  return (
    <View style={{ width: contentWidth }}>
      <View style={styles.tabHeadingRow}>
        <View>
          <AppText style={styles.tabHeading}>This week</AppText>
          <AppText style={styles.tabSub}>Deliveries planned for 6 – 12 May.</AppText>
        </View>
        <Button
          label={paused ? 'Resume' : 'Pause all'}
          variant={paused ? 'primary' : 'outline'}
          size="sm"
          onPress={onTogglePause}
        />
      </View>

      <View style={styles.weekDays}>
        {deliverySchedule.map((day, index) => (
          <PressableScale
            key={`${day.day}-${day.date}`}
            onPress={() => onToggleDay(index)}
            haptic="select"
            style={[styles.weekDay, days[index] ? styles.weekDayActive : null]}
          >
            <AppText style={[styles.weekDayLabel, days[index] ? styles.weekDayLabelActive : null]}>
              {day.day}
            </AppText>
            <AppText style={[styles.weekDate, days[index] ? styles.weekDateActive : null]}>
              {day.date}
            </AppText>
          </PressableScale>
        ))}
      </View>

      <View style={styles.scheduleList}>
        {deliverySchedule.map((day, index) => {
          const active = days[index];
          return (
            <View key={`schedule-${index}`} style={styles.scheduleRow}>
              <View style={[styles.scheduleDot, active ? styles.scheduleDotActive : null]}>
                <AppText style={[styles.scheduleDay, active ? styles.scheduleDayActive : null]}>
                  {day.day}
                </AppText>
                <AppText style={[styles.scheduleDate, active ? styles.scheduleDateActive : null]}>
                  {day.date}
                </AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.scheduleTitle}>
                  {active ? 'A2 Cow Milk · 1 Litre' : 'No delivery'}
                </AppText>
                <AppText style={styles.scheduleMeta}>
                  {active
                    ? day.extras
                      ? `Plus ${day.extras}`
                      : subscriptionPlan.window
                    : 'Paused for the day'}
                </AppText>
              </View>
              <Badge tone={active ? 'soft' : 'outline'}>
                {active ? (index === 0 ? 'Delivered' : 'Scheduled') : 'Paused'}
              </Badge>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function BillsTab({
  contentWidth,
  paidBill,
  onPay,
}: {
  contentWidth: number;
  paidBill: string | null;
  onPay: (id: string) => void;
}) {
  const due = dairyBills.find((bill) => bill.status === 'Due' && bill.id !== paidBill);
  const paid = paidBill ?? null;

  return (
    <View style={{ width: contentWidth }}>
      <View style={styles.tabHeadingRow}>
        <View>
          <AppText style={styles.tabHeading}>Bills & payments</AppText>
          <AppText style={styles.tabSub}>One transparent bill, every month.</AppText>
        </View>
      </View>

      {due ? (
        <LinearGradient
          colors={['#FBEFE0', '#F7E3C9']}
          style={styles.dueCard}
        >
          <View style={styles.dueTop}>
            <Badge tone="peach">BILL DUE</Badge>
            <AppText style={styles.duePeriod}>{due.period}</AppText>
          </View>
          <AppText style={styles.dueAmount}>{formatCurrency(due.amount)}</AppText>
          <AppText style={styles.dueBody}>
            {due.deliveries} deliveries · {due.month}
          </AppText>
          <Button
            label="Pay now"
            variant="brown"
            size="sm"
            icon="shield-checkmark-outline"
            onPress={() => onPay(due.id)}
            style={{ marginTop: 12 }}
          />
        </LinearGradient>
      ) : (
        <View style={styles.allPaid}>
          <Ionicons name="checkmark-circle" size={24} color={colors.green} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.allPaidTitle}>You are all caught up</AppText>
            <AppText style={styles.allPaidBody}>No pending bills on the farm ledger.</AppText>
          </View>
        </View>
      )}

      <View style={styles.billList}>
        {dairyBills.map((bill) => {
          const isPaid = bill.status === 'Paid' || bill.id === paid;
          return (
            <View key={bill.id} style={styles.billRow}>
              <View style={styles.billIcon}>
                <Ionicons name="document-text-outline" size={19} color={colors.brown} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.billMonth}>{bill.month}</AppText>
                <AppText style={styles.billPeriod}>
                  {bill.period} · {bill.deliveries} deliveries
                </AppText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <AppText style={styles.billAmount}>{formatCurrency(bill.amount)}</AppText>
                <Badge tone={isPaid ? 'soft' : 'peach'}>{isPaid ? 'Paid' : 'Due'}</Badge>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroTitle: {
    fontFamily: fonts.semibold,
    fontSize: 23,
    lineHeight: 30,
    color: colors.brownDark,
    letterSpacing: -0.3,
  },
  sheet: {
    marginTop: -58,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 14,
    minHeight: 520,
    ...shadows.card,
  },
  tabs: {
    flexDirection: 'row',
    height: 62,
    borderRadius: 24,
    backgroundColor: 'rgba(255,252,246,0.94)',
    padding: 4,
    position: 'relative',
    marginBottom: 12,
    ...shadows.soft,
  },
  indicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 20,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: 'rgba(61,109,21,0.14)',
    ...shadows.tiny,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    zIndex: 2,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 9.2,
    lineHeight: 12.5,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    fontFamily: fonts.semibold,
    color: colors.green,
  },
  planCard: {
    alignSelf: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(61,109,21,0.09)',
    padding: 12,
    ...shadows.soft,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottleWrap: {
    width: 43,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottle: {
    width: 52,
    height: 96,
  },
  planBody: {
    flex: 1,
    minWidth: 0,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'nowrap',
  },
  planTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13.2,
    lineHeight: 18,
    color: colors.text,
    flexShrink: 1,
  },
  planDetail: {
    fontFamily: fonts.regular,
    fontSize: 10.2,
    lineHeight: 14,
    color: colors.textSecondary,
    marginTop: 1,
  },
  days: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  day: {
    width: 21.5,
    height: 21.5,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  dayInactive: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: colors.line,
  },
  dayText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.muted,
  },
  dayTextActive: {
    color: colors.inverse,
  },
  crateWrap: {
    width: 76,
    height: 92,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  crate: {
    width: 82,
    height: 82,
  },
  play: {
    position: 'absolute',
    left: -8,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.float,
  },
  nextCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,253,248,0.9)',
    borderRadius: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  nextCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 8,
  },
  nextIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 12,
    color: colors.muted,
  },
  nextValue: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.text,
  },
  nextMeta: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 12,
    color: colors.muted,
  },
  nextDivider: {
    width: 1,
    backgroundColor: colors.line,
    marginVertical: 4,
  },
  sectionRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  vacationNote: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.green,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },
  quickTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderRadius: 14,
    backgroundColor: colors.greenIce,
    borderWidth: 1,
    borderColor: 'rgba(61,109,21,0.08)',
    minHeight: 66,
  },
  quickLabel: {
    fontFamily: fonts.medium,
    fontSize: 8.7,
    lineHeight: 12,
    color: colors.greenDark,
    textAlign: 'center',
  },
  assurance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    padding: 11,
    borderRadius: radii.md,
    backgroundColor: colors.peachSoft,
  },
  assuranceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,252,246,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assuranceTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 15,
    color: colors.brownDark,
  },
  assuranceBody: {
    fontFamily: fonts.regular,
    fontSize: 9.8,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  preview: {
    alignItems: 'center',
    gap: 12,
  },
  previewCrate: {
    width: 160,
    height: 160,
  },
  previewBody: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  manageSheet: {
    gap: 12,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  manageLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  manageValue: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
    marginTop: 2,
  },
  manageDivider: {
    height: 1,
    backgroundColor: colors.line,
  },
  managePrice: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.green,
  },
  vacationList: {
    gap: 8,
  },
  vacationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  vacationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacationLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  vacationBody: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  quantitySheet: {
    alignItems: 'center',
    gap: 14,
  },
  quantityVisual: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 96,
    gap: 1,
  },
  quantityBottle: {
    width: 42,
    height: 85,
    marginHorizontal: -4,
  },
  quantitySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  quantityPrice: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.green,
  },
  tabHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  tabHeading: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 23,
    color: colors.text,
  },
  tabSub: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.muted,
    marginTop: 1,
  },
  orderList: {
    gap: 10,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    ...shadows.tiny,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.text,
  },
  orderDate: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: colors.muted,
  },
  orderDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 9,
  },
  orderBottom: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  orderItems: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  orderAmount: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  weekDays: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  weekDayActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  weekDayLabel: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: colors.muted,
  },
  weekDayLabelActive: {
    color: 'rgba(255,253,248,0.8)',
  },
  weekDate: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  weekDateActive: {
    color: colors.inverse,
  },
  scheduleList: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  scheduleDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleDotActive: {
    backgroundColor: colors.greenSoft,
  },
  scheduleDay: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: colors.muted,
    lineHeight: 11,
  },
  scheduleDayActive: {
    color: colors.green,
  },
  scheduleDate: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  scheduleDateActive: {
    color: colors.greenDark,
  },
  scheduleTitle: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.text,
  },
  scheduleMeta: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 13,
    color: colors.muted,
  },
  dueCard: {
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(194,143,80,0.2)',
  },
  dueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  duePeriod: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.brown,
  },
  dueAmount: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 35,
    color: colors.brownDark,
    marginTop: 4,
  },
  dueBody: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  allPaid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: radii.lg,
    backgroundColor: colors.greenIce,
    borderWidth: 1,
    borderColor: colors.greenTint,
    marginBottom: 12,
  },
  allPaidTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.greenDark,
  },
  allPaidBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  billList: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  billIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.peachSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billMonth: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text,
  },
  billPeriod: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 13,
    color: colors.muted,
  },
  billAmount: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: colors.text,
    marginBottom: 2,
  },
});
