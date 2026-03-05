import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
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

const OTP_LENGTH = 6

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleVerify = () => {
    if (otp.length !== OTP_LENGTH) return
    setLoading(true)
    // TODO: call backend verify OTP API
    setTimeout(() => {
      setLoading(false)
      router.replace('/(auth)/role')
    }, 800)
  }

  const handleResend = () => {
    if (resendTimer > 0) return
    setResendTimer(30)
    setOtp('')
    // TODO: resend OTP API
  }

  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => otp[i] ?? '')

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={styles.bg}>
        <View style={styles.bgCircle1} />

        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView
            style={styles.kav}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >

            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            {/* Logo small */}
            <View style={styles.logoSection}>
              <View style={styles.glowRing}>
                <View style={styles.glowInner} />
              </View>
              <Text style={styles.fishEmoji}>🐟</Text>
              <Text style={styles.appName}>MatsyaKosh</Text>
            </View>

            {/* Form card */}
            <View style={styles.card}>
              <View style={styles.cardAccent} />
              <View style={styles.cardContent}>

                <Text style={styles.cardTitle}>OTP ચકાસો</Text>
                <Text style={styles.cardSubtitle}>
                  +91 {phone} પર {OTP_LENGTH} આંકડાનો OTP મોકલ્યો
                </Text>

                {/* OTP boxes */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => inputRef.current?.focus()}
                >
                  <View style={styles.otpRow}>
                    {digits.map((d, i) => (
                      <View
                        key={i}
                        style={[
                          styles.otpBox,
                          d !== '' && styles.otpBoxFilled,
                          i === otp.length && styles.otpBoxActive,
                        ]}
                      >
                        {d !== '' ? (
                          <Text style={styles.otpDigit}>{d}</Text>
                        ) : i === otp.length ? (
                          <View style={styles.cursor} />
                        ) : null}
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>

                {/* Hidden real input */}
                <TextInput
                  ref={inputRef}
                  style={styles.hiddenInput}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  value={otp}
                  onChangeText={setOtp}
                  caretHidden
                />

                {/* Resend */}
                <View style={styles.resendRow}>
                  <Text style={styles.resendLabel}>OTP નથી મળ્યો?  </Text>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendTimer}>{resendTimer}s માં ફરી મોકલો</Text>
                  ) : (
                    <TouchableOpacity onPress={handleResend}>
                      <Text style={styles.resendBtn}>ફરી મોકલો</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Verify button */}
                <TouchableOpacity
                  style={[
                    styles.ctaBtn,
                    (otp.length !== OTP_LENGTH || loading) && styles.ctaBtnDisabled,
                  ]}
                  onPress={handleVerify}
                  activeOpacity={0.85}
                  disabled={otp.length !== OTP_LENGTH || loading}
                >
                  <View style={[
                    styles.ctaBtnInner,
                    (otp.length !== OTP_LENGTH || loading) && styles.ctaBtnInnerDisabled,
                  ]}>
                    <Text style={[
                      styles.ctaBtnText,
                      (otp.length !== OTP_LENGTH || loading) && styles.ctaBtnTextMuted,
                    ]}>
                      {loading ? 'ચકાસી રહ્યું છે...' : 'ચકાસો ✓'}
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
  bg: { flex: 1, backgroundColor: '#0a1628' },
  bgCircle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(13,122,95,0.1)',
  },
  safe: { flex: 1 },
  kav: { flex: 1 },

  backBtn: {
    margin: 20,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },

  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(13,122,95,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(13,122,95,0.1)',
  },
  fishEmoji: { fontSize: 56, marginBottom: 12 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },

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

  otpRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 4,
  },
  otpBox: {
    flex: 1,
    height: 60,
    maxWidth: 52,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(13,122,95,0.15)',
  },
  otpBoxActive: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: 'rgba(15,155,120,0.1)',
  },
  otpDigit: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  resendTimer: { fontSize: 14, color: 'rgba(255,255,255,0.25)' },
  resendBtn: {
    fontSize: 14,
    color: theme.colors.primaryLight,
    fontWeight: '700',
  },

  ctaBtn: {
    borderRadius: 16,
    marginTop: 4,
    shadowColor: '#0d7a5f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaBtnDisabled: { shadowOpacity: 0, elevation: 0 },
  ctaBtnInner: {
    height: 68,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  ctaBtnTextMuted: { color: 'rgba(255,255,255,0.2)' },
})