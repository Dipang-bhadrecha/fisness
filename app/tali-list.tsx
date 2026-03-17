/**
 * app/tali-list.tsx — My Talis Screen with AppTabBar footer
 */

import { Ionicons } from '@expo/vector-icons'
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
import { AppTabBar } from '../components/shared/AppTabBar'

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

type TaliStatus = 'PENDING_PRICE' | 'PRICED' | 'CONFIRMED'

interface TaliSummary {
  id: string
  billNo: string
  boatName: string
  companyName: string
  date: string
  month: string
  totalKg: number
  fishCount: number
  status: TaliStatus
  finalTotal: number | null
  hasPriceChange: boolean
}

const MOCK_TALIS: TaliSummary[] = [
  { id: '1', billNo: 'BILL-20260315-9133', boatName: 'Jai Mataji', companyName: 'Goshiya Sea Foods', date: '15 Mar 2026', month: 'Mar 2026', totalKg: 869,  fishCount: 2, status: 'PRICED',        finalTotal: 199459, hasPriceChange: true  },
  { id: '2', billNo: 'BILL-20260310-4421', boatName: 'Jai Mataji', companyName: 'Goshiya Sea Foods', date: '10 Mar 2026', month: 'Mar 2026', totalKg: 1240, fishCount: 4, status: 'CONFIRMED',     finalTotal: 312800, hasPriceChange: false },
  { id: '3', billNo: 'BILL-20260302-7781', boatName: 'Sea Star',   companyName: 'Goshiya Sea Foods', date: '02 Mar 2026', month: 'Mar 2026', totalKg: 620,  fishCount: 3, status: 'PENDING_PRICE', finalTotal: null,   hasPriceChange: false },
  { id: '4', billNo: 'BILL-20260218-3312', boatName: 'Jai Mataji', companyName: 'Goshiya Sea Foods', date: '18 Feb 2026', month: 'Feb 2026', totalKg: 980,  fishCount: 3, status: 'CONFIRMED',     finalTotal: 248000, hasPriceChange: false },
  { id: '5', billNo: 'BILL-20260205-1190', boatName: 'Sea Star',   companyName: 'Goshiya Sea Foods', date: '05 Feb 2026', month: 'Feb 2026', totalKg: 540,  fishCount: 2, status: 'CONFIRMED',     finalTotal: 127000, hasPriceChange: false },
]

const STATUS_CFG: Record<TaliStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  PENDING_PRICE: { label: 'Pending Price', color: AMBER,  icon: 'time-outline'             },
  PRICED:        { label: 'Review Price',  color: TEAL,   icon: 'checkmark-circle-outline' },
  CONFIRMED:     { label: 'Confirmed',     color: GREEN,  icon: 'lock-closed-outline'      },
}

const fmt = (n: number) => n.toLocaleString('en-IN')
const fmtKg = (n: number) => `${n.toLocaleString('en-IN')} kg`

