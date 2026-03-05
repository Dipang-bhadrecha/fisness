import { router } from 'expo-router'
import React, { useState } from 'react'
import {
    ScrollView,
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
  titleGujarati: string
  subtitle: string
  description: string
  isPrimary?: boolean
}

const ROLES: Role[] = [
  {
    id: 'boat_owner',
    emoji: '⚓',
    title: 'Boat Owner',
    titleGujarati: 'બોટ માલિક',
    subtitle: 'Trips · Financials · Crew',
    description: 'Manage your boats, view profits, track expenses',
    isPrimary: true,
  },
  {
    id: 'boat_manager',
    emoji: '🧭',
    title: 'Boat Manager',
    titleGujarati: 'બોટ મેનેજર',
    subtitle: 'Tali · Expenses · Reports',
    description: 'Do tali, log expenses, manage assigned boats',
  },
  {
    id: 'supplier',
    emoji: '🏭',
    title: 'Supplier (Dango)',
    titleGujarati: 'સપ્લાયર (દાંગો)',
    subtitle: 'Review & Confirm tali weights',
    description: 'Verify incoming fish weights and confirm bills',
    isPrimary: true,
  },
  {
    id: 'mehtaji',
    emoji: '📋',
    title: 'Mehtaji / Manager',
    titleGujarati: 'મહેતાજી / મેનેજર',
    subtitle: 'Tali · Bills · Kharchi',
    description: 'Full operations — tali, bills, expenses',
  },
]

export default function RoleScreen() {
  const [selected, setSelected] = useState<string | null>(null)

  const handleContinue = () => {
    if (!selected) return
    // TODO: save role to store/backend, then route to correct dashboard
    switch (selected) {
      case 'boat_owner':
        router.replace('/(owner)/home' as any)
        break
      case 'boat_manager':
        router.replace('/(owner)/home' as any) // TODO: create (manager) screens
        break
      case 'supplier':
        router.replace('/(owner)/home' as any) // TODO: create (supplier) screens
        break
      case 'mehtaji':
        router.replace('/(owner)/home' as any) // TODO: create (mehtaji) screens
        break
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>હું છું —</Text>
          <Text style={styles.headerTitle}>તમારી ભૂમિકા પસંદ કરો</Text>
          <Text style={styles.headerSub}>
            MatsyaKosh તમારા role પ્રમાણે experience customize કરે છે
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.roleList}>
          {ROLES.map((role) => {
            const isSelected = selected === role.id
            return (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  isSelected && styles.roleCardSelected,
                  role.isPrimary && styles.roleCardPrimary,
                ]}
                onPress={() => setSelected(role.id)}
                activeOpacity={0.8}
              >
                {/* Left — emoji + text */}
                <View style={styles.roleCardLeft}>
                  <View style={[
                    styles.roleEmojiBadge,
                    isSelected && styles.roleEmojiBadgeSelected,
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
                    <Text style={styles.roleTitleGuj}>{role.titleGujarati}</Text>
                    <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
                  </View>
                </View>

                {/* Right — arrow / check */}
                <View style={[
                  styles.roleArrow,
                  isSelected && styles.roleArrowSelected,
                ]}>
                  <Text style={styles.roleArrowText}>
                    {isSelected ? '✓' : '→'}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueBtn,
            !selected && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!selected}
        >
          <Text style={styles.continueBtnText}>
            {selected
              ? `${ROLES.find(r => r.id === selected)?.title} તરીકે ચાલુ રાખો →`
              : 'ભૂમિકા પસંદ કરો'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },

  // Header
  header: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.lg,
  },
  headerLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    lineHeight: 36,
  },
  headerSub: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginTop: theme.spacing.xs,
  },

  // Role list
  roleList: {
    gap: theme.spacing.sm,
  },

  // Individual role card
  roleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.touchTarget + 16,
  },
  roleCardSelected: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  roleCardPrimary: {
    // slightly elevated for primary roles
    backgroundColor: theme.colors.elevated,
  },

  roleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },

  roleEmojiBadge: {
    width: 52,
    height: 52,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleEmojiBadgeSelected: {
    backgroundColor: theme.colors.primary,
  },
  roleEmoji: {
    fontSize: 26,
  },

  roleText: {
    flex: 1,
    gap: 2,
  },
  roleTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  roleTitleSelected: {
    color: theme.colors.primaryLight,
  },
  roleTitleGuj: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  roleSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textDisabled,
    marginTop: 2,
  },

  // Arrow
  roleArrow: {
    width: 36,
    height: 36,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleArrowSelected: {
    backgroundColor: theme.colors.primary,
  },
  roleArrowText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },

  // Continue button
  continueBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    minHeight: theme.touchTarget + 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  continueBtnDisabled: {
    opacity: 0.35,
  },
  continueBtnText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
})