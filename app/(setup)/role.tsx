/**
 * Setup Wizard — Step 1: Role Selection
 * Route: app/(setup)/role.tsx
 */

import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../constants/theme'
import { coloredShadow, noShadow } from '../../utils/shadow'

type RoleChoice = 'owner' | 'manager' | 'both'

const ROLES: {
  id: RoleChoice
  emoji: string
  title: string
  subtitle: string
  accent: string
  accentMuted: string
}[] = [
  {
    id: 'owner',
    emoji: '⚓',
    title: 'I own boats / a company',
    subtitle: 'View P&L · Manage crew · Track trips · Financial reports',
    accent: theme.colors.primary,
    accentMuted: theme.colors.primaryMuted,
  },
  {
    id: 'manager',
    emoji: '🧭',
    title: 'I manage boats for someone',
    subtitle: 'Tali · Expenses · Bills · Kharchi — on behalf of an owner',
    accent: '#1a7fd4',
    accentMuted: 'rgba(26,127,212,0.12)',
  },
  {
    id: 'both',
    emoji: '🎯',
    title: 'Both — I own & also manage',
    subtitle: 'You have personal boats AND manage for an owner',
    accent: '#d4831a',
    accentMuted: 'rgba(212,131,26,0.12)',
  },
]

export default function SetupRoleScreen() {
  const [selected, setSelected] = useState<RoleChoice | null>(null)

  const handleContinue = () => {
    if (!selected) return
    if (selected === 'manager') {
      router.push('/(setup)/manager-connect')
    } else {
      router.push('/(setup)/owner-type')
    }
  }

  const selectedRole = ROLES.find((r) => r.id === selected)

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={s.bg}>
        <View style={s.bgCircle1} />
        <View style={s.bgCircle2} />

        <SafeAreaView style={s.safe}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: '20%' }]} />
          </View>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

            <View style={s.header}>
              <View style={s.stepBadge}>
                <Text style={s.stepText}>STEP 1 OF 5</Text>
              </View>
              <Text style={s.title}>What best{'\n'}describes you?</Text>
              <Text style={s.subtitle}>
                You can have multiple roles — we'll set them all up.
              </Text>
            </View>

            <View style={s.cardList}>
              {ROLES.map((role) => {
                const isSelected = selected === role.id
                return (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      s.roleCard,
                      isSelected && { borderColor: role.accent, backgroundColor: role.accentMuted },
                    ]}
                    onPress={() => setSelected(role.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.emojiBox, isSelected && { backgroundColor: role.accent }]}>
                      <Text style={s.emoji}>{role.emoji}</Text>
                    </View>
                    <View style={s.roleText}>
                      <Text style={[s.roleTitle, isSelected && { color: '#fff' }]}>{role.title}</Text>
                      <Text style={s.roleSub}>{role.subtitle}</Text>
                    </View>
                    <View style={[s.radio, isSelected && { borderColor: role.accent }]}>
                      {isSelected && <View style={[s.radioDot, { backgroundColor: role.accent }]} />}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={s.infoBox}>
              <Text style={s.infoIcon}>💡</Text>
              <Text style={s.infoText}>
                Your role determines your dashboard. You can always add more contexts later from Settings.
              </Text>
            </View>

            {/* CTA — shadow applied inline, NOT in StyleSheet */}
            <TouchableOpacity
              style={[
                s.ctaBtn,
                selected
                  ? coloredShadow(selectedRole?.accent ?? theme.colors.primary, 8, 0.4, 20)
                  : noShadow,
              ]}
              onPress={handleContinue}
              disabled={!selected}
              activeOpacity={0.85}
            >
              <View style={[
                s.ctaInner,
                !selected && s.ctaInnerDisabled,
                selected && { backgroundColor: selectedRole?.accent },
              ]}>
                <Text style={s.ctaText}>
                  {selected
                    ? `Continue as ${selectedRole?.title.split('—')[0].trim()} →`
                    : 'Select your role'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  )
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0a1628' },
  bgCircle1: {
    position: 'absolute', top: -80, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(0,194,203,0.07)',
  },
  bgCircle2: {
    position: 'absolute', bottom: 80, left: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(0,194,203,0.04)',
  },
  safe: { flex: 1 },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressFill: { height: 3, backgroundColor: theme.colors.primaryLight, borderRadius: 2 },
  scroll: { paddingHorizontal: 24, paddingTop: 28, gap: 24 },
  header: { gap: 10 },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,194,203,0.12)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(0,194,203,0.25)',
  },
  stepText: { fontSize: 11, fontWeight: '700', color: theme.colors.primaryLight, letterSpacing: 2 },
  title: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 40 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 21 },
  cardList: { gap: 12 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16, minHeight: 84,
  },
  emojiBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  emoji: { fontSize: 26 },
  roleText: { flex: 1, gap: 4 },
  roleTitle: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  roleSub: { fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 17 },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  infoBox: {
    flexDirection: 'row', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14, alignItems: 'flex-start',
  },
  infoIcon: { fontSize: 16, lineHeight: 20 },
  infoText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 18 },
  // ⚠️ shadow* props removed — applied inline via coloredShadow() / noShadow
  ctaBtn: { borderRadius: 16 },
  ctaInner: {
    height: 64, backgroundColor: theme.colors.primary,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  ctaInnerDisabled: { backgroundColor: 'rgba(255,255,255,0.05)' },
  ctaText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
})