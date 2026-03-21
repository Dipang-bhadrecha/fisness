/**
 * app/tali-list.tsx — My Talis
 *
 * Key change: when routing to tali-bill, passes canFillPrices='true'|'false'
 * based on the current entity context so boat owners never see fill-price UI.
 */

import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppTabBar } from '../components/shared/AppTabBar'
import { useEntityStore } from '../store/entityStore'
import { SavedTali, TaliStatus, loadAllTalis } from '../utils/taliStorage'

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG    = '#080F1A'
const SURF  = '#0D1B2E'
const ELEV  = '#132640'
const BOR   = 'rgba(255,255,255,0.06)'
const TP    = '#F0F4F8'
const TS    = '#8BA3BC'
const TM    = '#3D5A73'
const TEAL  = '#0891b2'
const GREEN = '#059669'
const AMBER = '#f59e0b'

// ─── Determine if current user can fill prices ────────────────────────────────
// This is evaluated in tali-list so the correct value is passed to tali-bill
// regardless of what entity is active when tali-bill eventually renders.
function useCanFillPricesNow(): boolean {
  const { activeEntity } = useEntityStore()
  if (!activeEntity) return false
  if (activeEntity.type === 'COMPANY' && activeEntity.role === 'owner') return true
  if (activeEntity.type === 'MANAGER_COMPANY' &&
      activeEntity.permissions.includes('FILL_FISH_PRICE')) return true
  return false
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<TaliStatus, {
  label: string
  labelGu: string
  color: string
  icon: 'time-outline' | 'checkmark-circle-outline' | 'lock-closed-outline'
}> = {
  PENDING_PRICE: {
    label:   'Price Not Filled',
    labelGu: 'ભાવ ભર્યો નથી',
    color:   AMBER,
    icon:    'time-outline',
  },
  PRICED: {
    label:   'Price Filled',
    labelGu: 'ભાવ ભર્યો',
    color:   TEAL,
    icon:    'checkmark-circle-outline',
  },
  CONFIRMED: {
    label:   'Confirmed',
    labelGu: 'કન્ફર્મ',
    color:   GREEN,
    icon:    'lock-closed-outline',
  },
}

// ─── Format helpers ────────────────────────────────────────────────────────────
const fmt    = (n: number) => n.toLocaleString('en-IN')
const fmtKg  = (n: number) => `${n.toLocaleString('en-IN')} kg`

function fmtDisplayDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function fmtMonth(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-IN', {
    month: 'short', year: 'numeric',
  })
}

// ─── Tali Card ─────────────────────────────────────────────────────────────────
function TaliCard({
  tali,
  canFillPrices,
}: {
  tali: SavedTali
  canFillPrices: boolean
}) {
  const cfg = STATUS_CFG[tali.status]

  const handlePress = () => {
    router.push({
      pathname: '/tali-bill',
      params: {
        taliId:        tali.id,
        companyId:     tali.companyId,
        boatName:      tali.boatName,
        boatReg:       tali.boatReg,
        ownerName:     tali.ownerName,
        ownerPhone:    tali.ownerPhone,
        // KEY: pass whether the current user can fill prices
        // This is decided HERE based on current entity, not inside tali-bill
        canFillPrices: canFillPrices ? 'true' : 'false',
      },
    } as any)
  }

  return (
    <TouchableOpacity style={tc.card} activeOpacity={0.8} onPress={handlePress}>
      {/* Left accent bar — color by status */}
      <View style={[tc.accentBar, { backgroundColor: cfg.color }]} />

      <View style={tc.inner}>
        {/* Top: bill no + status badge */}
        <View style={tc.topRow}>
          <View style={tc.topLeft}>
            <Text style={tc.billNo}>{tali.billNo === 'PENDING' ? 'Bill Pending' : tali.billNo}</Text>
            <Text style={tc.date}>{fmtDisplayDate(tali.date)}</Text>
          </View>
          <View style={[tc.statusBadge, { backgroundColor: cfg.color + '22' }]}>
            <Ionicons name={cfg.icon} size={11} color={cfg.color} style={{ marginRight: 4 }} />
            <Text style={[tc.statusTxt, { color: cfg.color }]}>{cfg.labelGu}</Text>
          </View>
        </View>

        {/* Boat + Company */}
        <View style={tc.metaRow}>
          <View style={tc.metaItem}>
            <Ionicons name="boat-outline" size={12} color={TS} />
            <Text style={tc.metaTxt}>{tali.boatName}</Text>
          </View>
          <View style={tc.metaItem}>
            <Ionicons name="business-outline" size={12} color={TS} />
            <Text style={tc.metaTxt} numberOfLines={1}>{tali.companyName}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={tc.statsRow}>
          <View style={tc.stat}>
            <Text style={tc.statVal}>{fmtKg(tali.totalKg)}</Text>
            <Text style={tc.statLbl}>Weight</Text>
          </View>
          <View style={tc.statDiv} />
          <View style={tc.stat}>
            <Text style={tc.statVal}>{tali.fishEntries.length}</Text>
            <Text style={tc.statLbl}>Fish Types</Text>
          </View>
          <View style={tc.statDiv} />
          <View style={tc.stat}>
            <Text style={[tc.statVal, !tali.grandTotal && { color: TM }]}>
              {tali.grandTotal !== null
                ? `₹${fmt(Math.round(tali.grandTotal))}`
                : '—'}
            </Text>
            <Text style={tc.statLbl}>Total</Text>
          </View>
        </View>
      </View>

      <View style={tc.chevron}>
        <Ionicons name="chevron-forward" size={16} color={TM} />
      </View>
    </TouchableOpacity>
  )
}

