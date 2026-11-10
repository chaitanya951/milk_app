import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { PressableScale } from '@/components/animations/PressableScale';
import { Reveal } from '@/components/animations/Reveal';
import { ProductCard } from '@/components/cards/ProductCard';
import { GrassBand } from '@/components/layout/GrassBand';
import { AppText } from '@/components/ui/AppText';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { HeaderIcon } from '@/components/ui/HeaderIcon';
import { Screen } from '@/components/ui/Screen';
import { images } from '@/constants/assets';
import { colors, fonts, radii, shadows } from '@/constants/theme';
import {
  productChips,
  products,
  type Product,
  type ProductCategory,
} from '@/data/products';
import { useMetrics } from '@/hooks/useMetrics';
import { useRefresh } from '@/hooks/useRefresh';
import { useCartStore } from '@/store/cartStore';
import { selectionFeedback } from '@/utils/haptics';

type SortKey = 'popular' | 'price-low' | 'price-high' | 'rating';

const sortLabels: Record<SortKey, string> = {
  popular: 'Most loved',
  'price-low': 'Price: low to high',
  'price-high': 'Price: high to low',
  rating: 'Top rated',
};

const isCategory = (value: unknown): value is ProductCategory =>
  productChips.some((chip) => chip.key === value);

export default function ProductsScreen() {
  const metrics = useMetrics();
  const { refreshing, onRefresh } = useRefresh();
  const params = useLocalSearchParams<{ category?: string }>();
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, line) => total + line.quantity, 0),
  );

  const [sort, setSort] = useState<SortKey>('popular');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const category: ProductCategory | 'All' = isCategory(params.category)
    ? params.category
    : 'All';

  const selectCategory = (next: ProductCategory | 'All') => {
    router.setParams({ category: next });
  };

  const contentWidth = Math.min(metrics.width, metrics.contentMax) - 32;
  const horizontal = metrics.gutter + 16;

  const filtered = useMemo(() => {
    const base =
      category === 'All' ? products : products.filter((product) => product.category === category);
    return [...base].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      // "Most loved" follows the curated farm-shelf order from the reference.
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [category, sort]);

  const rows: Product[][] = [];
  for (let index = 0; index < filtered.length; index += 2) {
    rows.push(filtered.slice(index, index + 2));
  }

  const openProduct = (product: Product) =>
    router.push({ pathname: '/product/[id]', params: { id: product.id } });

  return (
    <Screen>
      <View
        style={[
          styles.header,
          {
            paddingTop: metrics.insets.top + 6,
            paddingHorizontal: horizontal,
          },
        ]}
      >
        <View style={[styles.headerRow, { width: contentWidth }]}>
          <View style={styles.headerLeft}>
            <HeaderIcon
              name="arrow-back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
              accessibilityLabel="Go back"
            />
            <AppText style={styles.headerTitle}>All Products</AppText>
          </View>
          <View style={styles.headerActions}>
            <HeaderIcon
              name="search-outline"
              onPress={() => setSearchOpen(true)}
              accessibilityLabel="Search dairy products"
              size={23}
            />
            <HeaderIcon
              name="cart-outline"
              onPress={() => router.push('/cart')}
              badge={cartCount}
              accessibilityLabel="Open cart"
              size={25}
            />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontal,
          paddingBottom: metrics.bottomClearance + 30,
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsScroll}
        >
          {productChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              image={chip.image}
              active={category === chip.key}
              onPress={() => selectCategory(chip.key)}
            />
          ))}
        </ScrollView>

        <Reveal direction="up" delay={40}>
          <PressableScale
            onPress={() => setFilterOpen(true)}
            haptic="select"
            style={[styles.hero, { width: contentWidth, height: contentWidth / 2.17 }]}
            accessibilityLabel="Pure milk straight from happy cows. Open filters"
          >
            <View style={styles.heroImageWrap}>
              <Image
                source={images.productHero}
                style={styles.heroImage}
                contentFit="cover"
                transition={160}
              />
            </View>
            <View style={styles.filterPill}>
              <Ionicons name="options-outline" size={15} color={colors.brownDark} />
              <AppText style={styles.filterText}>Filter</AppText>
            </View>
          </PressableScale>
        </Reveal>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Image source={images.cowMascot} style={styles.emptyCow} contentFit="contain" />
            <AppText style={styles.emptyTitle}>No dairy here yet</AppText>
            <AppText style={styles.emptyBody}>
              Try another category, or browse the full farm shelf.
            </AppText>
            <Button
              label="See all products"
              variant="soft"
              size="md"
              onPress={() => selectCategory('All')}
            />
          </View>
        ) : (
          <View style={styles.grid}>
            {rows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {row.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={rowIndex === 0 ? 'showcase' : 'compact'}
                    index={rowIndex * 2 + index}
                    onPress={openProduct}
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        {category !== 'All' || sort !== 'popular' ? (
          <Pressable
            onPress={() => {
              setSort('popular');
              selectCategory('All');
              setFilterOpen(false);
            }}
            style={styles.clear}
          >
            <AppText style={styles.clearText}>Reset filters</AppText>
          </Pressable>
        ) : null}
      </ScrollView>

      <GrassBand />

      {filterOpen ? (
        <FilterSheet
          visible
          onClose={() => setFilterOpen(false)}
          category={category}
          sort={sort}
          resultCount={filtered.length}
          onApply={(nextCategory, nextSort) => {
            selectCategory(nextCategory);
            setSort(nextSort);
            setFilterOpen(false);
          }}
        />
      ) : null}
      {searchOpen ? (
        <SearchSheet visible onClose={() => setSearchOpen(false)} onSelect={openProduct} />
      ) : null}
    </Screen>
  );
}

function FilterSheet({
  visible,
  onClose,
  category,
  sort,
  resultCount,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  category: ProductCategory | 'All';
  sort: SortKey;
  resultCount: number;
  onApply: (category: ProductCategory | 'All', sort: SortKey) => void;
}) {
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftSort, setDraftSort] = useState(sort);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filter & sort"
      subtitle="Find the freshest pick for your morning."
    >
      <AppText style={styles.sheetLabel}>Category</AppText>
      <View style={styles.wrap}>
        {productChips.map((chip) => (
          <Chip
            key={chip.key}
            label={chip.label}
            active={draftCategory === chip.key}
            onPress={() => {
              selectionFeedback();
              setDraftCategory(chip.key);
            }}
          />
        ))}
      </View>

      <AppText style={[styles.sheetLabel, { marginTop: 20 }]}>Sort by</AppText>
      <View style={styles.sortList}>
        {(Object.keys(sortLabels) as SortKey[]).map((key) => {
          const active = draftSort === key;
          return (
            <PressableScale
              key={key}
              onPress={() => setDraftSort(key)}
              haptic="select"
              style={[styles.sortRow, active ? styles.sortRowActive : null]}
            >
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={19}
                color={active ? colors.green : colors.muted}
              />
              <AppText style={[styles.sortText, active ? { color: colors.greenDark } : null]}>
                {sortLabels[key]}
              </AppText>
            </PressableScale>
          );
        })}
      </View>

      <Button
        label={`Show ${resultCount} product${resultCount === 1 ? '' : 's'}`}
        fullWidth
        onPress={() => onApply(draftCategory, draftSort)}
        style={{ marginTop: 22 }}
      />
    </BottomSheet>
  );
}

