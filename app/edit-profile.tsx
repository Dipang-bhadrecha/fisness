/**
 * app/edit-profile.tsx — Edit Profile
 *
 * Allows user to update their display name.
 * Phone is read-only (used for login via OTP).
 *
 * TODO (backend): Add PATCH /api/v1/auth/me endpoint, then wire up:
 *   import { updateProfile } from '../services/api'
 *   await updateProfile(token!, { name: name.trim() })
 */

import { useTheme } from '@/store/themeStore'
import { router } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../store/authStore'

export default function EditProfileScreen() {
  const { user } = useAuthStore()
  const theme = useTheme()
  const s = useMemo(() => createStyles(theme), [theme])
  const [name, setName] = useState(user?.name ?? '')
  const [nameFocused, setNameFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const nameInputRef = useRef<TextInput>(null)

  // Animated label float for name field
  const nameLabelAnim = useRef(new Animated.Value(name.length > 0 ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(nameLabelAnim, {
      toValue: nameFocused || name.length > 0 ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start()
  }, [nameFocused, name])

  const nameLabelTop = nameLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 6] })
  const nameLabelSize = nameLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] })
  const nameLabelColor = nameLabelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.textDisabled, nameFocused ? theme.colors.primary : theme.colors.textSecondary],
  })

  const originalName = user?.name ?? ''
  const isChanged = name.trim() !== originalName.trim()
  const isValid = name.trim().length >= 2

  const handleSave = async () => {
    setNameError(null)
    if (!name.trim()) { setNameError('Name cannot be empty'); return }
    if (name.trim().length < 2) { setNameError('Must be at least 2 characters'); return }

    setLoading(true)
    try {
      // TODO: Uncomment when PATCH /api/v1/auth/me is ready on backend
      // await updateProfile(token!, { name: name.trim() })

      // Locally update the store for now
      useAuthStore.setState(s => ({
        user: s.user ? { ...s.user, name: name.trim() } : s.user,
      }))

      setSaved(true)
      setTimeout(() => router.back(), 900)
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initials = name.trim()
    ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : (user?.name ?? '?')[0]?.toUpperCase() ?? '?'

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* ── Header ──────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.iconBtnText}>←</Text>
        </TouchableOpacity>

        <Text style={s.headerTitle}>Edit Profile</Text>

        <TouchableOpacity
          style={[s.saveBtn, (!isChanged || !isValid || loading || saved) && s.saveBtnOff]}
          onPress={handleSave}
          disabled={!isChanged || !isValid || loading || saved}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.textPrimary} />
          ) : saved ? (
            <Text style={s.saveBtnText}>✓ Done</Text>
          ) : (
            <Text style={[s.saveBtnText, (!isChanged || !isValid) && s.saveBtnTextOff]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Avatar ──────────────────────────────── */}
          <View style={s.avatarWrap}>
            <View style={s.avatarOuter}>
              <View style={s.avatarInner}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
            </View>
            <View style={s.avatarMeta}>
              <Text style={s.avatarName}>{name.trim() || 'Your Name'}</Text>
              <Text style={s.avatarPhone}>+91 {user?.phone ?? '—'}</Text>
            </View>
          </View>

          {/* ── Form card ───────────────────────────── */}
          <View style={s.card}>

            {/* Name — floating label input */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldSection}>PERSONAL INFO</Text>

              <TouchableOpacity
                style={[
                  s.floatBox,
                  nameFocused && s.floatBoxFocused,
                  !!nameError && s.floatBoxError,
                ]}
                activeOpacity={1}
                onPress={() => nameInputRef.current?.focus()}
              >
                <Animated.Text style={[s.floatLabel, { top: nameLabelTop, fontSize: nameLabelSize, color: nameLabelColor as any }]}>
                  Full Name
                </Animated.Text>
                <View style={s.floatRow}>
                  <TextInput
                    ref={nameInputRef}
                    style={s.floatInput}
                    value={name}
                    onChangeText={v => { setName(v); setNameError(null); setSaved(false) }}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                    maxLength={50}
                    selectionColor={theme.colors.primary}
                  />
                  {name.length > 0 && (
                    <TouchableOpacity onPress={() => { setName(''); setSaved(false) }} style={s.clearBtn}>
                      <Text style={s.clearBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>

              {/* Error / char count row */}
              <View style={s.fieldMeta}>
                {nameError
                  ? <Text style={s.errorText}>⚠ {nameError}</Text>
                  : <Text style={s.charCount}>{name.length} / 50</Text>
                }
              </View>
            </View>

            <View style={s.divider} />

            {/* Phone — locked */}
            <View style={s.fieldWrap}>
              <View style={s.lockedBox}>
                <View style={s.lockedLeft}>
                  <Text style={s.lockedLabel}>Phone Number</Text>
                  <Text style={s.lockedValue}>+91 {user?.phone ?? '—'}</Text>
                </View>
                <View style={s.lockBadge}>
                  <Text style={s.lockIcon}>🔒</Text>
                  <Text style={s.lockText}>Locked</Text>
                </View>
              </View>
              <Text style={s.lockedHint}>
                Your phone number is used for login and cannot be changed.
              </Text>
            </View>

          </View>

          {/* ── Info banner ─────────────────────────── */}
          <View style={s.infoBanner}>
            <Text style={s.infoEmoji}>💡</Text>
            <Text style={s.infoText}>
              Your name appears on bills, tali sessions, and is visible to your team.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  const TEAL = theme.colors.primary
  const BG   = theme.colors.background
  const SURF = theme.colors.surface
  const ELEV = theme.colors.elevated
  const BOR  = theme.colors.border
  const TP   = theme.colors.textPrimary
  const TS   = theme.colors.textSecondary
  const TD   = theme.colors.textDisabled
  const ERR  = theme.colors.danger
  const RAD  = theme.radius

  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // ── Header ──────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SURF,
    borderBottomWidth: 1,
    borderBottomColor: BOR,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: RAD.sm,
    backgroundColor: ELEV,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BOR,
  },
  iconBtnText: { color: TP, fontSize: 18, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: TP, letterSpacing: -0.3 },
  saveBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    minWidth: 64,
    alignItems: 'center',
  },
  saveBtnOff: { backgroundColor: ELEV, borderWidth: 1, borderColor: BOR },
  saveBtnText: { color: '#080F1A', fontSize: 14, fontWeight: '800' },
  saveBtnTextOff: { color: TD },

  // ── Scroll ──────────────────────────────────────────
  scroll: { padding: 20, gap: 20 },

  // ── Avatar ──────────────────────────────────────────
  avatarWrap: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatarOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: TEAL,
    padding: 3,
    backgroundColor: 'transparent',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#080F1A' },
  avatarMeta: { alignItems: 'center', gap: 3 },
  avatarName: { fontSize: 18, fontWeight: '800', color: TP, letterSpacing: -0.3 },
  avatarPhone: { fontSize: 13, color: TS },

  // ── Card ────────────────────────────────────────────
  card: {
    backgroundColor: SURF,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BOR,
    overflow: 'hidden',
  },

  // ── Field wrapper ────────────────────────────────────
  fieldWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  fieldSection: {
    fontSize: 10,
    fontWeight: '800',
    color: TD,
    letterSpacing: 1.8,
    marginBottom: 10,
  },

  // ── Floating label input ─────────────────────────────
  floatBox: {
    backgroundColor: ELEV,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BOR,
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 10,
    minHeight: 60,
  },
  floatBoxFocused: { borderColor: TEAL, backgroundColor: 'rgba(0,194,203,0.05)' },
  floatBoxError: { borderColor: ERR, backgroundColor: 'rgba(239,68,68,0.05)' },
  floatLabel: {
    position: 'absolute',
    left: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  floatRow: { flexDirection: 'row', alignItems: 'center' },
  floatInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: TP,
    padding: 0,
  },
  clearBtn: { padding: 6, marginLeft: 4 },
  clearBtnText: { fontSize: 13, color: TD },

  fieldMeta: { flexDirection: 'row', marginTop: 6, marginLeft: 2 },
  errorText: { fontSize: 12, color: ERR, fontWeight: '600' },
  charCount: { fontSize: 11, color: TD, marginLeft: 'auto' },

  // ── Divider ─────────────────────────────────────────
  divider: { height: 1, backgroundColor: BOR, marginHorizontal: 16 },

  // ── Locked phone field ───────────────────────────────
  lockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ELEV,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: BOR,
    opacity: 0.75,
  },
  lockedLeft: { gap: 3 },
  lockedLabel: { fontSize: 11, fontWeight: '700', color: TD, letterSpacing: 0.5 },
  lockedValue: { fontSize: 16, fontWeight: '600', color: TS },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BG,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: BOR,
  },
  lockIcon: { fontSize: 11 },
  lockText: { fontSize: 11, color: TD, fontWeight: '700' },
  lockedHint: { fontSize: 12, color: TD, marginTop: 8, marginLeft: 2, lineHeight: 17 },

  // ── Info banner ──────────────────────────────────────
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(0,194,203,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,194,203,0.15)',
    padding: 14,
    alignItems: 'flex-start',
  },
  infoEmoji: { fontSize: 15, marginTop: 1 },
  infoText: { flex: 1, fontSize: 13, color: TS, lineHeight: 19 },
  })
}