const tc = StyleSheet.create({
  card:        { flexDirection: 'row', backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, overflow: 'hidden' },
  accentBar:   { width: 4 },
  inner:       { flex: 1, padding: 12, gap: 8 },
  chevron:     { justifyContent: 'center', paddingRight: 12 },
  topRow:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  topLeft:     { gap: 2, flex: 1 },
  billNo:      { fontSize: 12, fontWeight: '700', color: TP, fontFamily: 'monospace' },
  date:        { fontSize: 11, color: TS },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, marginLeft: 8 },
  statusTxt:   { fontSize: 10, fontWeight: '700' },
  metaRow:     { flexDirection: 'row', gap: 14 },
  metaItem:    { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaTxt:     { fontSize: 11, color: TS, flexShrink: 1 },
  statsRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: ELEV, borderRadius: 8, padding: 8 },
  stat:        { flex: 1, alignItems: 'center', gap: 1 },
  statVal:     { fontSize: 12, fontWeight: '700', color: TP },
  statLbl:     { fontSize: 9, color: TS },
  statDiv:     { width: 1, height: 20, backgroundColor: BOR },
})

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function TaliListScreen() {
  const canFillPrices = useCanFillPricesNow()

  const [talis,      setTalis]      = useState<SavedTali[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filter state
  const [activeMonth,  setActiveMonth]  = useState('All')
  const [activeBoat,   setActiveBoat]   = useState('All')
  const [activeStatus, setActiveStatus] = useState<TaliStatus | 'All'>('All')

  // Load talis every time screen is focused
  const loadTalis = useCallback(async () => {
    try {
      const all = await loadAllTalis()
      all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setTalis(all)
    } catch (e) {
      console.error('Failed to load talis', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      loadTalis()
    }, [loadTalis])
  )

  const handleRefresh = () => {
    setRefreshing(true)
    loadTalis()
  }

  // Filter options
  const months = ['All', ...Array.from(new Set(talis.map(t => fmtMonth(t.date))))]
  const boats  = ['All', ...Array.from(new Set(talis.map(t => t.boatName)))]

  // Apply filters
  const filtered = talis.filter(t => {
    const matchMonth  = activeMonth  === 'All' || fmtMonth(t.date) === activeMonth
    const matchBoat   = activeBoat   === 'All' || t.boatName === activeBoat
    const matchStatus = activeStatus === 'All' || t.status === activeStatus
    return matchMonth && matchBoat && matchStatus
  })

  // Alert counts
  const pendingCount = talis.filter(t => t.status === 'PENDING_PRICE').length

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => router.canGoBack() ? router.back() : null}
          >
            <Ionicons name="arrow-back" size={20} color={TP} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>My Talis</Text>
            <Text style={s.headerSub}>{filtered.length} records</Text>
          </View>
          {pendingCount > 0 && (
            <View style={s.alertDot}>
              <Text style={s.alertDotTxt}>{pendingCount}</Text>
            </View>
          )}
        </View>

        {/* Status filter pills */}
        <View style={s.statusBar}>
          {(['All', 'PENDING_PRICE', 'PRICED', 'CONFIRMED'] as const).map(st => {
            const isAll    = st === 'All'
            const cfg      = isAll ? null : STATUS_CFG[st]
            const isActive = activeStatus === st
            return (
              <TouchableOpacity
                key={st}
                style={[
                  s.statusPill,
                  isActive && s.statusPillActive,
                  isActive && !isAll && { borderColor: cfg!.color, backgroundColor: cfg!.color + '18' },
                ]}
                onPress={() => setActiveStatus(st)}
              >
                {!isAll && cfg && (
                  <Ionicons
                    name={cfg.icon}
                    size={11}
                    color={isActive ? cfg.color : TS}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={[
                  s.statusPillTxt,
                  isActive && !isAll && { color: cfg!.color, fontWeight: '700' },
                  isActive && isAll  && { color: TEAL, fontWeight: '700' },
                ]}>
                  {isAll ? 'All' : cfg!.labelGu}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Month filter */}
        {months.length > 2 && (
          <View style={s.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
              {months.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[s.pill, activeMonth === m && s.pillActive]}
                  onPress={() => setActiveMonth(m)}
                >
                  <Text style={[s.pillTxt, activeMonth === m && s.pillTxtActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Boat filter */}
        {boats.length > 2 && (
          <View style={s.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
              {boats.map(b => (
                <TouchableOpacity
                  key={b}
                  style={[s.pill, s.pillBoat, activeBoat === b && s.pillActive]}
                  onPress={() => setActiveBoat(b)}
                >
                  <Text style={[s.pillTxt, activeBoat === b && s.pillTxtActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* List */}
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color={TEAL} size="large" />
            <Text style={s.loadingTxt}>Loading talis...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={TEAL}
              />
            }
          >
            {filtered.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="document-outline" size={52} color={TM} />
                <Text style={s.emptyTitle}>
                  {talis.length === 0 ? 'No talis yet' : 'No talis found'}
                </Text>
                <Text style={s.emptySubtitle}>
                  {talis.length === 0
                    ? 'Start a tali session to see it here'
                    : 'Try a different filter'}
                </Text>
              </View>
            ) : (
              filtered.map(t => (
                <TaliCard
                  key={t.id}
                  tali={t}
                  canFillPrices={canFillPrices}
                />
              ))
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        <AppTabBar activeTab="tali" />
      </SafeAreaView>
    </>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    gap: 12, borderBottomWidth: 1, borderBottomColor: BOR,
  },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: TP },
  headerSub:    { fontSize: 12, color: TS, marginTop: 1 },
  alertDot:     { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: AMBER, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  alertDotTxt:  { fontSize: 11, fontWeight: '800', color: '#000' },

  statusBar: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: BOR,
    flexWrap: 'wrap',
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
    backgroundColor: ELEV, borderColor: BOR,
  },
  statusPillActive: { borderColor: TEAL, backgroundColor: TEAL + '15' },
  statusPillTxt:    { fontSize: 11, fontWeight: '600', color: TS },

  filterSection: { paddingHorizontal: 16, paddingTop: 8 },
  filterScroll:  { gap: 8, paddingBottom: 4 },
  pill:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: ELEV, borderWidth: 1, borderColor: BOR },
  pillBoat:      { backgroundColor: SURF },
  pillActive:    { backgroundColor: TEAL + '20', borderColor: TEAL },
  pillTxt:       { fontSize: 12, fontWeight: '600', color: TS },
  pillTxtActive: { color: TEAL, fontWeight: '700' },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingTxt: { color: TS, fontSize: 14 },

  list:  { paddingHorizontal: 16, paddingTop: 10, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: TS },
  emptySubtitle: { fontSize: 13, color: TM, textAlign: 'center' },
})