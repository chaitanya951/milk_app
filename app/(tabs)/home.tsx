import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/animations/PressableScale';
import { Reveal } from '@/components/animations/Reveal';
import { ProductCard } from '@/components/cards/ProductCard';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { HomeCategories } from '@/components/home/HomeCategories';
import { OfferBanner } from '@/components/home/OfferBanner';
import { TrustStrip } from '@/components/home/TrustStrip';
import { AddressSheet } from '@/components/sheets/AddressSheet';
import { NotificationsSheet } from '@/components/sheets/NotificationsSheet';
import { AppText } from '@/components/ui/AppText';
import { HeaderIcon } from '@/components/ui/HeaderIcon';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { images } from '@/constants/assets';
import { colors, fonts, shadows } from '@/constants/theme';
import { featuredProducts, type HomeCategory } from '@/data/products';
import { useMetrics } from '@/hooks/useMetrics';
import { useRefresh } from '@/hooks/useRefresh';
import { useUserStore } from '@/store/userStore';

export default function HomeScreen() {
  const metrics = useMetrics();
  const { refreshing, onRefresh } = useRefresh();
  const [locationOpen, setLocationOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const location = useUserStore((state) => state.location);
  const name = useUserStore((state) => state.name);
  const unread = useUserStore((state) => state.unread);

  const contentWidth = Math.min(metrics.width, metrics.contentMax) - 32;
  const horizontal = metrics.gutter + 16;
  const firstName = name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const openCategory = (category: HomeCategory) => {
    router.push({
      pathname: '/products',
      params: { category: category.routeCategory ?? 'All' },
    });
  };

  const slides = [
    {
      key: 'freshness',
      image: images.homeHero,
      cta: 'Shop fresh dairy',
      onPress: () => router.push('/products'),
    },
    {
      key: 'farms',
      image: images.productHero,
      cta: 'Explore milk from happy cows',
      onPress: () => router.push('/products'),
    },
    {
      key: 'subscription',
      image: images.myDairyBanner,
      cta: 'Manage your daily dairy',
      onPress: () => router.push('/my-dairy'),
    },
  ];

  const productRows = [];
  for (let index = 0; index < 4; index += 2) {
    productRows.push(featuredProducts.slice(index, index + 2));
  }

  return (
    <Screen>
      <View
        style={[
          styles.header,
          {
            paddingTop: metrics.insets.top + 8,
            paddingHorizontal: horizontal,
          },
        ]}
      >
        <View style={[styles.headerRow, { width: contentWidth }]}>
          <PressableScale
            onPress={() => setLocationOpen(true)}
            haptic="select"
            style={styles.locationPill}
            accessibilityLabel={`Delivering to ${location}. Change address`}
          >
            <View style={styles.pin}>
              <Ionicons name="location" size={14} color={colors.inverse} />
            </View>
            <AppText style={styles.locationText} numberOfLines={1}>
              {location}
            </AppText>
            <Ionicons name="chevron-down" size={13} color={colors.brown} />
          </PressableScale>
          <HeaderIcon
            name="notifications-outline"
            onPress={() => setNotificationsOpen(true)}
            badge={unread}
            accessibilityLabel="Notifications"
          />
        </View>
        <AppText style={styles.greeting}>
          {greeting}, {firstName} 👋
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontal,
          paddingTop: 6,
          paddingBottom: metrics.bottomClearance + 24,
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
        <Reveal direction="up" delay={40}>
          <HeroCarousel
            slides={slides}
            width={contentWidth}
            height={Math.min(226, Math.round(contentWidth / 1.81))}
          />
        </Reveal>

        <Reveal direction="up" delay={120}>
          <HomeCategories width={contentWidth} onSelect={openCategory} />
        </Reveal>

        <Reveal direction="up" delay={200}>
          <OfferBanner
            width={contentWidth}
            onPress={() => router.push({ pathname: '/products', params: { category: 'Ghee' } })}
          />
        </Reveal>

        <SectionHeader
          title="Bestsellers"
          subtitle="Loved by 12,000+ Bengaluru families"
          action="View All"
          onAction={() => router.push('/products')}
          style={styles.sectionHeader}
        />

        <View style={styles.grid}>
          {productRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.productRow}>
              {row.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="compact"
                  index={rowIndex * 2 + index}
                  onPress={() =>
                    router.push({ pathname: '/product/[id]', params: { id: product.id } })
                  }
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.trust}>
          <TrustStrip />
        </View>
      </ScrollView>

      <AddressSheet visible={locationOpen} onClose={() => setLocationOpen(false)} />
      <NotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    maxWidth: '82%',
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,252,246,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...shadows.tiny,
  },
  pin: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    fontFamily: fonts.semibold,
    fontSize: 11.8,
    lineHeight: 16,
    color: colors.text,
    flexShrink: 1,
  },
  greeting: {
    fontFamily: fonts.semibold,
    fontSize: 15.5,
    lineHeight: 22,
    color: colors.brownDark,
    marginTop: 11,
    letterSpacing: -0.1,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  grid: {
    gap: 10,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trust: {
    marginTop: 16,
  },
});
