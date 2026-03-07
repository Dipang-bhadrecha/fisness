/**
 * Setup Wizard — Step 3 (Company Path): Company + First Boat Setup
 * Route: app/(setup)/company-setup.tsx
 *
 * Shown when user has a registered company.
 * Collects company name + first boat. Shows a live preview card.
 */

import { router } from 'expo-router'
import React, { useState } from 'react'
import {
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

export default function SetupCompanyScreen() {
  const [companyName, setCompanyName] = useState('')
  const [boatName, setBoatName] = useState('')
  const [reg, setReg] = useState('')

  const isValid = companyName.trim().length >= 2 && boatName.trim().length >= 1

  const previewCompany = companyName.trim() || 'Your Company'
  const previewBoat = boatName.trim() || 'Boat 1'

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={s.bg}>
        <View style={s.bgCircle1} />

        <SafeAreaView style={s.safe}>
          {/* Progress */}
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: '60%' }]} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={s.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Back */}
              <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                <Text style={s.backText}>← Back</Text>
              </TouchableOpacity>

              {/* Header */}
              <View style={s.header}>
                <View style={s.stepBadge}>
                  <Text style={s.stepText}>STEP 3 OF 5</Text>
                </View>
                <Text style={s.title}>Set up your{'\n'}company</Text>
                <Text style={s.subtitle}>
                  This becomes the header on all your bills and reports.
                </Text>
              </View>

              {/* Live preview card */}
              <View style={s.previewCard}>
                <View style={s.previewHeader}>
                  <Text style={s.previewWatermark}>🐟</Text>
                  <Text style={s.previewCompanyName}>{previewCompany}</Text>
                  <Text style={s.previewLabel}>માછીમારી રસીદ · Fishing Receipt</Text>
                </View>
                <View style={s.previewBody}>
                  <View style={s.previewRow}>
                    <Text style={s.previewKey}>બોટ / Boat</Text>
                    <Text style={s.previewVal}>{previewBoat}</Text>
                  </View>
                  <View style={s.previewRow}>
                    <Text style={s.previewKey}>તારીખ / Date</Text>
                    <Text style={s.previewVal}>
                      {new Date().toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={s.previewFooter}>
                  <Text style={s.previewFooterText}>← Live preview of your bills</Text>
                </View>
              </View>

              {/* Form */}
              <View style={s.form}>
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>Company Name *</Text>
                  <TextInput
                    style={s.input}
                    placeholder="e.g. Ramesh Fisheries"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={companyName}
                    onChangeText={setCompanyName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>First Boat Name *</Text>
                  <TextInput
                    style={s.input}
                    placeholder="e.g. Jai Mataji - 1"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={boatName}
                    onChangeText={setBoatName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>
                    Registration Number{' '}
                    <Text style={s.optional}>(optional)</Text>
                  </Text>
                  <TextInput
                    style={s.input}
                    placeholder="e.g. GJ-VER-1234"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={reg}
                    onChangeText={setReg}
                    autoCapitalize="characters"
                    returnKeyType="done"
                  />
                </View>
              </View>

              <Text style={s.hint}>
                ℹ️ You can add more boats after setup from Settings → Boats.
              </Text>

              {/* CTA */}
              <TouchableOpacity
                style={[s.ctaBtn, !isValid && s.ctaBtnDisabled]}
                onPress={() => router.push('/(setup)/done')}
                disabled={!isValid}
                activeOpacity={0.85}
              >
                <View style={[s.ctaInner, !isValid && s.ctaInnerDisabled]}>
                  <Text style={s.ctaText}>
                    {isValid ? 'Create Company →' : 'Fill in company & boat name'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={{ height: 32 }} />
            </ScrollView>
          </KeyboardAvoidingView>
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
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0,194,203,0.07)',
  },
  safe: { flex: 1 },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressFill: { height: 3, backgroundColor: theme.colors.primaryLight, borderRadius: 2 },
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
  stepText: { fontSize: 11, fontWeight: '700', color: theme.colors.primaryLight, letterSpacing: 2 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 38 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 21 },

  // Live preview
  previewCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewHeader: {
    backgroundColor: '#1c3a2a',
    padding: 16,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  previewWatermark: {
    position: 'absolute',
    right: -10,
    top: -10,
    fontSize: 80,
    opacity: 0.07,
  },
  previewCompanyName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#e8f5ef',
    letterSpacing: 0.5,
  },
  previewLabel: {
    fontSize: 11,
    color: '#7fcaa3',
    letterSpacing: 0.5,
  },
  previewBody: {
    backgroundColor: '#FDFAF4',
    padding: 14,
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewKey: { fontSize: 11, color: '#6b5a3e', fontWeight: '600' },
  previewVal: { fontSize: 12, color: '#1c3a2a', fontWeight: '700' },
  previewFooter: {
    backgroundColor: '#f0ebe0',
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#d4c9b0',
  },
  previewFooterText: { fontSize: 11, color: '#9a8a6e', fontStyle: 'italic' },

  // Form
  form: { gap: 16 },
  fieldGroup: { gap: 8 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.3,
  },
  optional: { fontWeight: '400', color: 'rgba(255,255,255,0.3)' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    height: 54,
  },

  hint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.28)',
    lineHeight: 18,
  },

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
  ctaInnerDisabled: { backgroundColor: 'rgba(255,255,255,0.05)' },
  ctaText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
})