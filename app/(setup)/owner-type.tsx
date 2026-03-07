/**
 * Setup Wizard — Step 2 (Owner Path): How are your boats organised?
 * Route: app/(setup)/owner-type.tsx
 *
 * Shown after role.tsx when user selected 'owner' or 'both'.
 * Determines if they have a company, personal fleet, or both.
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

type OwnerType = 'company' | 'personal' | 'both'

const OPTIONS: {
  id: OwnerType
  emoji: string
  title: string
  subtitle: string
  tag: string
}[] = [
  {
    id: 'company',
    emoji: '🏢',
    title: 'Registered Company',
    subtitle: 'Multiple boats under one company name — e.g. Ramesh Fisheries',
    tag: 'Company books, multi-boat P&L',
  },
  {
    id: 'personal',
    emoji: '🚤',
    title: 'Personal Boats',
    subtitle: 'I own boats directly — no formal company structure',
    tag: 'Personal books per boat',
  },
  {
    id: 'both',
    emoji: '🎯',
    title: 'Both — Company + Personal',
    subtitle: 'I have a registered company AND some boats personally',
    tag: 'Completely separate books',
  },
]

export default function SetupOwnerTypeScreen() {
  const [selected, setSelected] = useState<OwnerType | null>(null)

  const handleContinue = () => {
    if (!selected) return
    if (selected === 'company' || selected === 'both') {
      router.push('/(setup)/company-setup')
    } else {
      // personal only — skip to done (personal fleet setup)
      router.push('/(setup)/done')
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={s.bg}>
        <View style={s.bgCircle1} />

        <SafeAreaView style={s.safe}>
          {/* Progress */}
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: '40%' }]} />
          </View>

          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={s.header}>
              <View style={s.stepBadge}>
                <Text style={s.stepText}>STEP 2 OF 5</Text>
              </View>
              <Text style={s.title}>How are your{'\n'}boats organised?</Text>
              <Text style={s.subtitle}>
                This determines your financial structure. Books are always kept
                completely separate.
              </Text>
            </View>

            {/* Options */}
            <View style={s.cardList}>
              {OPTIONS.map((opt) => {
                const isSelected = selected === opt.id
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[s.card, isSelected && s.cardSelected]}
                    onPress={() => setSelected(opt.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.emojiBox, isSelected && s.emojiBoxSelected]}>
                      <Text style={s.emoji}>{opt.emoji}</Text>
                    </View>

                    <View style={s.cardBody}>
                      <Text style={[s.cardTitle, isSelected && s.cardTitleSelected]}>
                        {opt.title}
                      </Text>
                      <Text style={s.cardSub}>{opt.subtitle}</Text>
                      <View style={[s.tagBadge, isSelected && s.tagBadgeSelected]}>
                        <Text style={[s.tagText, isSelected && s.tagTextSelected]}>
                          {opt.tag}
                        </Text>
                      </View>
                    </View>

                    <View style={[s.radio, isSelected && s.radioSelected]}>
                      {isSelected && <View style={s.radioDot} />}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Separate books note */}
            <View style={s.noteBox}>
              <Text style={s.noteEmoji}>📒</Text>
              <Text style={s.noteText}>
                <Text style={s.noteBold}>Finances are always separate. </Text>
                Company books never mix with personal boat records.
              </Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[s.ctaBtn, !selected && s.ctaBtnDisabled]}
              onPress={handleContinue}
              disabled={!selected}
              activeOpacity={0.85}
            >
              <View style={[s.ctaInner, !selected && s.ctaInnerDisabled]}>
                <Text style={s.ctaText}>
                  {selected ? 'Continue →' : 'Select an option'}
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
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0,194,203,0.07)',
  },
  safe: { flex: 1 },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressFill: {
    height: 3,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 2,
  },
  scroll: { paddingHorizontal: 24, paddingTop: 20, gap: 22 },

  backBtn: { alignSelf: 'flex-start' },
  backText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },

  header: { gap: 10 },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,194,203,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,194,203,0.25)',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryLight,
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 21,
  },

  cardList: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  cardSelected: {
    backgroundColor: 'rgba(0,194,203,0.1)',
    borderColor: theme.colors.primary,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  emojiBoxSelected: {
    backgroundColor: theme.colors.primary,
  },
  emoji: { fontSize: 24 },
  cardBody: { flex: 1, gap: 6 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  cardTitleSelected: { color: '#fff' },
  cardSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    lineHeight: 17,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagBadgeSelected: {
    backgroundColor: 'rgba(0,194,203,0.15)',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.3,
  },
  tagTextSelected: {
    color: theme.colors.primaryLight,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  radioSelected: { borderColor: theme.colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },

  noteBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
    alignItems: 'flex-start',
  },
  noteEmoji: { fontSize: 16, lineHeight: 20 },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 18,
  },
  noteBold: { fontWeight: '700', color: 'rgba(255,255,255,0.55)' },

  ctaBtn: {
    borderRadius: 16,
    shadowColor: '#00C2CB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaBtnDisabled: { shadowOpacity: 0, elevation: 0 },
  ctaInner: {
    height: 64,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaInnerDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
})