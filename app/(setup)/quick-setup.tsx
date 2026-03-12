/**
 * app/(setup)/quick-setup.tsx
 *
 * Minimal setup form — 1 or 2 fields depending on role.
 * This is the only screen between role-select and the dashboard.
 *
 * Receives: ?role=boat_owner | company_owner | both_owner
 *
 * boat_owner    → asks: "What's your first boat's name?"
 * company_owner → asks: "What's your company name?"
 * both_owner    → asks: company name + first boat name
 *
 * On submit → calls POST /api/v1/auth/setup → setSetupComplete →
 *             sets entityStore activeEntity → routes to correct dashboard
 */

import { ApiError, completeSetup } from '@/services/api'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { useEntityStore } from '../../store/entityStore'

type RoleParam = 'boat_owner' | 'company_owner' | 'both_owner'

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<RoleParam, {
  emoji: string
  title: string
  accent: string
  fields: Array<{
    key: 'companyName' | 'boatName'
    label: string
    placeholder: string
    hint: string
  }>
}> = {
  boat_owner: {
    emoji: '🚢',
    title: 'Set up your fleet',
    accent: '#1B7FBF',
    fields: [
      {
        key: 'boatName',
        label: "First boat's name",
        placeholder: 'e.g. Jai Mataji, Alpha, Sea Star',
        hint: 'You can add more boats from your dashboard',
      },
    ],
  },
  company_owner: {
    emoji: '🏢',
    title: 'Set up your company',
    accent: '#059669',
    fields: [
      {
        key: 'companyName',
        label: 'Company name',
        placeholder: 'e.g. Ramesh Fisheries, ABC Dango',
        hint: 'This name appears on all bills and reports',
      },
    ],
  },
  both_owner: {
    emoji: '🎯',
    title: 'Set up both',
    accent: '#7c3aed',
    fields: [
      {
        key: 'companyName',
        label: 'Company name',
        placeholder: 'e.g. Ramesh Fisheries',
        hint: 'Your registered company',
      },
      {
        key: 'boatName',
        label: 'First personal boat name',
        placeholder: 'e.g. Jai Mataji',
        hint: 'Your personally owned boat (separate from the company)',
      },
    ],
  },
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function QuickSetupScreen() {
  const { role } = useLocalSearchParams<{ role: string }>()
  const roleKey = (role as RoleParam) ?? 'company_owner'
  const config = ROLE_CONFIG[roleKey] ?? ROLE_CONFIG.company_owner

  const { token, setSetupComplete } = useAuthStore()
  const { finishSetup } = useEntityStore()

  const [companyName, setCompanyName] = useState('')
  const [boatName, setBoatName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const boatRef = useRef<TextInput>(null)

  // Validation
  const isValid = config.fields.every(f => {
    if (f.key === 'companyName') return companyName.trim().length >= 2
    if (f.key === 'boatName') return boatName.trim().length >= 1
    return true
  })

  const handleSubmit = async () => {
    if (!isValid || !token || saving) return
    setError(null)
    setSaving(true)

    try {
      // Build payload for backend
      const payload: any = {
        primaryRole: roleKey === 'both_owner' ? 'both' : 'owner',
        ownerType:
          roleKey === 'boat_owner'
            ? 'personal'
            : roleKey === 'company_owner'
            ? 'company'
            : 'both',
        companyName: companyName.trim() || undefined,
        firstBoatName: boatName.trim() || undefined,
      }

      const { workspaces } = await completeSetup(token, payload)
      await setSetupComplete(workspaces)

      // Populate entityStore and resolve homeVariant in one call
      const roles = roleKey === 'boat_owner'    ? ['boat_owner' as const]
                  : roleKey === 'company_owner'  ? ['company_owner' as const]
                  : ['boat_owner' as const, 'company_owner' as const]

      finishSetup({ roles, companyName: companyName.trim(), boatName: boatName.trim() })

      // All variants now route to (home) — context switcher handles the rest
      router.replace('/(home)' as any)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={s.bg}>
        <View style={[s.bgCircle, { backgroundColor: config.accent + '08' }]} />

        <SafeAreaView style={s.safe}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={s.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Back */}
              <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                <Text style={s.backText}>← Back</Text>
              </TouchableOpacity>

              {/* Hero */}
              <View style={s.hero}>
                <View style={[s.heroIcon, { backgroundColor: config.accent + '18' }]}>
                  <Text style={s.heroEmoji}>{config.emoji}</Text>
                </View>
                <Text style={s.heroTitle}>{config.title}</Text>
                <Text style={s.heroSub}>
                  Just {config.fields.length === 1 ? 'one detail' : 'two details'} and you're in.
                </Text>
              </View>

              {/* Fields */}
              <View style={s.fieldsCard}>
                {config.fields.map((field, idx) => (
                  <View key={field.key} style={[s.fieldBlock, idx > 0 && s.fieldBlockBorder]}>
                    <Text style={[s.fieldLabel, { color: config.accent }]}>{field.label}</Text>
                    <TextInput
                      ref={field.key === 'boatName' ? boatRef : undefined}
                      style={s.fieldInput}
                      placeholder={field.placeholder}
                      placeholderTextColor={theme.colors.textMuted}
                      value={field.key === 'companyName' ? companyName : boatName}
                      onChangeText={field.key === 'companyName' ? setCompanyName : setBoatName}
                      returnKeyType={idx < config.fields.length - 1 ? 'next' : 'done'}
                      onSubmitEditing={() => {
                        if (idx < config.fields.length - 1) boatRef.current?.focus()
                        else handleSubmit()
                      }}
                      autoFocus={idx === 0}
                      editable={!saving}
                    />
                    <Text style={s.fieldHint}>{field.hint}</Text>
                  </View>
                ))}
              </View>

              {/* Error */}
              {error && (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>⚠️ {error}</Text>
                </View>
              )}

              {/* What you get preview */}
              <View style={s.previewCard}>
                <Text style={[s.previewTitle, { color: config.accent }]}>
                  What you'll get
                </Text>
                <View style={s.previewList}>
                  {getFeatures(roleKey).map(f => (
                    <View key={f} style={s.previewRow}>
                      <Text style={[s.previewDot, { color: config.accent }]}>✓</Text>
                      <Text style={s.previewText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Submit button */}
            <View style={s.stickyBottom}>
              <TouchableOpacity
                style={[
                  s.submitBtn,
                  { backgroundColor: isValid ? config.accent : 'rgba(255,255,255,0.06)' },
                ]}
                onPress={handleSubmit}
                disabled={!isValid || saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={[s.submitBtnText, !isValid && s.submitBtnTextOff]}>
                      Enter Dashboard →
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildLocalEntity(role: RoleParam, companyName: string, boatName: string): Entity {
  if (role === 'boat_owner') {
    return {
      id: 'personal_boats',
      type: 'BOAT_BUNDLE',
      label: boatName || 'My Boats',
      sublabel: 'Personal fleet · Owner',
      accent: ENTITY_ACCENTS.BOAT_BUNDLE,
      role: 'owner',
      permissions: [],
    }
  }
  if (role === 'company_owner') {
    return {
      id: 'temp_company',
      type: 'COMPANY',
      label: companyName || 'My Company',
      sublabel: 'Your company · Owner',
      accent: ENTITY_ACCENTS.COMPANY,
      role: 'owner',
      permissions: [],
      companyName,
    }
  }
  // both_owner — default to company entity
  return {
    id: 'temp_company',
    type: 'COMPANY',
    label: companyName || 'My Company',
    sublabel: 'Your company · Owner',
    accent: ENTITY_ACCENTS.COMPANY,
    role: 'owner',
    permissions: [],
    companyName,
  }
}

function getFeatures(role: RoleParam): string[] {
  switch (role) {
    case 'boat_owner':
      return [
        'Fleet dashboard for all your boats',
        'Trip tracking — departure to return',
        'Expense logging — diesel, ice, maintenance',
        'Crew kharchi & season advance',
        'Ledger with full P&L per trip',
      ]
    case 'company_owner':
      return [
        'Company dashboard with tali sessions',
        'Bill generation and WhatsApp delivery',
        'Registered boat management',
        'Staff & manager permissions',
        'Season ledger and CA export',
      ]
    case 'both_owner':
      return [
        'Company dashboard (default view)',
        'Switch to boat view via top button',
        'Separate ledger for each',
        'Combined total overview',
        'All features of both roles',
      ]
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0a1628' },
  bgCircle: {
    position: 'absolute', top: -80, right: -60,
    width: 260, height: 260, borderRadius: 130,
  },
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 20 },

  backBtn: {
    alignSelf: 'flex-start', paddingVertical: 4,
    paddingHorizontal: 2, marginBottom: 4,
  },
  backText: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600' },

  hero: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 38 },
  heroTitle: {
    fontSize: 26, fontWeight: '800',
    color: theme.colors.textPrimary, letterSpacing: -0.4,
  },
  heroSub: { fontSize: 14, color: theme.colors.textSecondary },

  fieldsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  fieldBlock: { padding: 18, gap: 8 },
  fieldBlockBorder: { borderTopWidth: 1, borderTopColor: theme.colors.border },
  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  fieldInput: {
    height: 52, backgroundColor: theme.colors.elevated,
    borderRadius: 12, paddingHorizontal: 16,
    fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  fieldHint: { fontSize: 12, color: theme.colors.textMuted },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: { color: '#f87171', fontSize: 13 },

  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16, gap: 10,
  },
  previewTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  previewList: { gap: 8 },
  previewRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  previewDot: { fontSize: 13, fontWeight: '800', marginTop: 1 },
  previewText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },

  stickyBottom: {
    paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28,
    backgroundColor: 'rgba(10,22,40,0.97)',
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  submitBtn: {
    height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  submitBtnTextOff: { color: 'rgba(255,255,255,0.3)' },
})