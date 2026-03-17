/**
 * app/(boat)/home.tsx — Boat Owner Dashboard
 *
 * This is your existing (owner)/home.tsx, moved here.
 * Added: EntitySwitcher at the top so multi-entity users can switch context.
 *
 * Keep your (owner)/home.tsx as-is during migration.
 * Once (boat)/home.tsx is confirmed working, delete (owner)/home.tsx.
 */

import { router } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EntitySwitcher } from '../../components/shared/EntitySwitcher'
import { SelectBoatModal } from '../../components/shared/SelectBoatScreen'
import { theme } from '../../constants/theme'
import { useLanguage } from '../../hooks/useLanguage'
import { ApiRegisteredBoat } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useEntityStore } from '../../store/entityStore'

const OWNER = { season: '2025–26', location: 'Veraval', totalProfit: 420000, totalCatch: 420000, totalBoats: 3, seasonAdvance: 720000, maintenance: 150000, diesel: 100000 }
const fmt = (n: number) => n.toLocaleString('en-IN')

export default function BoatDashboardHome() {
  const { t } = useLanguage()
  const { user } = useAuthStore()
  const { activeEntity, entities } = useEntityStore()

  const [boats, setBoats] = useState<ApiRegisteredBoat[]>([])
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string>('કંપની')

  const [taliBoatModalVisible, setTaliBoatModalVisible] = useState(false)
  const [expenseBoatModalVisible, setExpenseBoatModalVisible] = useState(false)
  const [kharchiBoatModalVisible, setKharchiBoatModalVisible] = useState(false)

  const loadBoats = () => {
    const tempBoats: ApiRegisteredBoat[] = [
      { id: '1', name: 'Alpha',   nameGujarati: 'આલ્ફા',  ownerName: 'Rohan' },
      { id: '2', name: 'Beta',    nameGujarati: 'બીટા',   ownerName: 'Rohan' },
      { id: '3', name: 'Gamma',   nameGujarati: 'ગામા',   ownerName: 'Rohan' },
    ]
    setBoats(tempBoats)
    setCompanyId('personal')
    setCompanyName('Personal Fleet')
  }

  const handleAddTaliPress    = () => { loadBoats(); setTaliBoatModalVisible(true) }
  const handleAddExpensePress = () => { loadBoats(); setExpenseBoatModalVisible(true) }
  const handleAddKharchiPress = () => { loadBoats(); setKharchiBoatModalVisible(true) }
  const handleCrewPress = () => {
    router.push({ pathname: '/crew', params: { boatId: '1', boatName: 'Alpha', companyId: 'personal', companyName: 'Personal' } })
  }

  const handleTaliBoatConfirmed = (boat: ApiRegisteredBoat) => {
    setTaliBoatModalVisible(false)
    // router.push({ pathname: '/tali', params: { boatId: boat.id, boatName: boat.name, companyId: companyId ?? '', companyName } })
    router.push({ pathname: '/tali-fish-select', params: { boatId: boat.id, boatName: boat.name, companyId: companyId ?? '', companyName } })
  }

  const handleExpenseBoatConfirmed = (boat: ApiRegisteredBoat) => {
    setExpenseBoatModalVisible(false)
    router.push({ pathname: '/pre-departure-expense' as any, params: { boatId: boat.id, boatName: boat.name } })
  }

  const handleKharchiBoatConfirmed = (boat: ApiRegisteredBoat) => {
    setKharchiBoatModalVisible(false)
    router.push({ pathname: '/kharchi', params: { boatId: boat.id, boatName: boat.name, companyId: companyId ?? '', companyName } })
  }

const QUICK_ACTIONS = [
  { id: 'tali',    emoji: '⚖️', label: t.home.addTali,   sub: t.home.addTaliSub,    onPress: handleAddTaliPress },
  { id: 'expense', emoji: '💸', label: t.home.addExpense, sub: t.home.addExpenseSub, onPress: handleAddExpensePress },
  { id: 'kharchi', emoji: '💰', label: t.home.addKharchi, sub: t.home.addKharchiSub, onPress: handleAddKharchiPress },
  { id: 'more',    emoji: '📦', label: t.home.more,       sub: t.home.moreSub,       onPress: null },
]

const MANAGE_ROWS = [
  { emoji: '✈️', label: t.home.trips,  sub: t.home.tripsSub,  onPress: () => router.push('/trips' as any) },
  { emoji: '🚤', label: t.home.boats,  sub: t.home.boatsSub,  onPress: null },  // ✅ already null - no boats screen
  { emoji: '👥', label: t.home.crew,   sub: t.home.crewSub,   onPress: handleCrewPress },
  { emoji: '📒', label: t.home.ledger, sub: t.home.ledgerSub, onPress: () => router.push('/ledger' as any) },
]

const NAV_ITEMS = [
  { emoji: '🏠', label: 'Home',    active: true,  onPress: null },
  { emoji: '⚖️', label: 'Tali',    active: false, onPress: handleAddTaliPress },
  { emoji: '🚤', label: 'Trips',   active: false, onPress: () => router.push('/trips' as any) },
  { emoji: '📒', label: 'Ledger',  active: false, onPress: () => router.push('/ledger' as any) },
  { emoji: '👤', label: 'Profile', active: false, onPress: () => router.push('/profile' as any) },
]

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Entity Switcher (NEW) ── */}
          {entities.length > 1 && (
            <View style={s.switcherRow}>
              <EntitySwitcher />
            </View>
          )}

          {/* Top bar */}
          <View style={s.topBar}>
            <View>
              <Text style={s.greeting}>{t.home.greeting(user?.name ?? 'User')}</Text>
              <Text style={s.season}>{t.home.seasonLabel(OWNER.season, OWNER.location)}</Text>
            </View>
            <TouchableOpacity style={s.searchBtn}><Text style={s.searchIcon}>🔍</Text></TouchableOpacity>
          </View>

          {/* Stats card */}
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

          {/* Quick Actions */}
          <Text style={s.sectionTitle}>{t.home.quickActions}</Text>
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
          <Text style={s.sectionTitle}>{t.home.manage}</Text>
          {MANAGE_ROWS.map(r => (
            <TouchableOpacity key={r.label} style={s.manageRow} activeOpacity={0.75} onPress={() => r.onPress?.()}>
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

        {/* Bottom Nav */}
        <View style={s.bottomNav}>
          {NAV_ITEMS.map(n => (
            <TouchableOpacity key={n.label} style={s.navItem} activeOpacity={0.7} onPress={() => n.onPress?.()}>
              <Text style={s.navEmoji}>{n.emoji}</Text>
              <Text style={[s.navLabel, n.active && s.navLabelActive]}>{n.label}</Text>
              {n.active && <View style={s.navDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <SelectBoatModal visible={taliBoatModalVisible}    boats={boats} onClose={() => setTaliBoatModalVisible(false)}    onConfirm={handleTaliBoatConfirmed} />
      <SelectBoatModal visible={expenseBoatModalVisible} boats={boats} onClose={() => setExpenseBoatModalVisible(false)} onConfirm={handleExpenseBoatConfirmed} />
      <SelectBoatModal visible={kharchiBoatModalVisible} boats={boats} onClose={() => setKharchiBoatModalVisible(false)} onConfirm={handleKharchiBoatConfirmed} />
    </>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#E8F9F8' },
  scroll: { padding: 16, gap: 14 },
  switcherRow: { paddingBottom: 4 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#0097A7', letterSpacing: -0.3 },
  season: { fontSize: 13, color: '#4DB8C4', marginTop: 3 },
  searchBtn: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#B2EBF2' },
  searchIcon: { fontSize: 20, color: '#00BCD4' },
  statsCard: { backgroundColor: '#00BCD4', borderRadius: 20, padding: 16, flexDirection: 'row', gap: 16, minHeight: 160 },
  statsLeft: { flex: 1, gap: 3 },
  statsSmLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)' },
  statsBigNum: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  statsChange: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  statsDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 6 },
  statsRight: { gap: 3, alignItems: 'flex-end', justifyContent: 'center' },
  statsRightLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  statsRightVal: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  statsRightDivider: { width: 80, height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#0097A7', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47.5%', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#B2EBF2', padding: 14, gap: 6, minHeight: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  actionIconBox: { width: 44, height: 44, backgroundColor: '#E0F7FA', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  actionEmoji: { fontSize: 22 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: '#0097A7' },
  actionSub: { fontSize: 11, color: '#4DB8C4' },
  manageRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#B2EBF2', padding: 14, minHeight: 64, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  manageRowIcon: { width: 40, height: 40, backgroundColor: '#E0F7FA', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  manageRowEmoji: { fontSize: 20 },
  manageRowText: { flex: 1 },
  manageRowLabel: { fontSize: 15, fontWeight: '600', color: '#0097A7' },
  manageRowSub: { fontSize: 12, color: '#4DB8C4', marginTop: 2 },
  manageRowArrow: { fontSize: 22, color: '#4DB8C4', fontWeight: '700' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#B2EBF2', flexDirection: 'row', paddingBottom: 20, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navEmoji: { fontSize: 22 },
  navLabel: { fontSize: 11, color: '#4DB8C4', fontWeight: '500' },
  navLabelActive: { color: '#00BCD4', fontWeight: '700' },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#00BCD4' },
})