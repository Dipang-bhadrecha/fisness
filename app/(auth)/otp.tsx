/**
 * app/(auth)/otp.tsx — OTP Verification (UPDATED)
 *
 * Only change from original:
 *   returning user now routes to /(dashboard) instead of /(owner)/home
 *
 * Everything else — UI, logic, error handling — is identical to your original.
 */

import { ApiError, sendOtp, verifyOtp } from '@/services/api'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { useLanguage } from '../../hooks/useLanguage'
import { useAuthStore } from '../../store/authStore'

const OTP_LEN = 6

function normalizePhone(param: string | string[] | undefined): string {
  const raw = Array.isArray(param) ? param[0] : param
  const digits = (raw ?? '').replace(/\D/g, '')
  return digits.length >= 10 ? digits.slice(-10) : digits
}

export default function OTPScreen() {
  const { t } = useLanguage()
  const paramPhone = useLocalSearchParams<{ phone: string }>().phone
  const phone = normalizePhone(paramPhone)
  const { setAuth } = useAuthStore()

  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 400)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (timer <= 0) return
    const id = setTimeout(() => setTimer((v) => v - 1), 1000)
    return () => clearTimeout(id)
  }, [timer])

  const focus = useCallback(() => inputRef.current?.focus(), [])

  const handleResend = async () => {
    if (!phone || phone.length !== 10) return
    setError(null)
    setTimer(30)
    setOtp('')
    setTimeout(focus, 100)
    try {
      await sendOtp(phone)
    } catch (err) {
      setError('Failed to resend OTP. Please try again.')
    }
  }

  const handleVerify = async () => {
    if (otp.length !== OTP_LEN || loading || !phone || phone.length !== 10) return
    setError(null)
    setLoading(true)

    try {
      const { token, user, isNewUser } = await verifyOtp(phone, otp.trim())
      await setAuth(token, user, isNewUser)

      if (isNewUser) {
        router.replace('/(setup)/role-select' as any)
      } else {
        // ✅ CHANGED: was /(owner)/home — now routes to smart entity dashboard
        router.replace('/(dashboard)' as any)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 || err.status === 401) {
          setError('Invalid OTP. Please check the code and try again.')
        } else if (err.code === 'NETWORK_ERROR') {
          setError('Cannot reach server. Check your connection.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Verification failed. Please try again.')
      }
      setLoading(false)
    }
  }

  const digits = Array.from({ length: OTP_LEN }, (_, i) => otp[i] ?? '')

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={s.bg}>
        <View style={s.bgCircle} />

        <SafeAreaView style={s.safe}>
          {/* Back button */}
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.glowRing}><View style={s.glowInner} /></View>
            <Text style={s.fish}>🐟</Text>
            <Text style={s.appName}>Fishness</Text>
          </View>

          {/* Card */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={s.card}>
              <View style={s.cardBar} />
              <View style={s.cardBody}>

                <Text style={s.title}>{t.otp.cardTitle}</Text>
                <Text style={s.sub}>{t.otp.cardSubtitle(phone ?? '')}</Text>

                {/* OTP boxes */}
                <TouchableOpacity activeOpacity={1} onPress={focus}>
                  <View style={s.boxes}>
                    {digits.map((d, i) => {
                      const active = focused && i === otp.length
                      const filled = d !== ''
                      return (
                        <View key={i} style={[
                          s.box,
                          filled && s.boxFilled,
                          active && s.boxActive,
                          error && s.boxError,
                        ]}>
                          {filled
                            ? <Text style={s.digit}>{d}</Text>
                            : active ? <View style={s.cur} /> : null}
                        </View>
                      )
                    })}
                  </View>
                </TouchableOpacity>

                {/* Hidden input */}
                <View style={s.inputHider}>
                  <TextInput
                    ref={inputRef}
                    style={s.hiddenInput}
                    keyboardType="number-pad"
                    maxLength={OTP_LEN}
                    value={otp}
                    onChangeText={(v) => { setOtp(v); if (error) setError(null) }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    caretHidden
                    autoComplete="one-time-code"
                    editable={!loading}
                  />
                </View>

                {/* Error */}
                {error && (
                  <View style={s.errorBox}>
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}

                {/* Resend */}
                <View style={s.resendRow}>
                  <Text style={s.resendLabel}>{t.otp.noOtp}</Text>
                  {timer > 0
                    ? <Text style={s.resendTimer}>{t.otp.resendIn(timer)}</Text>
                    : (
                      <TouchableOpacity onPress={handleResend}>
                        <Text style={s.resendBtn}>{t.otp.resendBtn}</Text>
                      </TouchableOpacity>
                    )
                  }
                </View>

                {/* Verify button */}
                <TouchableOpacity
                  onPress={handleVerify}
                  activeOpacity={0.85}
                  disabled={otp.length !== OTP_LEN || loading}
                >
                  <View style={[s.btn, (otp.length !== OTP_LEN || loading) && s.btnOff]}>
                    <Text style={[s.btnTxt, (otp.length !== OTP_LEN || loading) && s.btnTxtOff]}>
                      {loading ? t.otp.verifying : t.otp.verifyBtn}
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

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0a1628' },
  bgCircle: { position: 'absolute', top: -100, right: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(0,194,203,0.06)' },
  safe: { flex: 1 },
  back: { marginTop: 12, marginLeft: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 20, fontWeight: '700' },
  logoWrap: { alignItems: 'center', marginTop: 24, marginBottom: 24, position: 'relative' },
  glowRing: { position: 'absolute', top: -8, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,194,203,0.12)', alignItems: 'center', justifyContent: 'center' },
  glowInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,194,203,0.2)' },
  fish: { fontSize: 40, zIndex: 1 },
  appName: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 8, letterSpacing: -0.3 },
  card: { marginHorizontal: 20, backgroundColor: '#0d1b2e', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,194,203,0.12)' },
  cardBar: { height: 4, backgroundColor: '#00C2CB' },
  cardBody: { padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#f0f4f8', letterSpacing: -0.4 },
  sub: { fontSize: 14, color: '#8ba3bc', lineHeight: 20 },
  boxes: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  box: { width: 46, height: 56, borderRadius: 12, backgroundColor: '#132640', borderWidth: 1.5, borderColor: 'rgba(0,194,203,0.15)', alignItems: 'center', justifyContent: 'center' },
  boxFilled: { borderColor: 'rgba(0,194,203,0.5)', backgroundColor: '#0d2540' },
  boxActive: { borderColor: '#00C2CB', backgroundColor: '#0d2540' },
  boxError: { borderColor: '#ef4444' },
  digit: { fontSize: 24, fontWeight: '800', color: '#f0f4f8' },
  cur: { width: 2, height: 28, backgroundColor: '#00C2CB', borderRadius: 1 },
  inputHider: { position: 'absolute', opacity: 0, pointerEvents: 'none' },
  hiddenInput: { height: 1, width: 1 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: '#f87171', fontSize: 13, textAlign: 'center' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' },
  resendLabel: { fontSize: 13, color: '#8ba3bc' },
  resendTimer: { fontSize: 13, color: '#8ba3bc' },
  resendBtn: { fontSize: 13, color: '#00C2CB', fontWeight: '700' },
  btn: { height: 54, borderRadius: 14, backgroundColor: '#00C2CB', alignItems: 'center', justifyContent: 'center' },
  btnOff: { backgroundColor: 'rgba(0,194,203,0.3)' },
  btnTxt: { fontSize: 16, fontWeight: '800', color: '#080F1A' },
  btnTxtOff: { color: 'rgba(8,15,26,0.5)' },
})