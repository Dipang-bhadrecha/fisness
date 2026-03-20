/**
 * app/(company)/home.tsx — Company Owner Dashboard
 *
 * For users like Suresh who own a registered fishing company.
 * They manage sessions (tali), fill prices, generate bills,
 * track boats that come to their company, manage staff.
 *
 * This is a shell — screens are functional, data is mock.
 * Replace TEMP_ data with real API calls as you build each section.
 */

import { router } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EntitySwitcher } from '../../components/shared/EntitySwitcher'
import { SelectBoatModal } from '../../components/shared/SelectBoatScreen'
import { ApiRegisteredBoat } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useEntityStore } from '../../store/entityStore'

// ── TEMP DATA — replace with API: GET /api/v1/companies/:id/dashboard ────────
const TEMP_STATS = {
  season: '2025–26',
  location: 'Veraval',
  totalRevenue: 1240000,
  totalCatchKg: 82600,
  totalBills: 28,
  pendingBills: 3,
  registeredBoats: 12,
  activeSessions: 2,
  totalExpenses: 380000,
  netProfit: 860000,
}

const fmt = (n: number) => n.toLocaleString('en-IN')

export default function CompanyDashboardHome() {
  const { user } = useAuthStore()
  const { activeEntity, entities } = useEntityStore()
  const [boatModalVisible, setBoatModalVisible] = useState(false)
  const [boats] = useState<ApiRegisteredBoat[]>([
    { id: '1', name: 'Bravo', ownerName: 'Ramesh' },
    { id: '2', name: 'Alpha', ownerName: 'Suresh' },
    { id: '3', name: 'Charlie', ownerName: 'Mahesh' },
  ])

  const companyName = activeEntity?.companyName ?? 'My Company'
  const companyId   = activeEntity?.companyId ?? ''

  const handleStartTali = () => setBoatModalVisible(true)
  const handleTaliBoatConfirmed = (boat: ApiRegisteredBoat) => {
    setBoatModalVisible(false)
    // router.push({ pathname: '/tali', params: { boatId: boat.id, boatName: boat.name, companyId, companyName } })
    router.push({ pathname: '/tali-fish-select', params: { boatId: boat.id, boatName: boat.name, companyId: companyId ?? '', companyName } })
  }

  const QUICK_ACTIONS = [
    { id: 'tali',     emoji: '⚖️', label: 'Start Tali',      sub: 'Weigh fish arrival',   onPress: handleStartTali },
    { id: 'price',    emoji: '💰', label: 'Fill Price',       sub: 'Enter ₹ per kg',       onPress: () => console.log('TODO: fill price') },
    { id: 'bill',     emoji: '🧾', label: 'View Bills',       sub: `${TEMP_STATS.pendingBills} pending`, onPress: () => console.log('TODO: bills') },
    { id: 'expense',  emoji: '💸', label: 'Add Expense',      sub: 'Company costs',        onPress: () => console.log('TODO: expense') },
  ]

  const MANAGE_ROWS = [
    { emoji: '🚢', label: 'Registered Boats', sub: `${TEMP_STATS.registeredBoats} boats registered`,   onPress: () => console.log('TODO: boats') },
    { emoji: '👥', label: 'Staff & Managers',  sub: 'Access & permissions',                             onPress: () => router.push('/access' as any) },
    { emoji: '📒', label: 'Ledger',            sub: 'All transactions',                                 onPress: () => router.push('/ledger' as any) },
    { emoji: '📊', label: 'CA Export',         sub: 'Season report for accountant',                     onPress: () => console.log('TODO: CA export') },
    {
  emoji: '🧾',
  label: 'Bill Template',
  sub: 'Customise your tali bill format',
  onPress: () => router.push({
    pathname: '/tali-template',
    params: {
      companyId:   companyId ?? '',
      companyName: companyName ?? '',
    },
  } as any)
},
  ]

  const NAV_ITEMS = [
    { emoji: '🏠', label: 'Home',     active: true,  onPress: null },
    { emoji: '⚖️', label: 'Tali',     active: false, onPress: handleStartTali },
    { emoji: '🧾', label: 'Bills',    active: false, onPress: () => console.log('TODO') },
    { emoji: '📒', label: 'Ledger',   active: false, onPress: () => router.push('/ledger' as any) },
    { emoji: '👤', label: 'Profile',  active: false, onPress: () => router.push('/profile' as any) },
  ]

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a1e12" />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Entity Switcher ── */}
          {entities.length > 1 && (
            <View style={s.switcherRow}>
              <EntitySwitcher />
            </View>
          )}

          {/* Top bar */}
          <View style={s.topBar}>
            <View>
              <Text style={s.companyName}>{companyName}</Text>
              <Text style={s.season}>Season {TEMP_STATS.season} · {TEMP_STATS.location}</Text>
            </View>
            <TouchableOpacity style={s.searchBtn}><Text>🔍</Text></TouchableOpacity>
          </View>

          {/* Stats Card */}
          <View style={s.statsCard}>
            <View style={s.statsRow}>
              <View style={s.statBlock}>
                <Text style={s.statLabel}>Net Profit</Text>
                <Text style={s.statBig}>₹{fmt(TEMP_STATS.netProfit)}</Text>
                <Text style={s.statSub}>this season</Text>
              </View>
              <View style={s.statBlock}>
                <Text style={s.statLabel}>Total Catch</Text>
                <Text style={s.statBig}>{fmt(TEMP_STATS.totalCatchKg)} kg</Text>
                <Text style={s.statSub}>across all boats</Text>
              </View>
            </View>
            <View style={s.statsDivider} />
            <View style={s.statsRow}>
              <View style={s.statSmall}>
                <Text style={s.statSmallVal}>{TEMP_STATS.totalBills}</Text>
                <Text style={s.statSmallLabel}>Bills</Text>
              </View>
              <View style={s.statSmall}>
                <Text style={[s.statSmallVal, { color: '#f59e0b' }]}>{TEMP_STATS.pendingBills}</Text>
                <Text style={s.statSmallLabel}>Pending</Text>
              </View>
              <View style={s.statSmall}>
                <Text style={s.statSmallVal}>{TEMP_STATS.registeredBoats}</Text>
                <Text style={s.statSmallLabel}>Boats</Text>
              </View>
              <View style={s.statSmall}>
                <Text style={[s.statSmallVal, { color: '#22c55e' }]}>{TEMP_STATS.activeSessions}</Text>
                <Text style={s.statSmallLabel}>Active Tali</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
          <View style={s.actionsGrid}>
            {QUICK_ACTIONS.map(a => (
              <TouchableOpacity key={a.id} style={s.actionCard} activeOpacity={0.75} onPress={() => a.onPress?.()}>
                <View style={s.actionIconBox}><Text style={s.actionEmoji}>{a.emoji}</Text></View>
                <Text style={s.actionLabel}>{a.label}</Text>
                <Text style={s.actionSub}>{a.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manage */}
          <Text style={s.sectionTitle}>MANAGE</Text>
          {MANAGE_ROWS.map(r => (
            <TouchableOpacity key={r.label} style={s.manageRow} activeOpacity={0.75} onPress={() => r.onPress?.()}>
              <View style={s.manageIcon}><Text style={{ fontSize: 20 }}>{r.emoji}</Text></View>
              <View style={s.manageText}>
                <Text style={s.manageLabel}>{r.label}</Text>
                <Text style={s.manageSub}>{r.sub}</Text>
              </View>
              <Text style={s.manageArrow}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Bottom Nav */}
        <View style={s.bottomNav}>
          {NAV_ITEMS.map(n => (
            <TouchableOpacity key={n.label} style={s.navItem} onPress={() => n.onPress?.()}>
              <Text style={s.navEmoji}>{n.emoji}</Text>
              <Text style={[s.navLabel, n.active && s.navActive]}>{n.label}</Text>
              {n.active && <View style={s.navDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <SelectBoatModal
        visible={boatModalVisible}
        boats={boats}
        onClose={() => setBoatModalVisible(false)}
        onConfirm={handleTaliBoatConfirmed}
      />
    </>
  )
}

const GREEN = '#059669'
const GREEN_LIGHT = '#d1fae5'

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0faf4' },
  scroll: { padding: 16, gap: 14 },
  switcherRow: { paddingBottom: 4 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8 },
  companyName: { fontSize: 26, fontWeight: '800', color: GREEN, letterSpacing: -0.3 },
  season: { fontSize: 13, color: '#34d399', marginTop: 3 },
  searchBtn: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#a7f3d0' },
  statsCard: { backgroundColor: GREEN, borderRadius: 20, padding: 16, gap: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBlock: { flex: 1 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  statBig: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statsDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  statSmall: { flex: 1, alignItems: 'center' },
  statSmallVal: { fontSize: 18, fontWeight: '800', color: '#fff' },
  statSmallLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: GREEN, letterSpacing: 1.5, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47.5%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#a7f3d0', padding: 14, gap: 6, minHeight: 100 },
  actionIconBox: { width: 44, height: 44, backgroundColor: GREEN_LIGHT, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  actionEmoji: { fontSize: 22 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: GREEN },
  actionSub: { fontSize: 11, color: '#34d399' },
  manageRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#a7f3d0', padding: 14, minHeight: 64 },
  manageIcon: { width: 40, height: 40, backgroundColor: GREEN_LIGHT, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  manageText: { flex: 1 },
  manageLabel: { fontSize: 15, fontWeight: '600', color: GREEN },
  manageSub: { fontSize: 12, color: '#34d399', marginTop: 2 },
  manageArrow: { fontSize: 22, color: '#34d399', fontWeight: '700' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#a7f3d0', flexDirection: 'row', paddingBottom: 20, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navEmoji: { fontSize: 22 },
  navLabel: { fontSize: 11, color: '#34d399', fontWeight: '500' },
  navActive: { color: GREEN, fontWeight: '700' },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: GREEN },
})