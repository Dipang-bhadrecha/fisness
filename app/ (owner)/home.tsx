import { router } from 'expo-router'
import React from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../constants/theme'

// ─── Mock data — replace with real store/API later ───
const MOCK_OWNER = {
  name: 'Algaari',
  season: '2025–26',
  location: 'Veraval',
  totalProfit: 420000,
  profitChange: '+13% from last season',
  totalCatch: 420000,
  catchChange: '+8% from last year',
  totalBoats: 3,
  seasonAdvance: 720000,
  maintenance: 150000,
  diesel: 100000,
}

const QUICK_ACTIONS = [
  { id: 'tali', emoji: '⚖️', label: 'Add Tali', sublabel: 'Weight logging', route: '/tali' },
  { id: 'expense', emoji: '💸', label: 'Add Expense', sublabel: 'Add a expense', route: null },
  { id: 'kharchi', emoji: '💰', label: 'Add Kharchi', sublabel: 'Weight logging', route: null },
  { id: 'more', emoji: '📦', label: 'More', sublabel: 'Other actions', route: null },
]

const NAV_ITEMS = [
  { id: 'home', emoji: '🏠', label: 'Home', active: true },
  { id: 'tali', emoji: '⚖️', label: 'Tali', active: false },
  { id: 'trips', emoji: '🚤', label: 'Trips', active: false },
  { id: 'ledger', emoji: '📒', label: 'Ledger', active: false },
  { id: 'more', emoji: '···', label: 'More', active: false },
]

function formatCurrency(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(0)},${String(n % 100000).padStart(5, '0')}`
  return n.toLocaleString('en-IN')
}

export default function OwnerHomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Hello, {MOCK_OWNER.name}</Text>
            <Text style={styles.season}>
              Season {MOCK_OWNER.season} · {MOCK_OWNER.location}
            </Text>
          </View>
          <TouchableOpacity style={styles.searchBtn}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Profit & Stats card — blue card from design */}
        <View style={styles.statsCard}>
          {/* Left column */}
          <View style={styles.statsLeft}>
            <Text style={styles.statsCardLabel}>Total profit this year</Text>
            <Text style={styles.statsCardBig}>
              ₹{formatCurrency(MOCK_OWNER.totalProfit)}
            </Text>
            <Text style={styles.statsCardChange}>{MOCK_OWNER.profitChange}</Text>

            <View style={styles.statsDivider} />

            <Text style={styles.statsCardLabel}>total catch this year</Text>
            <Text style={styles.statsCardBig}>
              {formatCurrency(MOCK_OWNER.totalCatch)} kg
            </Text>
            <Text style={styles.statsCardChange}>{MOCK_OWNER.catchChange}</Text>
          </View>

          {/* Right column */}
          <View style={styles.statsRight}>
            <Text style={styles.statsRightLabel}>Total Boat</Text>
            <Text style={styles.statsRightValue}>{MOCK_OWNER.totalBoats}</Text>

            <View style={styles.statsRightDivider} />

            <Text style={styles.statsRightLabel}>Season Advance</Text>
            <Text style={styles.statsRightValue}>
              {formatCurrency(MOCK_OWNER.seasonAdvance)}
            </Text>

            <Text style={styles.statsRightLabel}>Mantanance</Text>
            <Text style={styles.statsRightValue}>
              {formatCurrency(MOCK_OWNER.maintenance)}
            </Text>

            <Text style={styles.statsRightLabel}>Diesel</Text>
            <Text style={[styles.statsRightValue, { color: '#ffcc44' }]}>
              {formatCurrency(MOCK_OWNER.diesel)} ltr
            </Text>
          </View>
        </View>

        {/* Quick Actions grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              activeOpacity={0.75}
              onPress={() => {
                if (action.route) router.push(action.route as any)
              }}
            >
              <View style={styles.actionIconBadge}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionSublabel}>{action.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* More section rows */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Manage</Text>
        </View>

        {[
          { emoji: '✈️', label: 'Trips', sublabel: 'See All Trips' },
          { emoji: '🚤', label: 'Boats', sublabel: 'See All Boats' },
          { emoji: '👥', label: 'Crew', sublabel: 'See All Crew' },
          { emoji: '📒', label: 'Ledger', sublabel: 'See All Trips' },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.listRow} activeOpacity={0.75}>
            <View style={styles.listRowIcon}>
              <Text style={styles.listRowEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.listRowText}>
              <Text style={styles.listRowLabel}>{item.label}</Text>
              <Text style={styles.listRowSub}>{item.sublabel}</Text>
            </View>
            <Text style={styles.listRowArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <Text style={styles.navEmoji}>{item.emoji}</Text>
            <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
              {item.label}
            </Text>
            {item.active && <View style={styles.navDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: theme.spacing.sm,
  },
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  season: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  searchBtn: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 20,
  },

  // Stats card (the blue card)
  statsCard: {
    backgroundColor: '#1a4fd6',
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 160,
  },
  statsLeft: {
    flex: 1,
    gap: 4,
  },
  statsCardLabel: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },
  statsCardBig: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statsCardChange: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: theme.spacing.xs,
  },
  statsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: theme.spacing.xs,
  },

  statsRight: {
    gap: 4,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statsRightLabel: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255,255,255,0.65)',
  },
  statsRightValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statsRightDivider: {
    height: 1,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: theme.spacing.xs,
  },

  // Section header
  sectionHeader: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Actions grid (2x2)
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
    minHeight: 100,
    justifyContent: 'center',
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  actionSublabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },

  // List rows
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    minHeight: theme.touchTarget,
  },
  listRowIcon: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.elevated,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRowEmoji: { fontSize: 20 },
  listRowText: { flex: 1 },
  listRowLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  listRowSub: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  listRowArrow: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textDisabled,
    fontWeight: '700',
  },

  // Bottom nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  navEmoji: { fontSize: 22 },
  navLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textDisabled,
    fontWeight: '500',
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
})