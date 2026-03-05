import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
    KeyboardAvoidingView,
    Platform,
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

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  useEffect(() => {
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) return
    setLoading(true)
    // TODO: call backend verify OTP API
    // Simulate for now
    setTimeout(() => {
      setLoading(false)
      router.replace('/(auth)/role')
    }, 800)
  }

  const handleResend = () => {
    if (resendTimer > 0) return
    setResendTimer(30)
    setOtp('')
    // TODO: resend OTP API call
  }

  // Split OTP into individual digit display boxes
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => otp[i] ?? '')

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Back */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          {/* Logo small */}
          <View style={styles.logoArea}>
            <Text style={styles.logoEmoji}>🐟</Text>
            <Text style={styles.logoName}>MatsyaKosh</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>OTP ચકાસો</Text>
            <Text style={styles.cardSub}>
              +91 {phone} પર OTP મોકલ્યો છે
            </Text>

            {/* OTP boxes (visual) — tap opens hidden input */}
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
                    <Text style={styles.otpDigit}>{d || ''}</Text>
                    {i === otp.length && d === '' && (
                      <View style={styles.cursor} />
                    )}
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
              <Text style={styles.resendLabel}>OTP નથી મળ્યો? </Text>
              {resendTimer > 0 ? (
                <Text style={styles.resendTimer}>{resendTimer}s માં ફરી મોકલો</Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendBtn}>ફરી મોકલો</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              (otp.length !== OTP_LENGTH || loading) && styles.verifyBtnDisabled,
            ]}
            onPress={handleVerify}
            activeOpacity={0.8}
            disabled={otp.length !== OTP_LENGTH || loading}
          >
            <Text style={styles.verifyBtnText}>
              {loading ? 'ચકાસી રહ્યું છે...' : 'ચકાસો ✓'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
    justifyContent: 'center',
  },

  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },

  logoArea: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  logoEmoji: {
    fontSize: 40,
  },
  logoName: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardSub: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: -theme.spacing.sm,
  },

  // OTP boxes
  otpRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  otpBox: {
    flex: 1,
    aspectRatio: 0.9,
    maxWidth: 52,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  otpBoxActive: {
    borderColor: theme.colors.primaryLight,
  },
  otpDigit: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: theme.colors.primary,
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
  resendLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  resendTimer: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textDisabled,
  },
  resendBtn: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primaryLight,
    fontWeight: '700',
  },

  // Button
  verifyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    minHeight: theme.touchTarget + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnDisabled: {
    opacity: 0.4,
  },
  verifyBtnText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
})