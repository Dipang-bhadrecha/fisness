import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
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

  const isValid = phone.trim().length === 10

  const handleNext = () => {
    if (!isValid) return
    // TODO: call backend OTP send API
    router.push({ pathname: '/(auth)/otp', params: { phone } })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <Text style={styles.logoEmoji}>🐟</Text>
            <Text style={styles.logoName}>MatsyaKosh</Text>
            <Text style={styles.logoSub}>માછલી વ્યવસ્થાપન</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>નંબર દાખલ કરો</Text>
            <Text style={styles.cardSub}>
              તમારો મોબાઈલ નંબર દાખલ કરો, OTP આવશે
            </Text>

            {/* Input */}
            <View style={styles.inputRow}>
              <View style={styles.countryBadge}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="10-digit number"
                placeholderTextColor={theme.colors.textDisabled}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                autoFocus
              />
            </View>

            <Text style={styles.hint}>
              તમારી અંગત માહિતી સુરક્ષિત છે
            </Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.nextBtn, !isValid && styles.nextBtnDisabled]}
            onPress={handleNext}
            activeOpacity={0.8}
            disabled={!isValid}
          >
            <Text style={styles.nextBtnText}>આગળ →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },

  // Logo
  logoArea: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  logoEmoji: {
    fontSize: 56,
  },
  logoName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },

  // Card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
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
    lineHeight: 22,
  },

  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    minHeight: theme.touchTarget,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    height: '100%',
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    letterSpacing: 2,
  },

  hint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDisabled,
    textAlign: 'center',
  },

  // Button
  nextBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    minHeight: theme.touchTarget + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
})