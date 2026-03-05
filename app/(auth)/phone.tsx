import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
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

export default function PhoneScreen() {
  const [phone, setPhone] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const isValid = phone.trim().length === 10

  const handleNext = () => {
    if (!isValid) return
    router.push({ pathname: '/(auth)/otp', params: { phone } })
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={styles.bg}>

        {/* Decorative background circles for depth */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView
            style={styles.kav}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >

            {/* ── TOP: Logo ── */}
            <View style={styles.logoSection}>
              <View style={styles.glowRing}>
                <View style={styles.glowInner} />
              </View>
              <Text style={styles.fishEmoji}>🐟</Text>
              <Text style={styles.appName}>MatsyaKosh</Text>
              <Text style={styles.appTagline}>માછલી વ્યવસ્થાપન પ્લેટફોર્મ</Text>
            </View>

            {/* ── BOTTOM: Form card ── */}
            <View style={styles.card}>
              {/* Top accent pill */}
              <View style={styles.cardAccent} />

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>નંબર દાખલ કરો</Text>
                <Text style={styles.cardSubtitle}>
                  OTP વડે login — કોઈ password નહીં
                </Text>

                {/* Phone input */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => inputRef.current?.focus()}
                  style={[
                    styles.inputWrapper,
                    isFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <View style={styles.prefix}>
                    <Text style={styles.prefixFlag}>🇮🇳</Text>
                    <Text style={styles.prefixCode}>+91</Text>
                    <View style={styles.prefixDivider} />
                  </View>

                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="10 આંકડાનો નંબર"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor={theme.colors.primaryLight}
                  />

                  {isValid && (
                    <View style={styles.validBadge}>
                      <Text style={styles.validCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Security note */}
                <View style={styles.securityRow}>
                  <Text style={styles.securityIcon}>🔒</Text>
                  <Text style={styles.securityText}>
                    તમારી અંગત માહિતી સંપૂર્ણ સુરક્ષિત છે
                  </Text>
                </View>

                {/* CTA */}
                <TouchableOpacity
                  style={[styles.ctaBtn, !isValid && styles.ctaBtnDisabled]}
                  onPress={handleNext}
                  activeOpacity={0.85}
                  disabled={!isValid}
                >
                  <View style={[
                    styles.ctaBtnInner,
                    !isValid && styles.ctaBtnInnerDisabled,
                  ]}>
                    <Text style={[
                      styles.ctaBtnText,
                      !isValid && styles.ctaBtnTextMuted,
                    ]}>
                      આગળ વધો
                    </Text>
                    <Text style={[
                      styles.ctaBtnArrow,
                      !isValid && styles.ctaBtnTextMuted,
                    ]}>
                      →
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  bgCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(13,122,95,0.12)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 220,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(13,122,95,0.07)',
  },
  safe: { flex: 1 },
  kav: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Logo
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(13,122,95,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(13,122,95,0.1)',
  },
  fishEmoji: {
    fontSize: 76,
    marginBottom: 16,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.09)',
    overflow: 'hidden',
  },
  cardAccent: {
    height: 3,
    width: 64,
    backgroundColor: theme.colors.primary,
    alignSelf: 'center',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  cardContent: {
    padding: 28,
    paddingBottom: 36,
    gap: 16,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 20,
    marginTop: -6,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 68,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: 'rgba(15,155,120,0.1)',
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    height: '100%',
  },
  prefixFlag: { fontSize: 24 },
  prefixCode: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
  },
  prefixDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginLeft: 6,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 4,
  },
  validBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  validCheck: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '800',
  },

  // Security
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityIcon: { fontSize: 13 },
  securityText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },

  // Button
  ctaBtn: {
    borderRadius: 16,
    marginTop: 4,
    shadowColor: '#0d7a5f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnInner: {
    height: 68,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  ctaBtnInnerDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ctaBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  ctaBtnArrow: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
  },
  ctaBtnTextMuted: {
    color: 'rgba(255,255,255,0.2)',
  },
})