import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { PressableScale } from '@/components/animations/PressableScale';
import { Reveal } from '@/components/animations/Reveal';
import { GrassBand } from '@/components/layout/GrassBand';
import { AddressSheet } from '@/components/sheets/AddressSheet';
import { InfoSheet } from '@/components/sheets/InfoSheet';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { HeaderIcon } from '@/components/ui/HeaderIcon';
import { Screen } from '@/components/ui/Screen';
import { images } from '@/constants/assets';
import { colors, fonts, radii, shadows } from '@/constants/theme';
import {
  profileQuickActions,
  profileUser,
  supportItems,
  walletTransactions,
  type SupportItem,
} from '@/data/profile';
import { useMetrics } from '@/hooks/useMetrics';
import { useRefresh } from '@/hooks/useRefresh';
import { useUserStore } from '@/store/userStore';
import { formatCurrency } from '@/utils/format';
import { successFeedback } from '@/utils/haptics';

const supportIcons: Record<SupportItem['icon'], keyof typeof Ionicons.glyphMap> = {
  headset: 'headset-outline',
  help: 'help-circle-outline',
  shield: 'shield-checkmark-outline',
  document: 'document-text-outline',
  information: 'information-circle-outline',
};

export default function ProfileScreen() {
  const metrics = useMetrics();
  const { refreshing, onRefresh } = useRefresh();
  const name = useUserStore((state) => state.name);
  const phone = useUserStore((state) => state.phone);
  const wallet = useUserStore((state) => state.wallet);
  const topUpWallet = useUserStore((state) => state.topUpWallet);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [referOpen, setReferOpen] = useState(false);
  const [info, setInfo] = useState<SupportItem | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [offersOn, setOffersOn] = useState(true);
  const [hapticsOn, setHapticsOn] = useState(true);
  const [toppedUp, setToppedUp] = useState(false);

  const horizontal = metrics.gutter + 16;
  const contentWidth = Math.min(metrics.width, metrics.contentMax) - 32;
  const bannerHeight = Math.max(208, Math.min(248, metrics.width / 1.7));

  const openPayments = () =>
    setInfo({
      key: 'payments',
      label: 'Payment Methods',
      icon: 'shield',
      body: 'Your UPI ID rahul@okhdfcbank and a Visa ending in 4421 are saved for one-tap payments. Card details are tokenised and never stored on our servers.',
    });

  const shareInvite = async () => {
    try {
      await Share.share({
        message:
          'Fresh dairy from happy farms, delivered by 7 AM. Join me on DairyDirect and get ₹100 off your first order. Use my code RAHUL100.',
      });
    } catch {
      // The native share sheet can be dismissed; nothing else to do.
    }
  };

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
            source={images.profileBanner}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={150}
          />
          <View
            style={[
              styles.bannerHeader,
              { paddingTop: metrics.insets.top + 14, paddingHorizontal: horizontal },
            ]}
          >
            <AppText style={styles.bannerTitle}>Profile</AppText>
            <HeaderIcon
              name="settings-outline"
              onPress={() => setSettingsOpen(true)}
              accessibilityLabel="Settings"
            />
          </View>
        </View>

        <View style={[styles.sheet, { marginTop: -10, paddingHorizontal: horizontal }]}>
          <Reveal direction="up" delay={20}>
            <PressableScale
              onPress={() =>
                setInfo({
                  key: 'account',
                  label: 'Your account',
                  icon: 'information',
                  body: `You have been part of DairyDirect since ${profileUser.memberSince}. Your number ${phone} is verified for delivery updates.`,
                })
              }
              haptic="select"
              style={[styles.profileRow, { width: contentWidth }]}
            >
              <View style={styles.avatarWrap}>
                <Image source={images.avatarRahul} style={styles.avatar} contentFit="cover" />
                <View style={styles.avatarCheck}>
                  <Ionicons name="checkmark" size={10} color={colors.inverse} />
                </View>
              </View>
              <View style={styles.profileBody}>
                <AppText style={styles.profileName}>{name}</AppText>
                <AppText style={styles.profilePhone}>{phone}</AppText>
                <View style={styles.verifiedRow}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.green} />
                  <AppText style={styles.verifiedText}>Verified customer</AppText>
                </View>
              </View>
              <View style={styles.chevron}>
                <Ionicons name="chevron-forward" size={18} color={colors.brown} />
              </View>
            </PressableScale>
          </Reveal>

          <Reveal direction="up" delay={80}>
            <View style={[styles.quickGrid, { width: contentWidth }]}>
              {profileQuickActions.map((action) => (
                <PressableScale
                  key={action.key}
                  onPress={() => {
                    if (action.key === 'addresses') setAddressOpen(true);
                    else if (action.key === 'payments') openPayments();
                    else if (action.key === 'wallet') setWalletOpen(true);
                    else setReferOpen(true);
                  }}
                  haptic="select"
                  style={styles.quickTile}
                  accessibilityLabel={action.label}
                >
                  <View style={styles.quickIcon}>
                    <Ionicons
                      name={action.icon}
                      size={23}
                      color={colors.brown}
                    />
                  </View>
                  <AppText style={styles.quickLabel} numberOfLines={1}>
                    {action.label}
                  </AppText>
                  {action.key === 'wallet' ? (
                    <AppText style={styles.walletAmount}>{formatCurrency(wallet)}</AppText>
                  ) : null}
                </PressableScale>
              ))}
            </View>
          </Reveal>

          <Reveal direction="up" delay={140}>
            <PressableScale
              onPress={() => setReferOpen(true)}
              haptic="select"
              style={[styles.invite, { width: contentWidth, height: contentWidth / 2.76 }]}
              accessibilityLabel="Invite friends and earn 100 rupees"
            >
              <Image source={images.inviteBanner} style={styles.inviteImage} contentFit="cover" />
            </PressableScale>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <View style={[styles.supportHeader, { width: contentWidth }]}>
              <AppText style={styles.supportTitle}>Support & More</AppText>
              <AppText style={styles.supportSub}>We are one message away.</AppText>
            </View>
            <View style={[styles.supportCard, { width: contentWidth }]}>
              {supportItems.map((item, index) => (
                <PressableScale
                  key={item.key}
                  onPress={() => setInfo(item)}
                  haptic="select"
                  style={[
                    styles.supportRow,
                    index === supportItems.length - 1 ? null : styles.supportBorder,
                  ]}
                  accessibilityLabel={item.label}
                >
                  <View style={styles.supportIcon}>
                    <Ionicons name={supportIcons[item.icon]} size={19} color={colors.brown} />
                  </View>
                  <AppText style={styles.supportLabel}>{item.label}</AppText>
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedLight} />
                </PressableScale>
              ))}
            </View>
          </Reveal>

          <View style={[styles.footer, { width: contentWidth }]}>
            <Image source={images.logoEmblem} style={styles.footerLogo} contentFit="contain" />
            <AppText style={styles.footerText}>DairyDirect · Pure by nature</AppText>
            <AppText style={styles.footerVersion}>Version 1.0.0 · Made with care in Bengaluru</AppText>
          </View>
        </View>
      </ScrollView>

      <GrassBand />

      <AddressSheet visible={addressOpen} onClose={() => setAddressOpen(false)} />
      <InfoSheet
        visible={info !== null}
        onClose={() => setInfo(null)}
        title={info?.label ?? ''}
        body={info?.body ?? ''}
        icon="leaf-outline"
        footnote={
          info?.key === 'help'
            ? 'Daily 6 AM – 9 PM · care@dairydirect.in · +91 98765 43210'
            : undefined
        }
      />

      <BottomSheet
        visible={walletOpen}
        onClose={() => {
          setWalletOpen(false);
          setToppedUp(false);
        }}
        title="DairyDirect wallet"
        subtitle="Instant refunds, cashback and referral rewards."
      >
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View>
              <AppText style={styles.walletLabel}>AVAILABLE BALANCE</AppText>
              <AppText style={styles.walletValue}>{formatCurrency(wallet)}</AppText>
            </View>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={22} color={colors.inverse} />
            </View>
          </View>
          <AppText style={styles.walletHint}>Use at checkout · never expires</AppText>
        </View>

        <View style={styles.walletActions}>
          <Button
            label={toppedUp ? '₹100 added' : 'Add ₹100'}
            icon={toppedUp ? 'checkmark' : 'add'}
            size="sm"
            variant={toppedUp ? 'soft' : 'primary'}
            onPress={() => {
              if (toppedUp) return;
              topUpWallet(100);
              setToppedUp(true);
              successFeedback();
            }}
          />
          <Button
            label="Invite & earn"
            icon="gift-outline"
            size="sm"
            variant="soft"
            onPress={() => {
              setWalletOpen(false);
              setReferOpen(true);
            }}
          />
        </View>

        <AppText style={styles.walletHistoryTitle}>Recent activity</AppText>
        <View style={styles.walletHistory}>
          {walletTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.walletRow}>
              <View
                style={[
                  styles.walletDot,
                  transaction.type === 'credit' ? styles.creditDot : styles.debitDot,
                ]}
              >
                <Ionicons
                  name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={13}
                  color={transaction.type === 'credit' ? colors.green : colors.brown}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.walletItem}>{transaction.title}</AppText>
                <AppText style={styles.walletDate}>{transaction.date}</AppText>
              </View>
              <AppText
                style={[
                  styles.walletAmountRow,
                  transaction.type === 'credit' ? styles.creditText : styles.debitText,
                ]}
              >
                {transaction.type === 'credit' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </AppText>
            </View>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={referOpen}
        onClose={() => setReferOpen(false)}
        title="Invite friends & earn ₹100"
        subtitle="They get ₹100 off, you get ₹100 when their first crate lands."
      >
        <View style={styles.referCard}>
          <Image source={images.babyCow} style={styles.referCow} contentFit="contain" />
          <View style={{ flex: 1 }}>
            <AppText style={styles.referLabel}>YOUR INVITE CODE</AppText>
            <View style={styles.referCodeRow}>
              <AppText style={styles.referCode}>RAHUL100</AppText>
              <Badge tone="soft">₹100 each</Badge>
            </View>
            <AppText style={styles.referBody}>
              Share it with a neighbour. Fresh milk is better when the whole street joins in.
            </AppText>
          </View>
        </View>
        <Button
          label="Share my invite"
          icon="share-social-outline"
          fullWidth
          onPress={shareInvite}
          style={{ marginTop: 16 }}
        />
      </BottomSheet>

      <BottomSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        subtitle="Make DairyDirect feel like your own."
      >
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="notifications-outline"
            label="Delivery notifications"
            body="A quiet ping when your crate lands."
            value={notificationsOn}
            onChange={setNotificationsOn}
          />
          <SettingRow
            icon="pricetag-outline"
            label="Offers & farm stories"
            body="Occasional savings and news from the farms."
            value={offersOn}
            onChange={setOffersOn}
          />
          <SettingRow
            icon="phone-portrait-outline"
            label="Haptics"
            body="A gentle tap for every meaningful action."
            value={hapticsOn}
            onChange={setHapticsOn}
          />
        </View>
        <View style={styles.settingsNote}>
          <Ionicons name="lock-closed-outline" size={15} color={colors.green} />
          <AppText style={styles.settingsNoteText}>
            Your address, orders and payments stay private. We never sell personal data.
          </AppText>
        </View>
        <Button
          label="Manage account"
          variant="soft"
          fullWidth
          icon="person-outline"
          onPress={() => {
            setSettingsOpen(false);
            setInfo({
              key: 'account',
              label: 'Your account',
              icon: 'information',
              body: `Signed in as ${name} · ${phone}. Member since ${profileUser.memberSince}.`,
            });
          }}
          style={{ marginTop: 16 }}
        />
        <AppText style={styles.settingsVersion}>DairyDirect v1.0.0</AppText>
      </BottomSheet>
    </Screen>
  );
}