function SearchSheet({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products.slice(0, 4);
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.farm.toLowerCase().includes(term),
    );
  }, [query]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Search the farm shelf">
      <View style={styles.searchBar}>
        <Ionicons name="search" size={19} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search milk, curd, paneer…"
          placeholderTextColor={colors.mutedLight}
          style={styles.searchInput}
          autoFocus
          returnKeyType="search"
          selectionColor={colors.green}
          accessibilityLabel="Search dairy products"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.mutedLight} />
          </Pressable>
        ) : null}
      </View>

      <AppText style={styles.searchHint}>
        {query ? `${results.length} matches on the shelf` : 'Popular searches'}
      </AppText>

      <View style={styles.results}>
        {results.map((product) => (
          <PressableScale
            key={product.id}
            onPress={() => {
              onClose();
              onSelect(product);
            }}
            haptic="select"
            style={styles.result}
          >
            <View
              style={[
                styles.resultImageWrap,
                product.imageKind === 'tile' ? styles.resultTile : null,
              ]}
            >
              <Image source={product.image} style={styles.resultImage} contentFit="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.resultName}>{product.name}</AppText>
              <AppText style={styles.resultMeta}>
                {product.size} · {product.category}
              </AppText>
            </View>
            <AppText style={styles.resultPrice}>₹{product.price}</AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </PressableScale>
        ))}
        {results.length === 0 ? (
          <View style={styles.noResults}>
            <AppText style={styles.noResultsText}>
              No match for “{query}” yet. Try milk, ghee or paneer.
            </AppText>
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 19,
    lineHeight: 26,
    color: colors.brownDark,
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  chipsScroll: {
    marginHorizontal: -16,
    marginTop: 2,
  },
  chips: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  hero: {
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 2,
    ...shadows.card,
  },
  heroImageWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  filterPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: 'rgba(255,252,246,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...shadows.soft,
  },
  filterText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.brownDark,
  },
  grid: {
    marginTop: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  clear: {
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  clearText: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 38,
    gap: 8,
  },
  emptyCow: {
    width: 92,
    height: 100,
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: 10,
  },
  sheetLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortList: {
    gap: 7,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sortRowActive: {
    backgroundColor: colors.greenIce,
    borderColor: colors.greenTint,
  },
  sortText: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: colors.text,
    paddingVertical: 0,
  },
  searchHint: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 14,
    marginBottom: 4,
  },
  results: {
    marginTop: 2,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  resultImageWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTile: {
    borderRadius: 24,
    backgroundColor: '#FCF5ED',
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultName: {
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.text,
  },
  resultMeta: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.muted,
  },
  resultPrice: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  noResults: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
  },
});
