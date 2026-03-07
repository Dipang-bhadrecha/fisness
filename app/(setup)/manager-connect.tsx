/**
 * Setup Wizard — Manager Path: Connect to Owner
 * Route: app/(setup)/manager-connect.tsx
 *
 * Shown when user selected 'manager' in role.tsx.
 * Owner adds manager by phone number — manager enters phone, sends request.
 */

import { router } from 'expo-router'
import React, { useState } from 'react'
import {
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

type SearchState = 'idle' | 'searching' | 'found' | 'not-found' | 'sent'

// Mock owner lookup — replace with real API
function mockLookup(phone: string): Promise<{ name: string; company: string } | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (phone.length === 10 && phone !== '0000000000') {
        resolve({ name: 'Rameshbhai Patel', company: 'Ramesh Fisheries' })
      } else {
        resolve(null)
      }
    }, 800)
  })
}

export default function SetupManagerConnectScreen() {
  const [phone, setPhone] = useState('')
  const [state, setState] = useState<SearchState>('idle')
  const [owner, setOwner] = useState<{ name: string; company: string } | null>(null)

  const isValidPhone = phone.trim().length === 10

  const handleSearch = async () => {
    if (!isValidPhone) return
    setState('searching')
    const result = await mockLookup(phone)
    if (result) {
      setOwner(result)
      setState('found')
    } else {
      setState('not-found')
    }
  }

  const handleSendRequest = () => {
    setState('sent')
  }

  const handleSkip = () => {
    router.push('/(setup)/done')
  }

  const handleDone = () => {
    router.push('/(setup)/done')
  }

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
            <View style={s.container}>
              {/* Back */}
              <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                <Text style={s.backText}>← Back</Text>
              </TouchableOpacity>

              {/* Header */}
              <View style={s.header}>
                <View style={s.stepBadge}>
                  <Text style={s.stepText}>STEP 3 OF 5</Text>
                </View>
                <Text style={s.title}>Who do you{'\n'}work for?</Text>
                <Text style={s.subtitle}>
                  Enter your owner's phone number. They'll get a notification to approve
                  your access.
                </Text>
              </View>

              {/* Search box */}
              {state !== 'sent' && (
                <View style={s.searchCard}>
                  <View style={[s.inputRow, isValidPhone && s.inputRowActive]}>
                    <View style={s.prefix}>
                      <Text style={s.flag}>🇮🇳</Text>
                      <Text style={s.code}>+91</Text>
                    </View>
                    <View style={s.sep} />
                    <TextInput
                      style={s.input}
                      placeholder="Owner's phone number"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={(v) => {
                        setPhone(v)
                        if (state !== 'idle') setState('idle')
                        setOwner(null)
                      }}
                    />
                    {isValidPhone && state === 'idle' && (
                      <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
                        <Text style={s.searchBtnText}>Search</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Searching */}
              {state === 'searching' && (
                <View style={s.statusCard}>
                  <Text style={s.statusEmoji}>🔍</Text>
                  <Text style={s.statusTitle}>Looking up owner...</Text>
                </View>
              )}

              {/* Found */}
              {state === 'found' && owner && (
                <View style={s.foundCard}>
                  <View style={s.foundHeader}>
                    <View style={s.avatarCircle}>
                      <Text style={s.avatarText}>
                        {owner.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={s.foundInfo}>
                      <Text style={s.foundName}>{owner.name}</Text>
                      <Text style={s.foundCompany}>{owner.company}</Text>
                    </View>
                    <View style={s.foundCheck}>
                      <Text style={s.foundCheckText}>✓</Text>
                    </View>
                  </View>

                  <View style={s.permissionsPreview}>
                    <Text style={s.permissionsTitle}>You'll be able to:</Text>
                    {[
                      '⚖️  Take Tali sessions',
                      '💸  Add expenses & kharchi',
                      '📄  Generate bills',
                    ].map((perm) => (
                      <Text key={perm} style={s.permItem}>{perm}</Text>
                    ))}
                    <Text style={s.permNote}>
                      Owner can adjust your permissions anytime.
                    </Text>
                  </View>

                  <TouchableOpacity style={s.requestBtn} onPress={handleSendRequest} activeOpacity={0.85}>
                    <Text style={s.requestBtnText}>Send Access Request →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Not found */}
              {state === 'not-found' && (
                <View style={s.notFoundCard}>
                  <Text style={s.notFoundEmoji}>🤷</Text>
                  <Text style={s.notFoundTitle}>No owner found</Text>
                  <Text style={s.notFoundSub}>
                    Ask your owner to sign up on Fishness first, then try again.
                  </Text>
                  <TouchableOpacity onPress={() => { setState('idle'); setPhone('') }}>
                    <Text style={s.tryAgain}>Try a different number</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Sent */}
              {state === 'sent' && (
                <View style={s.sentCard}>
                  <Text style={s.sentEmoji}>✅</Text>
                  <Text style={s.sentTitle}>Request sent!</Text>
                  <Text style={s.sentSub}>
                    <Text style={s.sentBold}>{owner?.name}</Text> will get a notification.
                    Once they approve, you'll have full access to {owner?.company}.
                  </Text>
                  <TouchableOpacity style={s.ctaBtn} onPress={handleDone} activeOpacity={0.85}>
                    <View style={s.ctaInner}>
                      <Text style={s.ctaText}>Continue →</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ flex: 1 }} />

              {/* Skip */}
              {state !== 'sent' && (
                <TouchableOpacity onPress={handleSkip} style={s.skipBtn}>
                  <Text style={s.skipText}>Skip for now — connect later</Text>
                </TouchableOpacity>
              )}
            </View>
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
    backgroundColor: 'rgba(26,127,212,0.08)',
  },
  safe: { flex: 1 },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressFill: { height: 3, backgroundColor: '#1a7fd4', borderRadius: 2 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, gap: 22, paddingBottom: 24 },

  backBtn: { alignSelf: 'flex-start' },
  backText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },

  header: { gap: 10 },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(26,127,212,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(26,127,212,0.3)',
  },
  stepText: { fontSize: 11, fontWeight: '700', color: '#5badf5', letterSpacing: 2 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 38 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 21 },

  searchCard: { gap: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 56,
  },
  inputRowActive: { borderColor: '#1a7fd4' },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 14, paddingRight: 10 },
  flag: { fontSize: 18 },
  code: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  sep: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, height: 56, paddingHorizontal: 12, fontSize: 17, fontWeight: '600', color: '#fff', letterSpacing: 1.5 },
  searchBtn: {
    backgroundColor: '#1a7fd4',
    marginRight: 8,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  statusCard: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 28,
  },
  statusEmoji: { fontSize: 36 },
  statusTitle: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },

  foundCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(26,127,212,0.3)',
    overflow: 'hidden',
  },
  foundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: 'rgba(26,127,212,0.1)',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a7fd4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  foundInfo: { flex: 1 },
  foundName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  foundCompany: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  foundCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundCheckText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  permissionsPreview: { padding: 16, gap: 8 },
  permissionsTitle: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' },
  permItem: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  permNote: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4, lineHeight: 16 },

  requestBtn: {
    margin: 16,
    marginTop: 4,
    backgroundColor: '#1a7fd4',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  notFoundCard: {
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 28,
  },
  notFoundEmoji: { fontSize: 36 },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  notFoundSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 19 },
  tryAgain: { fontSize: 14, color: '#1a7fd4', fontWeight: '700', marginTop: 4 },

  sentCard: {
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(34,197,94,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
    padding: 28,
  },
  sentEmoji: { fontSize: 48 },
  sentTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sentSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 20 },
  sentBold: { fontWeight: '700', color: 'rgba(255,255,255,0.8)' },

  ctaBtn: {
    borderRadius: 14,
    width: '100%',
    shadowColor: '#00C2CB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaInner: {
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
})