import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLanguage } from '../hooks/useLanguage'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const BG = '#080F1A'
const SURF = '#0D1B2E'
const ELEV = '#132640'
const BOR = 'rgba(255,255,255,0.06)'
const TP = '#F0F4F8'
const TS = '#8BA3BC'
const TM = '#3D5A73'
const TEAL = '#0891b2'
const RED = '#ef4444'

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  sub?: string
  value?: string
  onPress?: () => void
  danger?: boolean
  showArrow?: boolean
}

function SettingRow({
  icon,
  label,
  sub,
  value,
  onPress,
  danger,
  showArrow = true,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={s.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
    >
      <View style={[s.rowIcon, danger && s.rowIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? RED : TP} />
      </View>
      <View style={s.rowText}>
        <Text style={[s.rowLabel, danger && s.rowLabelDanger]}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
      {showArrow && onPress ? <Ionicons name="chevron-forward" size={18} color={TM} /> : null}
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const { language, setLanguage } = useLanguage()
  const { user, logout } = useAuthStore()
  const { mode, setMode } = useThemeStore()

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/(auth)/phone')
          },
        },
      ]
    )
  }

  const handleLanguageToggle = async () => {
    await setLanguage(language === 'en' ? 'gu' : 'en')
  }

  const handleThemeToggle = async () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark'
    await setMode(nextMode)
  }

  const firstLetter = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(home)' as any))}
          >
            <Ionicons name="arrow-back" size={20} color={TP} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Profile</Text>
          <View style={s.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.profileCard}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{firstLetter}</Text>
            </View>
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{user?.name ?? 'User'}</Text>
              <Text style={s.profilePhone}>+91 {user?.phone ?? '—'}</Text>
              <View style={s.roleBadge}>
                <Text style={s.roleBadgeText}>Boat Owner</Text>
              </View>
            </View>
          </View>

          <Text style={s.sectionTitle}>ACCOUNT</Text>
          <View style={s.section}>
            <SettingRow
              icon="person-outline"
              label="Edit Profile"
              sub="Name, phone number"
              onPress={() => router.push('/edit-profile' as any)}
            />
            <View style={s.divider} />
            <SettingRow
              icon="business-outline"
              label="Company"
              sub="Manage your company details"
            />
            <View style={s.divider} />
            <SettingRow
              icon="boat-outline"
              label="Boats"
              sub="Register and manage boats"
              onPress={() => router.push('/boats' as any)}
            />
            <View style={s.divider} />
            <SettingRow
              icon="lock-closed-outline"
              label="Access"
              sub="Manage who can use your account"
              onPress={() => router.push('/access' as any)}
            />
          </View>

          <Text style={s.sectionTitle}>PREFERENCES</Text>
          <View style={s.section}>
            <SettingRow
              icon="language-outline"
              label="Language"
              sub="App display language"
              value={language === 'en' ? 'English' : 'Gujarati'}
              onPress={handleLanguageToggle}
            />
            <View style={s.divider} />
            <SettingRow
              icon={mode === 'dark' ? 'moon-outline' : 'sunny-outline'}
              label="Theme"
              sub={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`}
              value={mode === 'dark' ? 'Dark' : 'Light'}
              onPress={handleThemeToggle}
            />
            <View style={s.divider} />
            <SettingRow
              icon="notifications-outline"
              label="Notifications"
              sub="Manage alerts"
            />
          </View>

          <Text style={s.sectionTitle}>SUPPORT</Text>
          <View style={s.section}>
            <SettingRow
              icon="help-circle-outline"
              label="Help and FAQ"
              sub="How to use Fishness"
            />
            <View style={s.divider} />
            <SettingRow
              icon="call-outline"
              label="Contact Support"
              sub="Reach out for help"
            />
            <View style={s.divider} />
            <SettingRow
              icon="information-circle-outline"
              label="App Version"
              value="v1.0.0"
              showArrow={false}
            />
          </View>

          <Text style={s.sectionTitle}>SESSION</Text>
          <View style={s.section}>
            <SettingRow
              icon="log-out-outline"
              label="Logout"
              sub="Sign out of your account"
              onPress={handleLogout}
              danger
              showArrow={false}
            />
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>Fishness</Text>
            <Text style={s.footerSub}>Your fishing workspace</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BOR,
    backgroundColor: BG,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ELEV,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: TP },
  headerSpacer: { width: 38 },
  scroll: { padding: 16, gap: 10, paddingBottom: 28 },
  profileCard: {
    backgroundColor: SURF,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BOR,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TEAL,
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontWeight: '800', color: TP },
  profilePhone: { fontSize: 13, color: TS },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: ELEV,
    borderWidth: 1,
    borderColor: BOR,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: TEAL },
  sectionTitle: {
    marginTop: 8,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: TS,
  },
  section: {
    backgroundColor: SURF,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BOR,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: BOR, marginLeft: 62 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ELEV,
  },
  rowIconDanger: { backgroundColor: 'rgba(239,68,68,0.14)' },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: TP },
  rowLabelDanger: { color: RED },
  rowSub: { fontSize: 12, color: TS },
  rowValue: { fontSize: 13, fontWeight: '600', color: TS },
  footer: { alignItems: 'center', paddingVertical: 18, gap: 4 },
  footerText: { fontSize: 13, fontWeight: '700', color: TS },
  footerSub: { fontSize: 12, color: TM },
})
