/**
 * app/ledger.tsx — Ledger Screen
 *
 * Accessible from the bottom tab bar (Ledger tab).
 * Financial summary + transaction history for all boats.
 *
 * Tabs:
 *   - Overview  → season P&L summary per boat
 *   - Income    → tali / catch income entries
 *   - Expenses  → fuel, maintenance, crew, other costs
 *
 * TODO: Replace MOCK data with:
 *   GET /api/v1/ledger/summary
 *   GET /api/v1/ledger/transactions?type=income|expense
 */

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
import { theme } from '../constants/theme'

// ── Types ──────────────────────────────────────────────────────────────────────
type LedgerTab = 'overview' | 'income' | 'expenses'
type TxCategory = 'tali' | 'fuel' | 'maintenance' | 'crew' | 'repair' | 'ice' | 'food' | 'other'

interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense'
  category: TxCategory
  description: string
  boatName: string
  amount: number
  trip?: string
}

interface BoatSummary {
  boatName: string
  boatReg: string
  income: number
  expenses: number
  profit: number
  trips: number
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const BOAT_SUMMARIES: BoatSummary[] = [
  { boatName: 'Bravo',   boatReg: 'GJ-01', income: 1840000, expenses: 620000, profit: 1220000, trips: 13 },
  { boatName: 'Alpha',   boatReg: 'GJ-02', income: 2100000, expenses: 710000, profit: 1390000, trips: 12 },
  { boatName: 'Charlie', boatReg: 'GJ-03', income: 1560000, expenses: 490000, profit: 1070000, trips: 11 },
  { boatName: 'Delta',   boatReg: 'GJ-04', income: 980000,  expenses: 340000, profit: 640000,  trips: 8  },
]

const TRANSACTIONS: Transaction[] = [
  { id: '1',  date: '08 Mar 2026', type: 'income',  category: 'tali',        description: 'Tali #47 — Pomfret & Shrimp',   boatName: 'Bravo',   amount: 184000, trip: 'Trip #13' },
  { id: '2',  date: '07 Mar 2026', type: 'expense', category: 'fuel',        description: 'Diesel refill — Veraval port',    boatName: 'Alpha',   amount: 85000 },
  { id: '3',  date: '06 Mar 2026', type: 'income',  category: 'tali',        description: 'Tali #46 — Surmai',              boatName: 'Alpha',   amount: 210000, trip: 'Trip #12' },
  { id: '4',  date: '05 Mar 2026', type: 'expense', category: 'maintenance', description: 'Engine service — Alpha',          boatName: 'Alpha',   amount: 45000 },
  { id: '5',  date: '04 Mar 2026', type: 'expense', category: 'crew',        description: 'Season advance — 8 crew',         boatName: 'Bravo',   amount: 240000 },
  { id: '6',  date: '03 Mar 2026', type: 'income',  category: 'tali',        description: 'Tali #45 — Pomfret',             boatName: 'Charlie', amount: 156000, trip: 'Trip #11' },
  { id: '7',  date: '02 Mar 2026', type: 'expense', category: 'ice',         description: 'Ice blocks — 200 bags',           boatName: 'Charlie', amount: 18000 },
  { id: '8',  date: '01 Mar 2026', type: 'expense', category: 'repair',      description: 'Net repair — Delta',              boatName: 'Delta',   amount: 32000 },
  { id: '9',  date: '28 Feb 2026', type: 'income',  category: 'tali',        description: 'Tali #44 — Mixed catch',         boatName: 'Bravo',   amount: 98000,  trip: 'Trip #12' },
  { id: '10', date: '27 Feb 2026', type: 'expense', category: 'food',        description: 'Provisions for trip',             boatName: 'Bravo',   amount: 22000 },
  { id: '11', date: '25 Feb 2026', type: 'expense', category: 'fuel',        description: 'Diesel — Charlie',                boatName: 'Charlie', amount: 78000 },
  { id: '12', date: '24 Feb 2026', type: 'income',  category: 'tali',        description: 'Tali #43 — Shrimp & Squid',      boatName: 'Delta',   amount: 130000, trip: 'Trip #10' },
]

const CATEGORY_CONFIG: Record<TxCategory, { emoji: string; color: string }> = {
  tali:        { emoji: '⚖️', color: '#22c55e' },
  fuel:        { emoji: '⛽', color: '#f59e0b' },
  maintenance: { emoji: '🔧', color: '#3b82f6' },
  crew:        { emoji: '👥', color: '#8b5cf6' },
  repair:      { emoji: '🛠️', color: '#ec4899' },
  ice:         { emoji: '🧊', color: '#22d3ee' },
  food:        { emoji: '🍱', color: '#84cc16' },
  other:       { emoji: '📦', color: '#94a3b8' },
}

const fmt = (n: number) => `₹ ${n.toLocaleString('en-IN')}`
const fmtShort = (n: number) => n >= 100000
  ? `₹${(n / 100000).toFixed(1)}L`
  : `₹${(n / 1000).toFixed(0)}K`

// ── Season overview tab ────────────────────────────────────────────────────────
function OverviewTab() {
  const totalIncome   = BOAT_SUMMARIES.reduce((s, b) => s + b.income, 0)
  const totalExpenses = BOAT_SUMMARIES.reduce((s, b) => s + b.expenses, 0)
  const totalProfit   = BOAT_SUMMARIES.reduce((s, b) => s + b.profit, 0)
  const margin        = Math.round((totalProfit / totalIncome) * 100)

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>

      {/* Season totals card */}
      <View style={o.seasonCard}>
        <Text style={o.seasonLabel}>SEASON 2025–26 TOTAL</Text>
        <Text style={o.seasonProfit}>{fmt(totalProfit)}</Text>
        <Text style={o.seasonSub}>Net Profit · {margin}% margin</Text>
        <View style={o.seasonRow}>
          <View style={o.seasonItem}>
            <Text style={[o.seasonItemVal, { color: '#22c55e' }]}>{fmtShort(totalIncome)}</Text>
            <Text style={o.seasonItemLabel}>Total Income</Text>
          </View>
          <View style={o.seasonDivider} />
          <View style={o.seasonItem}>
            <Text style={[o.seasonItemVal, { color: '#ef4444' }]}>{fmtShort(totalExpenses)}</Text>
            <Text style={o.seasonItemLabel}>Total Expenses</Text>
          </View>
          <View style={o.seasonDivider} />
          <View style={o.seasonItem}>
            <Text style={[o.seasonItemVal, { color: '#f59e0b' }]}>
              {BOAT_SUMMARIES.reduce((s, b) => s + b.trips, 0)}
            </Text>
            <Text style={o.seasonItemLabel}>Total Trips</Text>
          </View>
        </View>
      </View>

      {/* Per boat breakdown */}
      <Text style={o.sectionLabel}>PER BOAT</Text>
      {BOAT_SUMMARIES.map(boat => {
        const margin = Math.round((boat.profit / boat.income) * 100)
        const barWidth = (boat.income / Math.max(...BOAT_SUMMARIES.map(b => b.income))) * 100
        return (
          <View key={boat.boatName} style={o.boatCard}>
            <View style={o.boatCardTop}>
              <View style={o.boatCardLeft}>
                <Text style={o.boatEmoji}>🚢</Text>
                <View>
                  <Text style={o.boatCardName}>{boat.boatName}</Text>
                  <Text style={o.boatCardReg}>{boat.boatReg} · {boat.trips} trips</Text>
                </View>
              </View>
              <View style={o.boatCardRight}>
                <Text style={o.boatProfit}>{fmtShort(boat.profit)}</Text>
                <Text style={o.boatMargin}>{margin}% margin</Text>
              </View>
            </View>
            {/* Income vs expense bar */}
            <View style={o.barTrack}>
              <View style={[o.barIncome, { flex: boat.income }]} />
              <View style={[o.barExpense, { flex: boat.expenses }]} />
            </View>
            <View style={o.boatCardBottom}>
              <Text style={o.boatIncome}>↑ {fmtShort(boat.income)} income</Text>
              <Text style={o.boatExpense}>↓ {fmtShort(boat.expenses)} expenses</Text>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

// ── Transaction list tab ───────────────────────────────────────────────────────
function TransactionTab({ type }: { type: 'income' | 'expenses' }) {
  const txType = type === 'income' ? 'income' : 'expense'
  const txns = TRANSACTIONS.filter(t => t.type === txType)
  const total = txns.reduce((s, t) => s + t.amount, 0)

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 32 }}>
      {/* Total banner */}
      <View style={[t.totalBanner, { borderColor: txType === 'income' ? '#22c55e30' : '#ef444430' }]}>
        <Text style={t.totalBannerLabel}>
          {txType === 'income' ? 'Total Income' : 'Total Expenses'}
        </Text>
        <Text style={[t.totalBannerVal, { color: txType === 'income' ? '#22c55e' : '#ef4444' }]}>
          {fmt(total)}
        </Text>
        <Text style={t.totalBannerSub}>{txns.length} transactions</Text>
      </View>

      {/* Transactions */}
      {txns.map(tx => {
        const cfg = CATEGORY_CONFIG[tx.category]
        return (
          <View key={tx.id} style={t.txCard}>
            <View style={[t.txIcon, { backgroundColor: cfg.color + '18' }]}>
              <Text style={t.txEmoji}>{cfg.emoji}</Text>
            </View>
            <View style={t.txBody}>
              <Text style={t.txDesc} numberOfLines={1}>{tx.description}</Text>
              <View style={t.txMeta}>
                <Text style={t.txBoat}>🚢 {tx.boatName}</Text>
                {tx.trip && <Text style={t.txTrip}>· {tx.trip}</Text>}
                <Text style={t.txDate}>· {tx.date}</Text>
              </View>
            </View>
            <Text style={[t.txAmount, { color: txType === 'income' ? '#22c55e' : '#ef4444' }]}>
              {txType === 'income' ? '+' : '−'}{fmtShort(tx.amount)}
            </Text>
          </View>
        )
      })}
    </ScrollView>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function LedgerScreen() {
  const [activeTab, setActiveTab] = useState<LedgerTab>('overview')

  const TABS: { id: LedgerTab; label: string; emoji: string }[] = [
    { id: 'overview',  label: 'Overview',  emoji: '📊' },
    { id: 'income',    label: 'Income',    emoji: '💰' },
    { id: 'expenses',  label: 'Expenses',  emoji: '💸' },
  ]

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.canGoBack() ? router.back() : null}
        >
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Ledger</Text>
          <Text style={s.headerSub}>Season 2025–26</Text>
        </View>
        <TouchableOpacity style={s.exportBtn}>
          <Text style={s.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[s.tab, activeTab === tab.id && s.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={s.tabEmoji}>{tab.emoji}</Text>
            <Text style={[s.tabLabel, activeTab === tab.id && s.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={s.content}>
        {activeTab === 'overview'  && <OverviewTab />}
        {activeTab === 'income'    && <TransactionTab type="income" />}
        {activeTab === 'expenses'  && <TransactionTab type="expenses" />}
      </View>

    </SafeAreaView>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const BG   = theme.colors.background
const SURF = theme.colors.surface
const ELEV = theme.colors.elevated
const BOR  = theme.colors.border
const TP   = theme.colors.textPrimary
const TS   = theme.colors.textSecondary
const TEAL = theme.colors.primary

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: TEAL, paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  exportBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  exportBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  tabRow: { flexDirection: 'row', backgroundColor: SURF, borderBottomWidth: 1, borderBottomColor: BOR },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 13 },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: TEAL },
  tabEmoji: { fontSize: 15 },
  tabLabel: { fontSize: 13, fontWeight: '600', color: TS },
  tabLabelActive: { color: TEAL, fontWeight: '800' },

  content: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
})

// ── Overview styles ────────────────────────────────────────────────────────────
const o = StyleSheet.create({
  seasonCard: { backgroundColor: TEAL + '18', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: TEAL + '30', alignItems: 'center' },
  seasonLabel: { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 0.8, marginBottom: 6 },
  seasonProfit: { fontSize: 34, fontWeight: '800', color: TP, letterSpacing: -1 },
  seasonSub: { fontSize: 13, color: TS, marginTop: 4, marginBottom: 14 },
  seasonRow: { flexDirection: 'row', width: '100%' },
  seasonItem: { flex: 1, alignItems: 'center', gap: 3 },
  seasonItemVal: { fontSize: 16, fontWeight: '800' },
  seasonItemLabel: { fontSize: 10, color: TS },
  seasonDivider: { width: 1, backgroundColor: BOR, marginVertical: 4 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 0.8, marginTop: 4 },

  boatCard: { backgroundColor: SURF, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BOR, gap: 10 },
  boatCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boatCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  boatEmoji: { fontSize: 26 },
  boatCardName: { fontSize: 15, fontWeight: '800', color: TP },
  boatCardReg: { fontSize: 11, color: TS, marginTop: 2 },
  boatCardRight: { alignItems: 'flex-end' },
  boatProfit: { fontSize: 17, fontWeight: '800', color: '#22c55e' },
  boatMargin: { fontSize: 11, color: TS, marginTop: 2 },

  barTrack: { height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden' },
  barIncome: { backgroundColor: '#22c55e', height: '100%' },
  barExpense: { backgroundColor: '#ef4444', height: '100%' },

  boatCardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  boatIncome: { fontSize: 12, color: '#22c55e', fontWeight: '600' },
  boatExpense: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
})

// ── Transaction styles ─────────────────────────────────────────────────────────
const t = StyleSheet.create({
  totalBanner: { backgroundColor: SURF, borderRadius: 14, padding: 16, borderWidth: 1, alignItems: 'center', gap: 3 },
  totalBannerLabel: { fontSize: 11, color: TS, fontWeight: '600', letterSpacing: 0.5 },
  totalBannerVal: { fontSize: 28, fontWeight: '800' },
  totalBannerSub: { fontSize: 12, color: TS },

  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: SURF, borderRadius: 12, padding: 12, gap: 12, borderWidth: 1, borderColor: BOR },
  txIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txEmoji: { fontSize: 19 },
  txBody: { flex: 1, gap: 4 },
  txDesc: { fontSize: 13, fontWeight: '700', color: TP },
  txMeta: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  txBoat: { fontSize: 11, color: TS },
  txTrip: { fontSize: 11, color: TEAL },
  txDate: { fontSize: 11, color: TS },
  txAmount: { fontSize: 14, fontWeight: '800' },
})