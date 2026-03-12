/**
 * app/(setup)/invite-code.tsx
 *
 * For Manager roles only (manager_company, manager_boat).
 * Owner sends an invite code → manager enters it here → gets access.
 *
 * Receives: ?type=company | boat
 *
 * On valid code → calls POST /api/v1/invitations/accept →
 *                 setSetupComplete → routes to /(manager)/home
 */

import { ApiError } from '@/services/api'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../constants/theme'
import { useAuthStore } from '../../store/authStore'
import { Entity, ENTITY_ACCENTS, useEntityStore } from '../../store/entityStore'

const ACCENT = '#0891b2'

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InviteCodeScreen() {
  const { type } = useLocalSearchParams<{ type: 'company' | 'boat' }>()
  const isCompany = type !== 'boat'

  const { token, setSetupComplete } = useAuthStore()
  const { setActiveEntity } = useEntityStore()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<TextInput>(null)

  const isValid = code.trim().length >= 4

  const handleAccept = async () => {
    if (!isValid || !token || loading) return
    setError(null)
    setLoading(true)

    try {
      // TODO: replace with real invite accept API
      // const result = await acceptInvitation(token, code.trim().toUpperCase())
      // For now — mock accept and route to manager dashboard
      await new Promise(r => setTimeout(r, 1000)) // simulate API call

      // Mock: build a local entity representing the manager context
      const localEntity: Entity = {
        id: `manager_${code}`,
        type: 'MANAGER_COMPANY',
        label: isCompany ? 'Company (Manager)' : 'Boat (Manager)',
        sublabel: `Manager access · code ${code.toUpperCase()}`,
        accent: ENTITY_ACCENTS.MANAGER_COMPANY,
        role: 'manager',
        permissions: isCompany
          ? ['CREATE_TALI', 'VIEW_TALI', 'VIEW_BILL', 'ADD_COMPANY_EXPENSE', 'VIEW_EMPLOYEE_RECORDS']
          : ['ADD_BOAT_EXPENSE', 'VIEW_BOAT_EXPENSE', 'CREATE_TALI', 'VIEW_TALI'],
      }
      setActiveEntity(localEntity)
      await setSetupComplete([])

      router.replace('/(manager)/home' as any)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Invalid or expired invite code. Ask your owner to resend it.'
      )
      setLoading(false)
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={s.bg}>
        <View style={s.bgCircle} />

        <SafeAreaView style={s.safe}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={s.kav}
          >
            {/* Back */}
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Hero */}
            <View style={s.hero}>
              <View style={s.heroIcon}>
                <Text style={s.heroEmoji}>{isCompany ? '👔' : '⚓'}</Text>
              </View>
              <Text style={s.heroTitle}>Enter your{'\n'}invite code</Text>
              <Text style={s.heroSub}>
                Your {isCompany ? 'company owner' : 'boat owner'} should have sent you a code.
                Ask them if you don't have one yet.
              </Text>
            </View>

            {/* Code Input */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={s.codeCard}
            >
              <Text style={s.codeLabel}>INVITE CODE</Text>
              <TextInput
                ref={inputRef}
                style={s.codeInput}
                value={code}
                onChangeText={v => { setCode(v.toUpperCase()); setError(null) }}
                placeholder="e.g. SURESH-K7X2"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                autoFocus
                editable={!loading}
                onSubmitEditing={handleAccept}
                returnKeyType="go"
              />
              <Text style={s.codeHint}>
                Codes look like: RAMESH-AB12 or ABC-1234
              </Text>
            </TouchableOpacity>

            {/* Error */}
            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {/* What happens next */}
            <View style={s.infoCard}>
              <Text style={s.infoTitle}>What happens after?</Text>
              {[
                'Your access is activated instantly',
                `You see only what the owner has permitted`,
                'Owner can change your permissions anytime',
                'You can also own boats separately',
              ].map(line => (
                <View key={line} style={s.infoRow}>
                  <Text style={[s.infoDot, { color: ACCENT }]}>→</Text>
                  <Text style={s.infoText}>{line}</Text>
                </View>
              ))}
            </View>

            {/* Submit */}
            <View style={s.bottomArea}>
              <TouchableOpacity
                style={[s.submitBtn, !isValid && s.submitBtnOff]}
                onPress={handleAccept}
                disabled={!isValid || loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={[s.submitBtnText, !isValid && s.submitBtnTextOff]}>
                      Activate Access →
                    </Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={s.skipBtn} onPress={() => router.back()}>
                <Text style={s.skipText}>I don't have a code yet</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0a1628' },
  bgCircle: {
    position: 'absolute', top: -80, right: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(8,145,178,0.07)',
  },
  safe: { flex: 1 },
  kav: { flex: 1, padding: 20, gap: 20 },

  backBtn: { alignSelf: 'flex-start', paddingVertical: 4 },
  backText: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600' },

  hero: { gap: 10, paddingVertical: 8 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: ACCENT + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 34 },
  heroTitle: {
    fontSize: 28, fontWeight: '800',
    color: theme.colors.textPrimary, letterSpacing: -0.4,
    marginTop: 4,
  },
  heroSub: {
    fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20,
  },

  codeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18, borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18, gap: 10,
  },
  codeLabel: {
    fontSize: 11, fontWeight: '700',
    color: ACCENT, letterSpacing: 1,
  },
  codeInput: {
    height: 56, backgroundColor: theme.colors.elevated,
    borderRadius: 12, paddingHorizontal: 16,
    fontSize: 20, fontWeight: '800',
    color: theme.colors.textPrimary,
    borderWidth: 1, borderColor: theme.colors.borderStrong,
    letterSpacing: 2,
  },
  codeHint: { fontSize: 12, color: theme.colors.textMuted },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: { color: '#f87171', fontSize: 13 },

  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16, borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16, gap: 10,
  },
  infoTitle: {
    fontSize: 12, fontWeight: '700',
    color: theme.colors.textMuted, letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoDot: { fontSize: 13, fontWeight: '800' },
  infoText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },

  bottomArea: { gap: 10, marginTop: 'auto' },
  submitBtn: {
    height: 56, borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnOff: { backgroundColor: 'rgba(8,145,178,0.15)' },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  submitBtnTextOff: { color: 'rgba(255,255,255,0.3)' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '600' },
})