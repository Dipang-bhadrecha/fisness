import { router } from 'expo-router'
import React from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { darkTheme, lightTheme } from '../constants/theme'
import { useLanguage } from '../hooks/useLanguage'
import { useAuthStore } from '../store/authStore'
import { useTheme, useThemeStore } from '../store/themeStore'

type SettingRowProps = {
  emoji: string
  label: string
  sub?: string
  value?: string
  onPress?: () => void
  danger?: boolean
  showArrow?: boolean
  styles: any
}

function SettingRow({
  emoji,
  label,
  sub,
  value,
  onPress,
  danger,
  showArrow = true,
  styles,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Text style={styles.rowEmoji}>{emoji}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {showArrow && onPress ? <Text style={styles.rowArrow}>›</Text> : null}
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const { language, setLanguage } = useLanguage()
  const { user, logout } = useAuthStore()
  const { mode, setMode } = useThemeStore()
  const theme = useTheme() 
  const activeTheme = mode === 'dark' ? darkTheme : lightTheme
  const s = React.useMemo(() => buildStyles(activeTheme), [activeTheme])

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

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'gu' : 'en')
  }

  const handleThemeToggle = async () => {
    const nextMode = mode === 'dark' ? 'light' : 'dark'
    await setMode(nextMode)
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.canGoBack() ? router.back() : null}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user?.name ?? 'User'}</Text>
            <Text style={s.profilePhone}>+91 {user?.phone ?? '—'}</Text>
            <View style={s.roleBadge}>
              <Text style={s.roleBadgeText}>⚓ Boat Owner</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <Text style={s.sectionTitle}>ACCOUNT</Text>
        <View style={s.section}>
          <SettingRow
            styles={s}
            emoji="👤"
            label="Edit Profile"
            sub="Name, phone number"
            onPress={() => router.push('/edit-profile' as any)}
          />
          <View style={s.divider} />
          <SettingRow
            styles={s}
            emoji="🏢"
            label="Company"
            sub="Manage your company details"
            onPress={() => console.log('TODO: company settings')}
          />
          <View style={s.divider} />
          <SettingRow
            styles={s}
            emoji="🚤"
            label="Boats"
            sub="Register & manage boats"
            onPress={() => console.log('TODO: boats management')}
          />
          <View style={s.divider} />
          <SettingRow
            styles={s}
            emoji="🔐"
            label="Access"
            sub="Manage who can use your account"
            onPress={() => router.push('/access' as any)}
          />
        </View>

        {/* Preferences Section */}
        <Text style={s.sectionTitle}>PREFERENCES</Text>
        <View style={s.section}>
          <SettingRow
            styles={s}
            emoji="🌐"
            label="Language"
            sub="App display language"
            value={language === 'en' ? 'English' : 'ગુજરાતી'}
            onPress={handleLanguageToggle}
          />
          <View style={s.divider} />
          <SettingRow
            styles={s}
            emoji={mode === 'dark' ? '🌙' : '☀️'}
            label="Theme"
            sub={`Tap to switch to ${mode === 'dark' ? 'Light' : 'Dark'}`}
            value={mode === 'dark' ? 'Dark' : 'Light'}
            onPress={handleThemeToggle}
          />
          <View style={s.divider} />
          <SettingRow
            styles={s}
            emoji="🔔"
            label="Notifications"
            sub="Manage alerts"
            onPress={() => console.log('TODO: notifications')}
          />
        </View>

        {/* Support Section */}
        <Text style={s.sectionTitle}>SUPPORT</Text>
        <View style={s.section}>
          <SettingRow
            styles={s}
            emoji="❓"
            label="Help & FAQ"
            sub="How to use Fishness"
            onPress={() => console.log('TODO: help')}
          />
          <View style={s.divider} />
          <SettingRow
            styles={s}
            emoji="📞"
            label="Contact Support"
            sub="Reach out for help"
            onPress={() => console.log('TODO: support')}
          />
          <View style={s.divider} />
          <SettingRow
            styles={s}
            emoji="ℹ️"
            label="App Version"
            value="v1.0.0"
            showArrow={false}
          />
        </View>

        {/* Logout */}
        <Text style={s.sectionTitle}>SESSION</Text>
        <View style={s.section}>
          <SettingRow
            styles={s}
            emoji="🚪"
            label="Logout"
            sub="Sign out of your account"
            onPress={handleLogout}
            danger
            showArrow={false}
          />
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Fishness · Knowmadic</Text>
          <Text style={s.footerSub}>Made for fishermen 🐟</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const buildStyles = (theme: typeof lightTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  scroll: {
    padding: 16,
    gap: 8,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  profilePhone: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.elevated,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 2,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 60,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEmoji: {
    fontSize: 18,
  },
  rowIconDanger: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  rowLabelDanger: {
    color: theme.colors.danger,
  },
  rowSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  rowValue: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  rowArrow: {
    fontSize: 22,
    color: theme.colors.textDisabled,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  footerSub: {
    fontSize: 12,
    color: theme.colors.textDisabled,
  },
})
