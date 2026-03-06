import { router } from 'expo-router'
import React from 'react'
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../constants/theme'
import { useLanguage } from '../../hooks/useLanguage'

const OWNER = { name: 'Algaari', season: '2025–26', location: 'Veraval', totalProfit: 420000, totalCatch: 420000, totalBoats: 3, seasonAdvance: 720000, maintenance: 150000, diesel: 100000 }
const fmt = (n: number) => n.toLocaleString('en-IN')

export default function OwnerHomeScreen() {
  const { t } = useLanguage()

  const QUICK_ACTIONS = [
    { id: 'tali',    emoji: '⚖️', label: t.home.addTali,    sub: t.home.addTaliSub,    route: '/tali' },
    { id: 'expense', emoji: '💸', label: t.home.addExpense,  sub: t.home.addExpenseSub, route: null },
    { id: 'kharchi', emoji: '💰', label: t.home.addKharchi,  sub: t.home.addKharchiSub, route: null },
    { id: 'more',    emoji: '📦', label: t.home.more,        sub: t.home.moreSub,       route: null },
  ]
  const MANAGE_ROWS = [
    { emoji: '✈️', label: t.home.trips,  sub: t.home.tripsSub },
    { emoji: '🚤', label: t.home.boats,  sub: t.home.boatsSub },
    { emoji: '👥', label: t.home.crew,   sub: t.home.crewSub },
    { emoji: '📒', label: t.home.ledger, sub: t.home.ledgerSub },
  ]

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.topBar}>
            <View>
              <Text style={s.greeting}>{t.home.greeting(OWNER.name)}</Text>
              <Text style={s.season}>{t.home.seasonLabel(OWNER.season, OWNER.location)}</Text>
            </View>
            <TouchableOpacity style={s.searchBtn}><Text style={s.searchIcon}>🔍</Text></TouchableOpacity>
          </View>

          <View style={s.statsCard}>
            <View style={s.statsLeft}>
              <Text style={s.statsSmLabel}>{t.home.totalProfitLabel}</Text>
              <Text style={s.statsBigNum}>₹{fmt(OWNER.totalProfit)}</Text>
              <Text style={s.statsChange}>+13%</Text>
              <View style={s.statsDivider} />
              <Text style={s.statsSmLabel}>{t.home.totalCatchLabel}</Text>
              <Text style={s.statsBigNum}>{fmt(OWNER.totalCatch)} kg</Text>
              <Text style={s.statsChange}>+8%</Text>
            </View>
            <View style={s.statsRight}>
              <Text style={s.statsRightLabel}>{t.home.totalBoatsLabel}</Text>
              <Text style={s.statsRightVal}>{OWNER.totalBoats}</Text>
              <View style={s.statsRightDivider} />
              <Text style={s.statsRightLabel}>{t.home.seasonAdvanceLabel}</Text>
              <Text style={s.statsRightVal}>{fmt(OWNER.seasonAdvance)}</Text>
              <Text style={s.statsRightLabel}>{t.home.maintenanceLabel}</Text>
              <Text style={s.statsRightVal}>{fmt(OWNER.maintenance)}</Text>
              <Text style={s.statsRightLabel}>{t.home.dieselLabel}</Text>
              <Text style={[s.statsRightVal, { color: '#ffcc44' }]}>{fmt(OWNER.diesel)} ltr</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>{t.home.quickActions}</Text>
          <View style={s.actionsGrid}>
            {QUICK_ACTIONS.map(a => (
              <TouchableOpacity key={a.id} style={s.actionCard} activeOpacity={0.75} onPress={() => { if (a.route) router.push(a.route as any) }}>
                <View style={s.actionIconBox}><Text style={s.actionEmoji}>{a.emoji}</Text></View>
                <Text style={s.actionLabel}>{a.label}</Text>
                <Text style={s.actionSub}>{a.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.sectionTitle}>{t.home.manage}</Text>
          {MANAGE_ROWS.map(r => (
            <TouchableOpacity key={r.label} style={s.manageRow} activeOpacity={0.75}>
              <View style={s.manageRowIcon}><Text style={s.manageRowEmoji}>{r.emoji}</Text></View>
              <View style={s.manageRowText}>
                <Text style={s.manageRowLabel}>{r.label}</Text>
                <Text style={s.manageRowSub}>{r.sub}</Text>
              </View>
              <Text style={s.manageRowArrow}>›</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>

        <View style={s.bottomNav}>
          {[
            { emoji: '🏠', label: t.home.navHome,   active: true },
            { emoji: '⚖️', label: t.home.navTali,   active: false },
            { emoji: '🚤', label: t.home.navTrips,  active: false },
            { emoji: '📒', label: t.home.navLedger, active: false },
            { emoji: '···', label: t.home.navMore,  active: false },
          ].map(n => (
            <TouchableOpacity key={n.label} style={s.navItem} activeOpacity={0.7}>
              <Text style={s.navEmoji}>{n.emoji}</Text>
              <Text style={[s.navLabel, n.active && s.navLabelActive]}>{n.label}</Text>
              {n.active && <View style={s.navDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 16, gap: 14 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8 },
  greeting: { fontSize: 28, fontWeight: '800', color: theme.colors.textPrimary, letterSpacing: -0.3 },
  season: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 3 },
  searchBtn: { width: 44, height: 44, backgroundColor: theme.colors.elevated, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  searchIcon: { fontSize: 20 },
  statsCard: { backgroundColor: '#1a4fd6', borderRadius: 20, padding: 16, flexDirection: 'row', gap: 16, minHeight: 160 },
  statsLeft: { flex: 1, gap: 3 },
  statsSmLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  statsBigNum: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  statsChange: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  statsDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 6 },
  statsRight: { gap: 3, alignItems: 'flex-end', justifyContent: 'center' },
  statsRightLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  statsRightVal: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  statsRightDivider: { width: 80, height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47.5%', backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 14, gap: 6, minHeight: 100 },
  actionIconBox: { width: 44, height: 44, backgroundColor: theme.colors.elevated, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  actionEmoji: { fontSize: 22 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.textPrimary },
  actionSub: { fontSize: 11, color: theme.colors.textSecondary },
  manageRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.colors.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, padding: 14, minHeight: 64 },
  manageRowIcon: { width: 40, height: 40, backgroundColor: theme.colors.elevated, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  manageRowEmoji: { fontSize: 20 },
  manageRowText: { flex: 1 },
  manageRowLabel: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary },
  manageRowSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  manageRowArrow: { fontSize: 22, color: theme.colors.textDisabled, fontWeight: '700' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border, flexDirection: 'row', paddingBottom: 20, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navEmoji: { fontSize: 22 },
  navLabel: { fontSize: 11, color: theme.colors.textDisabled, fontWeight: '500' },
  navLabelActive: { color: theme.colors.primary, fontWeight: '700' },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.primary },
})