function TaliCard({ tali }: { tali: TaliSummary }) {
  const cfg = STATUS_CFG[tali.status]
  return (
    <TouchableOpacity
      style={tc.card}
      activeOpacity={0.8}
      onPress={() => router.push({
        pathname: '/tali-bill',
        params: { taliId: tali.id, role: 'boat_owner', boatName: tali.boatName, companyName: tali.companyName },
      } as any)}
    >
      <View style={[tc.accentBar, { backgroundColor: cfg.color }]} />
      <View style={tc.inner}>
        <View style={tc.topRow}>
          <View style={tc.topLeft}>
            <Text style={tc.billNo}>{tali.billNo}</Text>
            <Text style={tc.date}>{tali.date}</Text>
          </View>
          <View style={[tc.statusBadge, { backgroundColor: cfg.color + '20' }]}>
            {tali.hasPriceChange && <Ionicons name="alert-circle" size={11} color={AMBER} style={{ marginRight: 2 }} />}
            <Ionicons name={cfg.icon} size={11} color={cfg.color} style={{ marginRight: 3 }} />
            <Text style={[tc.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <View style={tc.metaRow}>
          <View style={tc.metaItem}>
            <Ionicons name="boat-outline" size={12} color={TS} />
            <Text style={tc.metaText}>{tali.boatName}</Text>
          </View>
          <View style={tc.metaItem}>
            <Ionicons name="business-outline" size={12} color={TS} />
            <Text style={tc.metaText}>{tali.companyName}</Text>
          </View>
        </View>
        <View style={tc.bottomRow}>
          <View style={tc.stat}>
            <Text style={tc.statVal}>{fmtKg(tali.totalKg)}</Text>
            <Text style={tc.statLbl}>Weight</Text>
          </View>
          <View style={tc.statDiv} />
          <View style={tc.stat}>
            <Text style={tc.statVal}>{tali.fishCount}</Text>
            <Text style={tc.statLbl}>Fish Types</Text>
          </View>
          <View style={tc.statDiv} />
          <View style={tc.stat}>
            <Text style={[tc.statVal, !tali.finalTotal && { color: TM }]}>
              {tali.finalTotal ? `₹${fmt(tali.finalTotal)}` : '—'}
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

export default function TaliListScreen() {
  const months = ['All', ...Array.from(new Set(MOCK_TALIS.map(t => t.month)))]
  const boats  = ['All', ...Array.from(new Set(MOCK_TALIS.map(t => t.boatName)))]

  const [activeMonth, setActiveMonth] = useState('All')
  const [activeBoat,  setActiveBoat]  = useState('All')

  const filtered = MOCK_TALIS.filter(t =>
    (activeMonth === 'All' || t.month === activeMonth) &&
    (activeBoat  === 'All' || t.boatName === activeBoat)
  )

  const pendingCount = filtered.filter(t => t.status === 'PRICED' && t.hasPriceChange).length

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top']}>

        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.canGoBack() ? router.back() : null}>
            <Ionicons name="arrow-back" size={20} color={TP} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>My Talis</Text>
            <Text style={s.headerSub}>{filtered.length} records</Text>
          </View>
          {pendingCount > 0 && (
            <View style={s.alertDot}>
              <Text style={s.alertDotText}>{pendingCount}</Text>
            </View>
          )}
        </View>

        <View style={s.filterSection}>
          <View style={s.filterWrap}>
            {months.map(m => (
              <TouchableOpacity key={m} style={[s.pill, activeMonth === m && s.pillActive]} onPress={() => setActiveMonth(m)}>
                <Text style={[s.pillText, activeMonth === m && s.pillTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {boats.length > 2 && (
          <View style={s.filterSection}>
            <View style={s.filterWrap}>
              {boats.map(b => (
                <TouchableOpacity key={b} style={[s.pill, s.pillBoat, activeBoat === b && s.pillActive]} onPress={() => setActiveBoat(b)}>
                  <Text style={[s.pillText, activeBoat === b && s.pillTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {filtered.length === 0
            ? <View style={s.empty}><Ionicons name="document-outline" size={48} color={TM} /><Text style={s.emptyText}>No talis found</Text></View>
            : filtered.map(t => <TaliCard key={t.id} tali={t} />)
          }
          <View style={{ height: 100 }} />
        </ScrollView>

        <AppTabBar activeTab="tali" />
      </SafeAreaView>
    </>
  )
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: BG },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: BOR },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: ELEV, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: TP },
  headerSub:    { fontSize: 12, color: TS, marginTop: 1 },
  alertDot:     { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: AMBER, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  alertDotText: { fontSize: 11, fontWeight: '800', color: '#000' },

  filterSection:{ paddingHorizontal: 16, paddingTop: 8 },
  filterWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: ELEV, borderWidth: 1, borderColor: BOR },
  pillBoat:     { backgroundColor: SURF },
  pillActive:   { backgroundColor: TEAL + '20', borderColor: TEAL },
  pillText:     { fontSize: 12, fontWeight: '600', color: TS },
  pillTextActive:{ color: TEAL, fontWeight: '700' },

  list:      { paddingHorizontal: 16, gap: 10, paddingTop: 10 },
  empty:     { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, color: TS },

})

const tc = StyleSheet.create({
  card:        { flexDirection: 'row', backgroundColor: SURF, borderRadius: 14, borderWidth: 1, borderColor: BOR, overflow: 'hidden' },
  accentBar:   { width: 4 },
  inner:       { flex: 1, padding: 12, gap: 8 },
  chevron:     { justifyContent: 'center', paddingRight: 12 },
  topRow:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  topLeft:     { gap: 2 },
  billNo:      { fontSize: 12, fontWeight: '700', color: TP, fontFamily: 'monospace' },
  date:        { fontSize: 11, color: TS },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  metaRow:     { flexDirection: 'row', gap: 14 },
  metaItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:    { fontSize: 11, color: TS },
  bottomRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: ELEV, borderRadius: 8, padding: 8 },
  stat:        { flex: 1, alignItems: 'center', gap: 1 },
  statVal:     { fontSize: 12, fontWeight: '700', color: TP },
  statLbl:     { fontSize: 9, color: TS },
  statDiv:     { width: 1, height: 20, backgroundColor: BOR },
})
