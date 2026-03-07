/**
 * app/(auth)/phone.tsx — Phone Number Entry
 *
 * Calls POST /auth/send-otp on the Fastify backend.
 * On success → navigates to OTP screen with phone param.
 * On failure → shows inline error with actionable message.
 */

import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
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
import { ApiError, sendOtp } from '../services/api'

const { height: SCREEN_H } = Dimensions.get('window')

export default function PhoneScreen() {
  const { t } = useLanguage()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const isValid = phone.trim().length === 10

  const handleSendOtp = async () => {
    if (!isValid || loading) return
    setError(null)
    setLoading(true)

    try {
      await sendOtp(phone.trim())
      // OTP sent — navigate to verify screen
      router.push({ pathname: '/(auth)/otp', params: { phone: phone.trim() } })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'NETWORK_ERROR') {
          setError(
            'Cannot reach server. Make sure:\n• Your backend is running\n• Both devices are on the same WiFi\n• The IP in .env.local is correct'
          )
        } else {
          setError(err.message)
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={s.bg}>
        <View style={s.bgCircle1} />
        <View style={s.bgCircle2} />

        <SafeAreaView style={s.safe}>
          {/* Logo — fixed height, always visible */}
          <View style={s.logoWrap}>
            <View style={s.glowRing}><View style={s.glowInner} /></View>
            <Text style={s.fish}>🐟</Text>
            <Text style={s.appName}>MatsyaKosh</Text>
            <Text style={s.tagline}>{t.phone.appTagline}</Text>
          </View>

          {/* Card — KAV only wraps the card, not the logo */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={s.card}>
              <View style={s.cardBar} />
              <View style={s.cardBody}>

                <Text style={s.title}>{t.phone.cardTitle}</Text>
                <Text style={s.sub}>{t.phone.cardSubtitle}</Text>

                {/* Input */}
                <View style={[s.inputRow, isFocused && s.inputRowOn]}>
                  <View style={s.prefix}>
                    <Text style={s.flag}>🇮🇳</Text>
                    <Text style={s.code}>+91</Text>
                  </View>
                  <View style={s.sep} />
                  <TextInput
                    ref={inputRef}
                    style={s.input}
                    placeholder="XXXXXXXXXX"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(v) => {
                      setPhone(v)
                      if (error) setError(null)
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor={theme.colors.primaryLight}
                    editable={!loading}
                  />
                  {isValid && !loading && (
                    <View style={s.check}>
                      <Text style={s.checkText}>✓</Text>
                    </View>
                  )}
                </View>

                {/* Error message */}
                {error && (
                  <View style={s.errorBox}>
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}

                {/* Security note */}
                <View style={s.secRow}>
                  <Text style={s.secIcon}>🔒</Text>
                  <Text style={s.secText}>{t.phone.securityNote}</Text>
                </View>

                {/* Button */}
                <TouchableOpacity
                  onPress={handleSendOtp}
                  activeOpacity={0.85}
                  disabled={!isValid || loading}
                >
                  <View style={[s.btn, (!isValid || loading) && s.btnOff]}>
                    <Text style={[s.btnTxt, (!isValid || loading) && s.btnTxtOff]}>
                      {loading ? 'Sending OTP...' : `${t.phone.nextBtn}  →`}
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
  bgCircle1: {
    position: 'absolute', top: -60, right: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(13,122,95,0.1)',
  },
  bgCircle2: {
    position: 'absolute', top: SCREEN_H * 0.3, left: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(13,122,95,0.07)',
  },
  safe: { flex: 1, justifyContent: 'flex-end' },

  logoWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    bottom: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 170, height: 170, borderRadius: 85,
    backgroundColor: 'rgba(13,122,95,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  glowInner: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(13,122,95,0.1)',
  },
  fish: { fontSize: 64, marginBottom: 10 },
  appName: {
    fontSize: 32, fontWeight: '800', color: '#fff',
    letterSpacing: -0.5, marginBottom: 6,
  },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.4 },

  card: {
    backgroundColor: 'rgba(20,40,70,0.95)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardBar: {
    height: 3, width: 44,
    backgroundColor: theme.colors.primaryLight,
    alignSelf: 'center',
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },
  cardBody: { padding: 24, paddingBottom: 36, gap: 14 },

  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 2 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: -4 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    height: 56,
  },
  inputRowOn: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: 'rgba(15,155,120,0.1)',
  },
  prefix: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingLeft: 14, paddingRight: 10,
  },
  flag: { fontSize: 20 },
  code: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  sep: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
  input: {
    flex: 1,
    height: 56,
    paddingLeft: 12,
    paddingRight: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1.5,
  },
  check: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  checkText: { fontSize: 13, color: '#fff', fontWeight: '800' },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#fca5a5',
    lineHeight: 18,
    fontWeight: '500',
  },

  secRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secIcon: { fontSize: 12 },
  secText: { fontSize: 12, color: 'rgba(255,255,255,0.35)', flex: 1 },

  btn: {
    height: 56,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    shadowColor: '#0f9b78', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12,
  },
  btnOff: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    elevation: 0, shadowOpacity: 0,
  },
  btnTxt: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  btnTxtOff: { color: 'rgba(255,255,255,0.2)' },
})