function SettingRow({
  icon,
  label,
  body,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  body: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={19} color={colors.brown} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={styles.settingLabel}>{label}</AppText>
        <AppText style={styles.settingBody}>{body}</AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.lineStrong, true: colors.greenLight }}
        thumbColor={colors.surfaceStrong}
        ios_backgroundColor={colors.lineStrong}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 23,
    lineHeight: 30,
    color: colors.brownDark,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(255,250,240,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  sheet: {
    marginTop: -42,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 18,
    minHeight: 520,
    ...shadows.card,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 4,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 70,
    height: 70,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    borderColor: colors.surfaceStrong,
  },
  avatarCheck: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBody: {
    flex: 1,
    gap: 1,
  },
  profileName: {
    fontFamily: fonts.semibold,
    fontSize: 19,
    lineHeight: 25,
    color: colors.text,
  },
  profilePhone: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.green,
  },
  chevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.tiny,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 7,
  },
  quickTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 78,
    paddingHorizontal: 2,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.tiny,
  },
  quickIcon: {
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: fonts.medium,
    fontSize: 8.2,
    lineHeight: 12,
    letterSpacing: -0.15,
    color: colors.text,
    textAlign: 'center',
  },
  walletAmount: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    lineHeight: 12,
    color: colors.green,
    marginTop: -2,
  },
  invite: {
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.card,
  },
  inviteImage: {
    width: '100%',
    height: '100%',
  },
  supportHeader: {
    marginTop: 18,
    marginBottom: 8,
  },
  supportTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  supportSub: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.muted,
    marginTop: 1,
  },
  supportCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(233,218,196,0.55)',
    overflow: 'hidden',
    ...shadows.tiny,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  supportBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  supportIcon: {
    width: 30,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 8,
    gap: 3,
  },
  footerLogo: {
    width: 38,
    height: 30,
    opacity: 0.8,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textSecondary,
  },
  footerVersion: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: colors.mutedLight,
  },
  walletCard: {
    borderRadius: radii.lg,
    backgroundColor: colors.greenDark,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  walletTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  walletLabel: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    letterSpacing: 0.8,
    color: 'rgba(255,253,248,0.68)',
  },
  walletValue: {
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 38,
    color: colors.inverse,
    marginTop: 2,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletHint: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: 'rgba(255,253,248,0.72)',
    marginTop: 8,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 8,
  },
  walletHistoryTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.text,
    marginTop: 18,
    marginBottom: 6,
  },
  walletHistory: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  walletDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditDot: {
    backgroundColor: colors.greenSoft,
  },
  debitDot: {
    backgroundColor: colors.peachSoft,
  },
  walletItem: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text,
  },
  walletDate: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
  },
  walletAmountRow: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  creditText: {
    color: colors.green,
  },
  debitText: {
    color: colors.brown,
  },
  referCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.greenIce,
    borderWidth: 1,
    borderColor: colors.greenTint,
  },
  referCow: {
    width: 78,
    height: 90,
  },
  referLabel: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    letterSpacing: 0.7,
    color: colors.muted,
  },
  referCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 3,
  },
  referCode: {
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: 1,
    color: colors.greenDark,
  },
  referBody: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textSecondary,
  },
  settingsGroup: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.text,
  },
  settingBody: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: colors.muted,
    marginTop: 1,
  },
  settingsNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 11,
    borderRadius: radii.md,
    backgroundColor: colors.greenIce,
  },
  settingsNoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  settingsVersion: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.mutedLight,
    textAlign: 'center',
    marginTop: 14,
  },
});
