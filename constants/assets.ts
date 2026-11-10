import type { ImageProps } from 'expo-image';

/** Asset type accepted by expo-image. `require()` returns a numeric id. */
export type AssetSource = NonNullable<ImageProps['source']>;

/**
 * Single source of truth for every image in the app.
 *
 * All artwork is derived from the supplied DairyDirect reference sheet. The
 * assets are intentionally kept as individual transparent PNG layers so the
 * mascot, bottles (and backgrounds) can be animated independently.
 */
export const images = {
  // Brand / layouts
  splashBackground: require('../assets/images/bg-splash.png') as AssetSource,
  logoEmblem: require('../assets/images/logo-emblem.png') as AssetSource,
  avatarRahul: require('../assets/images/avatar-rahul.png') as AssetSource,

  // Scenes
  homeHero: require('../assets/images/bg-home-hero-clean.png') as AssetSource,
  productHero: require('../assets/images/bg-product-hero.png') as AssetSource,
  myDairyBanner: require('../assets/images/bg-my-dairy-banner-clean.png') as AssetSource,
  profileBanner: require('../assets/images/bg-profile-banner-clean.png') as AssetSource,
  offerBanner: require('../assets/images/offer-banner-clean.png') as AssetSource,
  inviteBanner: require('../assets/images/invite-banner.png') as AssetSource,
  woodenSignFarms: require('../assets/images/wooden-sign-happy-farms.png') as AssetSource,
  homeFarmSign: require('../assets/images/home-farm-sign.png') as AssetSource,
  grassFringe: require('../assets/images/grass-fringe.png') as AssetSource,
  cartMilkCan: require('../assets/images/cart-milk-can-clean.png') as AssetSource,
  securityShield: require('../assets/images/security-shield.png') as AssetSource,
  cartFooter: require('../assets/images/cart-footer-base.png') as AssetSource,
  grassBand: require('../assets/images/grass-band-clean.png') as AssetSource,
  footerCow: require('../assets/images/footer-cow-clean.png') as AssetSource,

  // Mascots & decorative sprites
  cowMascot: require('../assets/images/cow-mascot.png') as AssetSource,
  cowOnCart: require('../assets/images/cow-on-cart.png') as AssetSource,
  babyCow: require('../assets/images/baby-cow.png') as AssetSource,
  navCow: require('../assets/images/nav-cow-cut.png') as AssetSource,
  leafA: require('../assets/images/leaf-a.png') as AssetSource,
  leafB: require('../assets/images/leaf-b.png') as AssetSource,

  // Products
  bottleA2: require('../assets/images/bottle-a2-milk.png') as AssetSource,
  bottleBuffalo: require('../assets/images/bottle-buffalo-milk.png') as AssetSource,
  bottleButtermilk: require('../assets/images/buttermilk.png') as AssetSource,
  paneer: require('../assets/images/paneer.png') as AssetSource,
  gheeJar: require('../assets/images/ghee-jar.png') as AssetSource,
  crateMilk: require('../assets/images/crate-milk.png') as AssetSource,

  // Category artwork (square tiles cropped from the reference sheet)
  categoryMilk: require('../assets/images/category-milk.png') as AssetSource,
  categoryCurd: require('../assets/images/category-curd.png') as AssetSource,
  categoryPaneer: require('../assets/images/category-paneer.png') as AssetSource,
  categoryGhee: require('../assets/images/category-ghee.png') as AssetSource,
  categoryButter: require('../assets/images/category-butter.png') as AssetSource,
  categoryButtermilk: require('../assets/images/category-buttermilk.png') as AssetSource,
  categoryLassi: require('../assets/images/category-lassi.png') as AssetSource,
  chipMilk: require('../assets/images/thumb-milk.png') as AssetSource,
  chipCurd: require('../assets/images/thumb-curd.png') as AssetSource,
  chipPaneer: require('../assets/images/thumb-paneer.png') as AssetSource,
  chipGhee: require('../assets/images/thumb-ghee.png') as AssetSource,
  chipButter: require('../assets/images/thumb-butter.png') as AssetSource,
} as const;

export type DairyImage = keyof typeof images;
