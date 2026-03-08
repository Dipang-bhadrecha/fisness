/**
 * app/(setup)/done.tsx — Setup Complete
 *
 * Final step of the wizard. Calls POST /auth/setup to persist
 * the user's workspace configuration to the database.
 *
 * On success → marks setup complete in authStore → routes to dashboard.
 */

import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../constants/theme'
import { useAuthStore } from '../../store/authStore'
import { ApiError, WorkspaceSetupPayload, completeSetup } from '@/services/api'

function Particle({ x, color, delay }: { x: number; color: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 1400, delay, useNativeDriver: true }).start()
  }, [])
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 700] })
  const opacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] })
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${Math.random() > 0.5 ? 360 : -360}deg`] })
  return (
    <Animated.View style={[styles.particle, { left: x, backgroundColor: color, transform: [{ translateY }, { rotate }], opacity }]} />
  )
}

const PARTICLE_COLORS = [theme.colors.primary, theme.colors.primaryLight, '#C9A84C', '#22c55e', '#f59e0b', '#fff']
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  x: (i / 24) * 100 + Math.random() * 3,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  delay: Math.random() * 400,
}))

export default function SetupDoneScreen() {
  const params = useLocalSearchParams<{
    primaryRole?: string
    ownerType?: string
    companyName?: string
    firstBoatName?: string
    boatRegistration?: string
    ownerPhone?: string
  }>()

  const { token, setSetupComplete } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const heroScale = useRef(new Animated.Value(0.6)).current
  const heroOpacity = useRef(new Animated.Value(0)).current
  const ctaTranslate = useRef(new Animated.Value(40)).current
  const ctaOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heroScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start()
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(ctaTranslate, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]).start()
    }, 600)
  }, [])

  const handleEnterDashboard = async () => {
    if (!token || saving) return
    setError(null)
    setSaving(true)

    const payload: WorkspaceSetupPayload = {
      primaryRole: (params.primaryRole as WorkspaceSetupPayload['primaryRole']) ?? 'owner',
      ownerType: (params.ownerType as WorkspaceSetupPayload['ownerType']) ?? 'company',
      companyName: params.companyName,
      firstBoatName: params.firstBoatName,
      boatRegistration: params.boatRegistration,
      ownerPhone: params.ownerPhone,
    }

    try {
      const { workspaces } = await completeSetup(token, payload)
      await setSetupComplete(workspaces)
      router.replace('/(owner)/home' as any)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save setup. Please try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={styles.bg}>
        <View style={styles.confettiLayer} pointerEvents="none">
          {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>

            <Animated.View style={[styles.heroSection, { transform: [{ scale: heroScale }], opacity: heroOpacity }]}>
              <View style={styles.glowRing}><View style={styles.glowInner} /></View>
              <Text style={styles.heroEmoji}>🎉</Text>
              <Text style={styles.heroTitle}>You're all set!</Text>
              <Text style={styles.heroSub}>Your workspace is ready. Welcome to Fishness.</Text>
            </Animated.View>

            <Animated.View style={[styles.summaryCard, { opacity: ctaOpacity, transform: [{ translateY: ctaTranslate }] }]}>
              <Text style={styles.summaryLabel}>YOUR WORKSPACE</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryEmoji}>{params.primaryRole === 'manager' ? '🧭' : '🏢'}</Text>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryName}>{params.companyName ?? 'Company Dashboard'}</Text>
                  <Text style={styles.summarySub}>
                    {params.primaryRole === 'manager' ? 'Manager · Operational access' : 'Owner · Full access'}
                  </Text>
                </View>
                <View style={styles.summaryCheck}>
                  <Text style={styles.summaryCheckText}>✓</Text>
                </View>
              </View>
            </Animated.View>

            <View style={{ flex: 1 }} />

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Animated.View style={[styles.ctaArea, { opacity: ctaOpacity, transform: [{ translateY: ctaTranslate }] }]}>
              <TouchableOpacity style={[styles.ctaBtn, saving && styles.ctaBtnLoading]} onPress={handleEnterDashboard} activeOpacity={0.85} disabled={saving}>
                <View style={[styles.ctaInner, saving && styles.ctaInnerLoading]}>
                  {saving
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.ctaText}>Enter Dashboard →</Text>
                  }
                </View>
              </TouchableOpacity>
              <Text style={styles.ctaHint}>You can add boats, managers, and more from Settings at any time.</Text>
            </Animated.View>

          </View>
        </SafeAreaView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0a1628' },
  confettiLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  particle: { position: 'absolute', top: -20, width: 8, height: 8, borderRadius: 2 },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressFill: { height: 3, backgroundColor: theme.colors.primaryLight, borderRadius: 2 },
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32, alignItems: 'center', gap: 28 },

  heroSection: { alignItems: 'center', gap: 14, position: 'relative' },
  glowRing: { position: 'absolute', top: -20, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(0,194,203,0.07)', alignItems: 'center', justifyContent: 'center' },
  glowInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,194,203,0.09)' },
  heroEmoji: { fontSize: 72 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -0.5, textAlign: 'center' },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 22 },

  summaryCard: { width: '100%', backgroundColor: 'rgba(0,194,203,0.08)', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(0,194,203,0.2)', padding: 16, gap: 12 },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.primaryLight, letterSpacing: 2 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryEmoji: { fontSize: 28 },
  summaryInfo: { flex: 1 },
  summaryName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  summarySub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  summaryCheck: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  summaryCheckText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  errorBox: { width: '100%', backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', padding: 14 },
  errorText: { fontSize: 13, color: '#fca5a5', lineHeight: 19, textAlign: 'center' },

  ctaArea: { width: '100%', gap: 14 },
  ctaBtn: { borderRadius: 16, shadowColor: '#00C2CB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 20, elevation: 12 },
  ctaBtnLoading: { shadowOpacity: 0.1 },
  ctaInner: { height: 64, backgroundColor: theme.colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.primaryLight },
  ctaInnerLoading: { backgroundColor: 'rgba(0,194,203,0.5)' },
  ctaText: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  ctaHint: { fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 18 },
})