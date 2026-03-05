import { router } from 'expo-router'
import React from 'react'
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

// ── Mock data — replace with real store/API ──
const OWNER = {
  name: 'Algaari',
  season: '2025–26',
  location: 'Veraval',
  totalProfit: 420000,
  totalCatch: 420000,
  totalBoats: 3,
  seasonAdvance: 720000,
  maintenance: 150000,
  diesel: 100000,
}

const QUICK_ACTIONS = [
  { id: 'tali',    emoji: '⚖️', label: 'Add Tali',    sub: 'Weight logging',  route: '/tali' },
  { id: 'expense', emoji: '💸', label: 'Add Expense',  sub: 'Add a expense',   route: null },
  { id: 'kharchi', emoji: '💰', label: 'Add Kharchi',  sub: 'Crew expenses',   route: null },
  { id: 'more',    emoji: '📦', label: 'More',         sub: 'Other actions',   route: null },
]

const MANAGE_ROWS = [
  { emoji: '✈️', label: 'Trips',  sub: 'See All Trips' },
  { emoji: '🚤', label: 'Boats',  sub: 'See All Boats' },
  { emoji: '👥', label: 'Crew',   sub: 'See All Crew' },
  { emoji: '📒', label: 'Ledger', sub: 'See All Records' },
]

function fmt(n: number) {
  return n.toLocaleString('en-IN')
}

export default function OwnerHomeScreen() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* Top bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.greeting}>Hello, {OWNER.name}</Text>
              <Text style={styles.season}>
                Season {OWNER.season} · {OWNER.location}
              </Text>
            </View>
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Stats card */}
          <View style={styles.statsCard}>
            <View style={styles.statsLeft}>
              <Text style={styles.statsSmLabel}>Total profit this year</Text>
              <Text style={styles.statsBigNum}>₹{fmt(OWNER.totalProfit)}</Text>
              <Text style={styles.statsChange}>+13% from last season</Text>

              <View style={styles.statsDivider} />

              <Text style={styles.statsSmLabel}>Total catch this year</Text>
              <Text style={styles.statsBigNum}>{fmt(OWNER.totalCatch)} kg</Text>
              <Text style={styles.statsChange}>+8% from last year</Text>
            </View>

            <View style={styles.statsRight}>
              <Text style={styles.statsRightLabel}>Total Boats</Text>
              <Text style={styles.statsRightVal}>{OWNER.totalBoats}</Text>

              <View style={styles.statsRightDivider} />

              <Text style={styles.statsRightLabel}>Season Advance</Text>
              <Text style={styles.statsRightVal}>{fmt(OWNER.seasonAdvance)}</Text>

              <Text style={styles.statsRightLabel}>Maintenance</Text>
              <Text style={styles.statsRightVal}>{fmt(OWNER.maintenance)}</Text>

              <Text style={styles.statsRightLabel}>Diesel</Text>
              <Text style={[styles.statsRightVal, { color: '#ffcc44' }]}>
                {fmt(OWNER.diesel)} ltr
              </Text>
            </View>
          </View>

          {/* Quick actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map(a => (
              <TouchableOpacity
                key={a.id}
                style={styles.actionCard}
                activeOpacity={0.75}
                onPress={() => { if (a.route) router.push(a.route as any) }}
              >
                <View style={styles.actionIconBox}>
                  <Text style={styles.actionEmoji}>{a.emoji}</Text>
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Text style={styles.actionSub}>{a.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manage rows */}
          <Text style={styles.sectionTitle}>Manage</Text>
          {MANAGE_ROWS.map(r => (
            <TouchableOpacity key={r.label} style={styles.manageRow} activeOpacity={0.75}>
              <View style={styles.manageRowIcon}>
                <Text style={styles.manageRowEmoji}>{r.emoji}</Text>
              </View>
              <View style={styles.manageRowText}>
                <Text style={styles.manageRowLabel}>{r.label}</Text>
                <Text style={styles.manageRowSub}>{r.sub}</Text>
              </View>
              <Text style={styles.manageRowArrow}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          {[
            { emoji: '🏠', label: 'Home',   active: true },
            { emoji: '⚖️', label: 'Tali',   active: false },
            { emoji: '🚤', label: 'Trips',  active: false },
            { emoji: '📒', label: 'Ledger', active: false },
            { emoji: '···', label: 'More',  active: false },
          ].map(n => (
            <TouchableOpacity key={n.label} style={styles.navItem} activeOpacity={0.7}>
              <Text style={styles.navEmoji}>{n.emoji}</Text>
              <Text style={[styles.navLabel, n.active && styles.navLabelActive]}>
                {n.label}
              </Text>
              {n.active && <View style={styles.navDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 16, gap: 14 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  season: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },
  searchBtn: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.elevated,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: { fontSize: 20 },

  // Stats card
  statsCard: {
    backgroundColor: '#1a4fd6',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    minHeight: 160,
  },
  statsLeft: { flex: 1, gap: 3 },
  statsSmLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  statsBigNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statsChange: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  statsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 6,
  },
  statsRight: {
    gap: 3,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statsRightLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  statsRightVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statsRightDivider: {
    width: 80,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 4,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: '47.5%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 6,
    minHeight: 100,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.elevated,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionEmoji: { fontSize: 22 },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  actionSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },

  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    minHeight: 64,
  },
  manageRowIcon: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.elevated,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageRowEmoji: { fontSize: 20 },
  manageRowText: { flex: 1 },
  manageRowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  manageRowSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  manageRowArrow: {
    fontSize: 22,
    color: theme.colors.textDisabled,
    fontWeight: '700',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  navEmoji: { fontSize: 22 },
  navLabel: {
    fontSize: 11,
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