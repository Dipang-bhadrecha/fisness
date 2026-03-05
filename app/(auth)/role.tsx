import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../constants/theme'

type Role = {
  id: string
  emoji: string
  title: string
  titleGuj: string
  subtitle: string
}

const ROLES: Role[] = [
  {
    id: 'boat_owner',
    emoji: '⚓',
    title: 'Boat Owner',
    titleGuj: 'બોટ માલિક',
    subtitle: 'Trips · Financials · Crew',
  },
  {
    id: 'boat_manager',
    emoji: '🧭',
    title: 'Boat Manager',
    titleGuj: 'બોટ મેનેજર',
    subtitle: 'Tali · Expenses · Reports',
  },
  {
    id: 'supplier',
    emoji: '🏭',
    title: 'Supplier (Dango)',
    titleGuj: 'સપ્લાયર (દાંગો)',
    subtitle: 'Review & Confirm tali weights',
  },
  {
    id: 'mehtaji',
    emoji: '📋',
    title: 'Mehtaji / Manager',
    titleGuj: 'મહેતાજી / મેનેજર',
    subtitle: 'Tali · Bills · Kharchi',
  },
]

export default function RoleScreen() {
  const [selected, setSelected] = useState<string | null>(null)

  const handleContinue = () => {
    if (!selected) return
    // All routes go to owner home for now
    // TODO: route to role-specific home once those screens are built
    router.replace('/(owner)/home' as any)
  }

  const selectedRole = ROLES.find(r => r.id === selected)

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      <View style={styles.bg}>
        <View style={styles.bgCircle1} />

        <SafeAreaView style={styles.safe}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerLabel}>— હું છું —</Text>
              <Text style={styles.headerTitle}>તમારી ભૂમિકા{'\n'}પસંદ કરો</Text>
              <Text style={styles.headerSub}>
                MatsyaKosh તમારા role પ્રમાણે{'\n'}experience customize કરે છે
              </Text>
            </View>

            {/* Role cards */}
            <View style={styles.roleList}>
              {ROLES.map((role) => {
                const isSelected = selected === role.id
                return (
                  <TouchableOpacity
                    key={role.id}
                    style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                    onPress={() => setSelected(role.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.roleIconBox,
                      isSelected && styles.roleIconBoxSelected,
                    ]}>
                      <Text style={styles.roleEmoji}>{role.emoji}</Text>
                    </View>

                    <View style={styles.roleText}>
                      <Text style={[
                        styles.roleTitle,
                        isSelected && styles.roleTitleSelected,
                      ]}>
                        {role.title}
                      </Text>
                      <Text style={styles.roleTitleGuj}>{role.titleGuj}</Text>
                      <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                    </View>

                    <View style={[
                      styles.roleArrow,
                      isSelected && styles.roleArrowSelected,
                    ]}>
                      <Text style={styles.roleArrowText}>
                        {isSelected ? '✓' : '›'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Continue button */}
            <TouchableOpacity
              style={[styles.ctaBtn, !selected && styles.ctaBtnDisabled]}
              onPress={handleContinue}
              activeOpacity={0.85}
              disabled={!selected}
            >
              <View style={[
                styles.ctaBtnInner,
                !selected && styles.ctaBtnInnerDisabled,
              ]}>
                <Text style={[
                  styles.ctaBtnText,
                  !selected && styles.ctaBtnTextMuted,
                ]}>
                  {selectedRole
                    ? `${selectedRole.title} તરીકે ચાલુ →`
                    : 'ભૂમિકા પસંદ કરો'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
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
  scroll: {
    padding: 24,
    gap: 24,
  },

  header: { gap: 8, paddingTop: 16 },
  headerLabel: {
    fontSize: 12,
    color: theme.colors.primaryLight,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 22,
    marginTop: 4,
  },

  roleList: { gap: 10 },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    minHeight: 80,
  },
  roleCardSelected: {
    backgroundColor: 'rgba(13,122,95,0.12)',
    borderColor: theme.colors.primary,
  },

  roleIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconBoxSelected: {
    backgroundColor: theme.colors.primary,
  },
  roleEmoji: { fontSize: 26 },

  roleText: { flex: 1, gap: 2 },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  roleTitleSelected: { color: theme.colors.primaryLight },
  roleTitleGuj: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  roleSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 2,
  },

  roleArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleArrowSelected: { backgroundColor: theme.colors.primary },
  roleArrowText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },

  ctaBtn: {
    borderRadius: 16,
    shadowColor: '#0d7a5f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 8,
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
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  ctaBtnTextMuted: { color: 'rgba(255,255,255,0.2)' },
})