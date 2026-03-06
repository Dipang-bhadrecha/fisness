import { router, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    Dimensions,
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
import { useLanguage } from '../../hooks/useLanguage'

const OTP_LEN = 6
const { height: SCREEN_H } = Dimensions.get('window')

export default function OTPScreen() {
  const { t } = useLanguage()
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(30)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 400)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (timer <= 0) return
    const id = setTimeout(() => setTimer(v => v - 1), 1000)
    return () => clearTimeout(id)
  }, [timer])

  const focus = useCallback(() => inputRef.current?.focus(), [])

  const verify = () => {
    if (otp.length !== OTP_LEN) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.replace('/(auth)/language')
    }, 800)
  }

  const digits = Array.from({ length: OTP_LEN }, (_, i) => otp[i] ?? '')

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={s.bg}>
        <View style={s.bgCircle} />

        <SafeAreaView style={s.safe}>
          {/* Back button — absolute, never shifts */}
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>

          {/* Logo — fixed position above card, never inside KAV */}
          <View style={s.logoWrap}>
            <View style={s.glowRing}><View style={s.glowInner} /></View>
            <Text style={s.fish}>🐟</Text>
            <Text style={s.appName}>MatsyaKosh</Text>
          </View>

          {/* Only the card is inside KAV */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
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
                        ]}>
                          {filled
                            ? <Text style={s.digit}>{d}</Text>
                            : active ? <View style={s.cur} /> : null}
                        </View>
                      )
                    })}
                  </View>
                </TouchableOpacity>

                {/* Hidden input — NOT absolutely positioned (Android issue) */}
                <View style={s.inputHider}>
                  <TextInput
                    ref={inputRef}
                    style={s.hiddenInput}
                    keyboardType="number-pad"
                    maxLength={OTP_LEN}
                    value={otp}
                    onChangeText={setOtp}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    caretHidden
                    autoComplete="one-time-code"
                  />
                </View>

                {/* Resend */}
                <View style={s.resendRow}>
                  <Text style={s.resendLabel}>{t.otp.noOtp}</Text>
                  {timer > 0
                    ? <Text style={s.resendTimer}>{t.otp.resendIn(timer)}</Text>
                    : <TouchableOpacity onPress={() => { setTimer(30); setOtp(''); setTimeout(focus, 100) }}>
                        <Text style={s.resendBtn}>{t.otp.resendBtn}</Text>
                      </TouchableOpacity>
                  }
                </View>

                {/* Verify */}
                <TouchableOpacity
                  onPress={verify}
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
  bgCircle: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(13,122,95,0.1)',
  },
  safe: { flex: 1, justifyContent: 'flex-end' },

  back: {
    position: 'absolute', top: 16, left: 20, zIndex: 10,
    width: 44, height: 44,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  backTxt: { fontSize: 20, color: '#fff', fontWeight: '700' },

  logoWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    bottom: 280,
    alignItems: 'center', justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(13,122,95,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  glowInner: {
    width: 95, height: 95, borderRadius: 48,
    backgroundColor: 'rgba(13,122,95,0.1)',
  },
  fish: { fontSize: 52, marginBottom: 10 },
  appName: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },

  card: {
    backgroundColor: 'rgba(20,40,70,0.95)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardBar: {
    height: 3, width: 44, backgroundColor: theme.colors.primaryLight,
    alignSelf: 'center',
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },
  cardBody: { padding: 24, paddingBottom: 36, gap: 14 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 2 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 20, marginTop: -4 },

  boxes: { flexDirection: 'row', gap: 8 },
  box: {
    flex: 1, height: 54,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  boxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(13,122,95,0.18)',
  },
  boxActive: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: 'rgba(15,155,120,0.12)',
  },
  digit: { fontSize: 22, fontWeight: '800', color: '#fff' },
  cur: { width: 2, height: 22, backgroundColor: theme.colors.primaryLight, borderRadius: 1 },

  // Key fix for Android: NOT absolute — use a clipping View instead
  inputHider: {
    height: 1,
    overflow: 'hidden',
  },
  hiddenInput: {
    height: 40,
    color: 'transparent',
    backgroundColor: 'transparent',
  },

  resendRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 4, flexWrap: 'wrap',
  },
  resendLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  resendTimer: { fontSize: 13, color: 'rgba(255,255,255,0.25)' },
  resendBtn: { fontSize: 13, color: theme.colors.primaryLight, fontWeight: '700' },

  btn: {
    height: 56, backgroundColor: theme.colors.primaryLight,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    shadowColor: '#0f9b78', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12,
  },
  btnOff: { backgroundColor: 'rgba(255,255,255,0.06)', elevation: 0, shadowOpacity: 0 },
  btnTxt: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  btnTxtOff: { color: 'rgba(255,255,255,0.2)' },
})